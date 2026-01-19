import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        let isAdmin = false;
        if (user) {
          // Check admin role using the has_role function via RPC
          const { data } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });
          isAdmin = data === true;
        }

        setAuthState({
          user,
          session,
          isLoading: false,
          isAdmin,
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      
      let isAdmin = false;
      if (user) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        isAdmin = data === true;
      }

      setAuthState({
        user,
        session,
        isLoading: false,
        isAdmin,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
}
