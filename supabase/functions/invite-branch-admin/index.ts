import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get authorization header to verify the caller is a super_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify they're a super admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callingUser) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is super_admin using service client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleCheckError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (roleCheckError || !roleData) {
      console.error('Role check error:', roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Only super admins can invite branch admins' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, password, fullName, branchId } = await req.json();

    if (!email || !password || !branchId) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and branchId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating user:', email, 'for branch:', branchId);

    // Create user with admin API (doesn't affect current session)
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = authData.user.id;
    console.log('User created:', newUserId);

    // Add branch_admin role
    const { error: roleError } = await serviceClient
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role: 'branch_admin',
      });

    if (roleError) {
      console.error('Role error:', roleError);
      // Cleanup: delete the user if role assignment fails
      await serviceClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: 'Failed to assign role: ' + roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Role assigned');

    // Assign to branch
    const { data: assignmentData, error: assignError } = await serviceClient
      .from('branch_admins')
      .insert({
        user_id: newUserId,
        branch_id: branchId,
        assigned_by: callingUser.id,
      })
      .select(`
        id,
        user_id,
        branch_id,
        assigned_at,
        branch:branches(name, city:cities(name))
      `)
      .single();

    if (assignError) {
      console.error('Assignment error:', assignError);
      // Cleanup: delete role and user
      await serviceClient.from('user_roles').delete().eq('user_id', newUserId);
      await serviceClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: 'Failed to assign branch: ' + assignError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Branch assigned successfully');

    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          ...assignmentData,
          profile: { email, full_name: fullName },
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
