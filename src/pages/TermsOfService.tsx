
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Kullanıcı Sözleşmesi</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Kabul Edilen Şartlar</h2>
            <p className="mb-4">
              Ruh Halim uygulamasını kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
            </p>

            <h2 className="text-xl font-semibold mb-4">Uygulama Kullanımı</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Uygulama kişisel kullanım içindir</li>
              <li>Yasadışı amaçlarla kullanılamaz</li>
              <li>İçerikler kişisel ve özeldir</li>
              <li>Teknik sorunlar için destek sağlanır</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">Sorumluluk Reddi</h2>
            <p className="mb-4">
              Bu uygulama genel ruh hali takibi için tasarlanmıştır. 
              Tıbbi tavsiye yerine geçmez. Ciddi durumlarda profesyonel yardım alınması önerilir.
            </p>

            <h2 className="text-xl font-semibold mb-4">Değişiklikler</h2>
            <p className="mb-4">
              Bu sözleşme gerektiğinde güncellenebilir. 
              Önemli değişiklikler uygulama içinde bildirilecektir.
            </p>

            <h2 className="text-xl font-semibold mb-4">İletişim</h2>
            <p>
              Sözleşme hakkında sorularınız için: [E-posta adresinizi buraya ekleyin]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
