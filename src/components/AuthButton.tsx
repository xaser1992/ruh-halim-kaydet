import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AuthButtonProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

export const AuthButton = ({ language, theme }: AuthButtonProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.full_name || '');

  const texts = {
    tr: {
      signIn: "Google ile Giriş Yap",
      signOut: "Çıkış Yap", 
      profile: "Profil",
      displayName: "Görünen Ad",
      updateProfile: "Profili Güncelle",
      signInSuccess: "Giriş başarılı",
      signOutSuccess: "Çıkış yapıldı",
      updateSuccess: "Profil güncellendi",
      signInError: "Giriş hatası",
      updateError: "Güncelleme hatası"
    },
    en: {
      signIn: "Sign in with Google",
      signOut: "Sign Out",
      profile: "Profile", 
      displayName: "Display Name",
      updateProfile: "Update Profile",
      signInSuccess: "Signed in successfully",
      signOutSuccess: "Signed out successfully",
      updateSuccess: "Profile updated",
      signInError: "Sign in error",
      updateError: "Update error"
    }
  };

  const t = texts[language] || texts.tr;

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: t.signInError,
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: t.signInError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: t.signInError,
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t.signOutSuccess
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: displayName,
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: t.updateError,
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t.updateSuccess
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: t.updateError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const themeClasses = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700', 
    feminine: 'bg-pink-50 border-pink-200'
  };

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="gap-2"
        variant="outline"
      >
        <LogIn className="h-4 w-4" />
        {t.signIn}
      </Button>
    );
  }

  if (showForm) {
    return (
      <Card className={`w-full max-w-md ${themeClasses[theme]}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.profile}
          </CardTitle>
          <CardDescription>
            {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t.displayName}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Adınız"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={updateProfile}
              disabled={isLoading}
              className="flex-1"
            >
              {t.updateProfile}
            </Button>
            
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
          </div>
          
          <Button
            onClick={signOut}
            disabled={isLoading}
            variant="destructive"
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            {t.signOut}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        className="gap-2"
      >
        <User className="h-4 w-4" />
        {profile?.full_name || user.email?.split('@')[0] || t.profile}
      </Button>
      
      <Button
        onClick={signOut}
        disabled={isLoading}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};