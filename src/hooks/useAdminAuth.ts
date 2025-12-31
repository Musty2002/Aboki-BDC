import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export type AdminRole = 'super_admin' | 'branch_admin';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  role: AdminRole | null;
  assignedBranchIds: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    role: null,
    assignedBranchIds: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchAdminRole = useCallback(async (userId: string) => {
    // Check for super_admin role
    const { data: superAdminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (superAdminRole) {
      return { role: 'super_admin' as AdminRole, branchIds: [] };
    }

    // Check for branch_admin role
    const { data: branchAdminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'branch_admin')
      .maybeSingle();

    if (branchAdminRole) {
      // Get assigned branches
      const { data: assignments } = await supabase
        .from('branch_admins')
        .select('branch_id')
        .eq('user_id', userId);

      return {
        role: 'branch_admin' as AdminRole,
        branchIds: assignments?.map(a => a.branch_id) || [],
      };
    }

    return { role: null, branchIds: [] };
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer role fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const { role, branchIds } = await fetchAdminRole(session.user.id);
            setState(prev => ({
              ...prev,
              role,
              assignedBranchIds: branchIds,
              isLoading: false,
              isAuthenticated: role !== null,
            }));
          }, 0);
        } else {
          setState(prev => ({
            ...prev,
            role: null,
            assignedBranchIds: [],
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { role, branchIds } = await fetchAdminRole(session.user.id);
        setState({
          session,
          user: session.user,
          role,
          assignedBranchIds: branchIds,
          isLoading: false,
          isAuthenticated: role !== null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAdminRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      role: null,
      assignedBranchIds: [],
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...state,
    signIn,
    signOut,
    isSuperAdmin: state.role === 'super_admin',
    isBranchAdmin: state.role === 'branch_admin',
  };
}
