
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthButtonProps {
  theme: 'light' | 'dark' | 'feminine';
}

export const AuthButton = ({ theme }: AuthButtonProps) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Giriş Hatası",
        description: error.message || "Google ile giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yapıldı.",
      });
    } catch (error: any) {
      toast({
        title: "Çıkış Hatası",
        description: error.message || "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-700/50 text-gray-300' 
            : theme === 'feminine'
            ? 'bg-pink-100/50 text-pink-700'
            : 'bg-gray-100/50 text-gray-700'
        }`}>
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className={`transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800/70 border-gray-600 text-gray-300 hover:bg-gray-700/70' 
              : theme === 'feminine'
              ? 'bg-pink-50/70 border-pink-300 text-pink-700 hover:bg-pink-100/70'
              : 'bg-white/70 border-gray-200 hover:bg-white/90'
          }`}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className={`flex items-center gap-2 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/70 border-gray-600 text-gray-300 hover:bg-gray-700/70' 
          : theme === 'feminine'
          ? 'bg-pink-50/70 border-pink-300 text-pink-700 hover:bg-pink-100/70'
          : 'bg-white/70 border-gray-200 hover:bg-white/90'
      }`}
    >
      <LogIn className="w-4 h-4" />
      Google ile Giriş
    </Button>
  );
};
