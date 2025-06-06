
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LicenseInfo = () => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Lisans ve Telif Hakkı</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Telif Hakkı</h2>
            <p className="mb-4">
              © 2024 Ruh Halim. Tüm hakları saklıdır.
            </p>

            <h2 className="text-xl font-semibold mb-4">Uygulama Lisansı</h2>
            <p className="mb-4">
              Bu uygulama [Lisans türünü buraya ekleyin] lisansı altında dağıtılmaktadır.
            </p>

            <h2 className="text-xl font-semibold mb-4">Kullanılan Açık Kaynak Kütüphaneler</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>React - MIT License</li>
              <li>Tailwind CSS - MIT License</li>
              <li>Lucide React - ISC License</li>
              <li>Radix UI - MIT License</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">Geliştirici</h2>
            <p className="mb-4">
              Bu uygulama [Geliştirici adınızı buraya ekleyin] tarafından geliştirilmiştir.
            </p>

            <h2 className="text-xl font-semibold mb-4">Sürüm Bilgisi</h2>
            <p className="mb-4">
              Sürüm: 1.0.0<br/>
              Son Güncelleme: 2024
            </p>

            <h2 className="text-xl font-semibold mb-4">İletişim</h2>
            <p>
              Lisans hakkında sorularınız için: [E-posta adresinizi buraya ekleyin]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseInfo;
