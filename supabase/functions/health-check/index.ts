import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to keep database active
    const { count, error } = await supabase
      .from('rate_alerts')
      .select('*', { count: 'exact', head: true });

    const responseTimeMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const dbConnected = !error;

    // Log the health check to database
    const { error: logError } = await supabase
      .from('health_check_logs')
      .insert({
        status: dbConnected ? 'healthy' : 'unhealthy',
        db_connected: dbConnected,
        alerts_count: count || 0,
        response_time_ms: responseTimeMs,
        source: 'edge_function'
      });

    if (logError) {
      console.error('Failed to log health check:', logError);
    }

    console.log(`Health check successful at ${timestamp} - ${responseTimeMs}ms`);

    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp,
        db_connected: dbConnected,
        alerts_count: count || 0,
        response_time_ms: responseTimeMs
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const responseTimeMs = Date.now() - startTime;
    console.error('Health check error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('health_check_logs').insert({
        status: 'error',
        db_connected: false,
        response_time_ms: responseTimeMs,
        source: 'edge_function'
      });
    } catch (logErr) {
      console.error('Failed to log error:', logErr);
    }

    return new Response(
      JSON.stringify({ status: 'error', message, response_time_ms: responseTimeMs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
