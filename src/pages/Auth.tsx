import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, register, login } = useAuth();
  const navigate = useNavigate();

  // Eğer kullanıcı zaten giriş yaptıysa ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setTimeout(() => toast.error('Lütfen tüm alanları doldurun'), 100);
      return;
    }

    if (!isLogin && !name) {
      setTimeout(() => toast.error('Lütfen adınızı girin'), 100);
      return;
    }

    if (password.length < 6) {
      setTimeout(() => toast.error('Şifre en az 6 karakter olmalıdır'), 100);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await login(username, password);
        if (error) {
          setTimeout(() => toast.error(error), 100);
        } else {
          setTimeout(() => toast.success('Giriş başarılı!'), 100);
          navigate('/');
        }
      } else {
        const { error } = await register(name, username, password);
        if (error) {
          setTimeout(() => toast.error(error), 100);
        } else {
          setTimeout(() => toast.success('Kayıt başarılı!'), 100);
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? 'Hesabınıza giriş yapın'
              : 'Yeni bir hesap oluşturun'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınızı girin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'İşlem yapılıyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin);
                setName('');
                setUsername('');
                setPassword('');
              }}
              disabled={loading}
            >
              {isLogin
                ? "Hesabınız yok mu? Kayıt olun"
                : "Hesabınız var mı? Giriş yapın"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
