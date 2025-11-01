import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Send OTP to email
  const sendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'OTP gönderilemedi' };
    }
  };

  // Verify OTP code
  const verifyOTP = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Kod doğrulanamadı' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!user
  };
};
