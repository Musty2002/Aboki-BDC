import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateData {
  currency: string;
  buyRate: number;
  sellRate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current rates from request body
    const { rates } = await req.json() as { rates: RateData[] };
    
    if (!rates || !Array.isArray(rates)) {
      return new Response(
        JSON.stringify({ error: 'Missing rates data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${rates.length} rates against alerts...`);

    // Get all enabled alerts with their push tokens
    const { data: alerts, error: alertsError } = await supabase
      .from('rate_alerts')
      .select(`
        *,
        push_subscriptions (
          endpoint
        )
      `)
      .eq('enabled', true)
      .is('triggered_at', null);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      console.log('No active alerts to check');
      return new Response(
        JSON.stringify({ checked: 0, triggered: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${alerts.length} active alerts`);

    const triggeredAlerts: string[] = [];

    for (const alert of alerts) {
      const rateInfo = rates.find(r => r.currency === alert.currency);
      if (!rateInfo) continue;

      const currentRate = alert.alert_type === 'above' ? rateInfo.sellRate : rateInfo.buyRate;
      const triggered = alert.alert_type === 'above'
        ? currentRate >= alert.target_rate
        : currentRate <= alert.target_rate;

      if (triggered && alert.push_subscriptions?.endpoint && fcmServerKey) {
        console.log(`Alert triggered: ${alert.currency} ${alert.alert_type} ${alert.target_rate}`);
        
        // Send push notification via FCM
        try {
          const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${fcmServerKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: alert.push_subscriptions.endpoint,
              notification: {
                title: `🔔 Rate Alert: ${alert.currency}`,
                body: `${alert.currency} is now ${alert.alert_type} ₦${alert.target_rate.toLocaleString()}! Current: ₦${currentRate.toLocaleString()}`,
                sound: 'default',
              },
              data: {
                alertId: alert.id,
                currency: alert.currency,
                targetRate: String(alert.target_rate),
                currentRate: String(currentRate),
              },
              priority: 'high',
            }),
          });

          const fcmResult = await fcmResponse.json();
          console.log('FCM Response:', fcmResult);

          if (fcmResult.success > 0) {
            triggeredAlerts.push(alert.id);
            
            // Mark alert as triggered
            await supabase
              .from('rate_alerts')
              .update({ triggered_at: new Date().toISOString() })
              .eq('id', alert.id);
          }
        } catch (pushError) {
          console.error('Error sending push:', pushError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        checked: alerts.length, 
        triggered: triggeredAlerts.length,
        triggeredIds: triggeredAlerts 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking rate alerts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
