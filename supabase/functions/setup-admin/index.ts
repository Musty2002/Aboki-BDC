import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, fullName, setupKey } = await req.json();

    // Simple setup key validation (you should change this!)
    const expectedSetupKey = Deno.env.get('ADMIN_SETUP_KEY') || 'aboki-admin-setup-2024';
    
    if (setupKey !== expectedSetupKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid setup key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if super_admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);

    if (checkError) {
      throw new Error(`Error checking existing admins: ${checkError.message}`);
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: 'A super admin already exists. Use the admin dashboard to add more admins.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || 'Super Admin' },
    });

    if (authError) {
      throw new Error(`Error creating user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Add super_admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'super_admin',
      });

    if (roleError) {
      // Cleanup: delete the user if role assignment fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Error assigning role: ${roleError.message}`);
    }

    console.log(`Super admin created successfully: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admin created successfully',
        email: authData.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in setup-admin:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
