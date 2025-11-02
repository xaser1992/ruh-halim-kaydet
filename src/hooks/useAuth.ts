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
      const response = await supabase.functions.invoke('send-otp', {
        body: { email }
      });

      if (response.error) throw response.error;
      if (!response.data?.status || response.data.status !== 'ok') {
        throw new Error(response.data?.error || 'OTP gönderilemedi');
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'OTP gönderilemedi' };
    }
  };

  // Verify OTP code
  const verifyOTP = async (email: string, token: string) => {
    try {
      console.log('OTP doğrulanıyor...', { email, token });
      
      const response = await supabase.functions.invoke('verify-otp', {
        body: { email, code: token }
      });

      console.log('Backend response:', response);

      if (response.error) throw response.error;
      if (!response.data?.status || response.data.status !== 'ok') {
        throw new Error(response.data?.error || 'Kod doğrulanamadı');
      }

      // Backend'den hashed_token gelirse, Supabase'in kendi verifyOtp'sine gönder
      if (response.data.hashed_token) {
        console.log('Hashed token alındı, Supabase auth ile doğrulanıyor...');
        
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          email: response.data.email,
          token: response.data.hashed_token,
          type: 'email'
        });
        
        console.log('Supabase auth result:', { authData, authError });
        
        if (authError) {
          console.error('Supabase auth hatası:', authError);
          // Hata olsa bile session kurulmaya çalışalım
        }
      }
      
      // Email OTP varsa da dene
      if (response.data.email_otp && !response.data.hashed_token) {
        console.log('Email OTP ile deneniyor...');
        
        const { error: authError } = await supabase.auth.verifyOtp({
          email: response.data.email,
          token: response.data.email_otp,
          type: 'email'
        });
        
        if (authError) {
          console.error('Email OTP hatası:', authError);
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('verifyOTP error:', error);
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
