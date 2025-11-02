import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';

export default function Auth() {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  // Eğer kullanıcı zaten giriş yaptıysa ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);

    try {
      const { error } = await sendOTP(email);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Doğrulama kodu e-postanıza gönderildi!');
        setStep('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setLoading(true);

    try {
      const { error } = await verifyOTP(email, otpCode);
      if (error) {
        toast.error('Kod doğrulanamadı. Lütfen tekrar deneyin.');
        setLoading(false);
      } else {
        toast.success('Giriş başarılı!');
        // Backend doğrulaması başarılı - yönlendir
        // Session kurulup kurulmadığına bakmadan yönlendir
        // useAuth hook'u zaten session'ı yakalayacak
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 'email' ? 'Giriş Yap' : 'Kodu Doğrula'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email'
              ? 'E-posta adresinizi girin'
              : 'E-postanıza gönderilen 6 haneli kodu girin'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Doğrulama Kodu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {email} adresine gönderildi
                </p>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('email');
                    setOtpCode('');
                  }}
                  disabled={loading}
                >
                  Farklı e-posta ile giriş yap
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}