import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage'dan kullanıcıyı yükle
    const loadUser = async () => {
      const savedUserId = localStorage.getItem('ruh-halim-user-id');
      const savedUsername = localStorage.getItem('ruh-halim-username');
      const savedName = localStorage.getItem('ruh-halim-name');

      if (savedUserId && savedUsername) {
        setUser({ id: savedUserId, username: savedUsername, name: savedName || '' });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (name: string, username: string, password: string) => {
    try {
      // Şifreyi hashle
      const { data: hashedPassword } = await supabase.rpc('hash_password', { password });

      // Yeni kullanıcı oluştur
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name,
          username,
          password: hashedPassword
        })
        .select()
        .single();

      if (error) {
        // Unique constraint hatası kontrolü
        if (error.code === '23505') {
          return { error: 'Bu kullanıcı adı zaten alınmış' };
        }
        throw error;
      }

      // Kullanıcı ayarlarını oluştur
      await supabase
        .from('user_settings')
        .insert({
          user_id: newUser.id,
          theme: 'light',
          language: 'tr'
        });

      // localStorage'a kaydet
      localStorage.setItem('ruh-halim-user-id', newUser.id);
      localStorage.setItem('ruh-halim-username', newUser.username);
      localStorage.setItem('ruh-halim-name', newUser.name || '');

      setUser({ id: newUser.id, username: newUser.username, name: newUser.name || '' });

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Kayıt sırasında bir hata oluştu' };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Şifreyi hashle
      const { data: hashedPassword } = await supabase.rpc('hash_password', { password });

      // Kullanıcıyı bul
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', hashedPassword)
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        return { error: 'Kullanıcı adı veya şifre hatalı' };
      }

      // localStorage'a kaydet
      localStorage.setItem('ruh-halim-user-id', user.id);
      localStorage.setItem('ruh-halim-username', user.username);
      localStorage.setItem('ruh-halim-name', user.name || '');

      setUser({ id: user.id, username: user.username, name: user.name || '' });

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Giriş sırasında bir hata oluştu' };
    }
  };

  const logout = () => {
    localStorage.removeItem('ruh-halim-user-id');
    localStorage.removeItem('ruh-halim-username');
    localStorage.removeItem('ruh-halim-name');
    setUser(null);
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };
};
