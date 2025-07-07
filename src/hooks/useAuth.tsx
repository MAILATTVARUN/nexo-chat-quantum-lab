
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Update user online status
        if (session?.user) {
          setTimeout(() => {
            updateOnlineStatus(session.user.id, true);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        setTimeout(() => {
          updateOnlineStatus(session.user.id, true);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateOnlineStatus = async (userId: string, online: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          online_status: online,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating online status:', error);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const signOut = async () => {
    if (user) {
      await updateOnlineStatus(user.id, false);
    }
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut
  };
}
