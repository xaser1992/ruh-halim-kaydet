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

      console.log('✅ Backend OTP doğrulaması başarılı! Session kuruluyor...');

      // Backend'den dönen session bilgilerini kullan
      if (!response.data.session?.access_token || !response.data.session?.refresh_token) {
        throw new Error('Session bilgileri alınamadı');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
      });

      if (sessionError) {
        console.error('Supabase session kurulamadı:', sessionError);
        throw new Error('Giriş yapılamadı, lütfen tekrar deneyin.');
      }

      console.log('🎉 Supabase session başarıyla kuruldu!');
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
