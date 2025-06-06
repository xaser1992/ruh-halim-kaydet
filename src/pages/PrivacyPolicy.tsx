
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Gizlilik Politikası</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Veri Toplama ve Kullanım</h2>
            <p className="mb-4">
              Ruh Halim uygulaması, tüm verilerinizi yerel olarak cihazınızda saklar. 
              Hiçbir kişisel veri sunucularımıza gönderilmez veya üçüncü taraflarla paylaşılmaz.
            </p>

            <h2 className="text-xl font-semibold mb-4">Saklanan Veriler</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Ruh haliniz kayıtları</li>
              <li>Yüklediğiniz fotoğraflar</li>
              <li>Günlük notlarınız</li>
              <li>Uygulama tercihleri (tema, dil)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">Veri Güvenliği</h2>
            <p className="mb-4">
              Tüm verileriniz cihazınızın yerel depolama alanında şifrelenerek saklanır. 
              Bu veriler yalnızca sizin erişiminizde olup, internet bağlantısı gerektirmez.
            </p>

            <h2 className="text-xl font-semibold mb-4">İletişim</h2>
            <p>
              Gizlilik politikası hakkında sorularınız için: [E-posta adresinizi buraya ekleyin]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
