import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImagePlus, Camera, X } from "lucide-react";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

type Language = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  language: Language;
  theme: 'light' | 'dark' | 'feminine';
  maxImages?: number;
}

export const ImageUpload = ({ 
  images, 
  onImagesChange, 
  language, 
  theme, 
  maxImages = 5 
}: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [loadingImages, setLoadingImages] = useState<boolean[]>([]);

  const translations = {
    tr: {
      addPhoto: "Fotoğraf Ekle",
      takePhoto: "Fotoğraf Çek",
      dragDrop: "Fotoğraf sürükleyip bırakın veya tıklayın",
      maxPhotos: `En fazla ${maxImages} fotoğraf`,
      removePhoto: "Fotoğrafı kaldır",
      loading: "Yükleniyor..."
    },
    en: {
      addPhoto: "Add Photo",
      takePhoto: "Take Photo",
      dragDrop: "Drag and drop photos or click",
      maxPhotos: `Maximum ${maxImages} photos`,
      removePhoto: "Remove photo",
      loading: "Loading..."
    },
    de: {
      addPhoto: "Foto hinzufügen",
      takePhoto: "Foto aufnehmen",
      dragDrop: "Fotos ziehen und ablegen oder klicken",
      maxPhotos: `Maximal ${maxImages} Fotos`,
      removePhoto: "Foto entfernen",
      loading: "Wird geladen..."
    },
    fr: {
      addPhoto: "Ajouter une photo",
      takePhoto: "Prendre une photo",
      dragDrop: "Glissez-déposez des photos ou cliquez",
      maxPhotos: `Maximum ${maxImages} photos`,
      removePhoto: "Supprimer la photo",
      loading: "Chargement..."
    },
    es: {
      addPhoto: "Añadir foto",
      takePhoto: "Tomar foto",
      dragDrop: "Arrastra y suelta fotos o haz clic",
      maxPhotos: `Máximo ${maxImages} fotos`,
      removePhoto: "Eliminar foto",
      loading: "Cargando..."
    },
    it: {
      addPhoto: "Aggiungi foto",
      takePhoto: "Scatta foto",
      dragDrop: "Trascina e rilascia le foto o clicca",
      maxPhotos: `Massimo ${maxImages} foto`,
      removePhoto: "Rimuovi foto",
      loading: "Caricamento..."
    },
    ru: {
      addPhoto: "Добавить фото",
      takePhoto: "Сделать фото",
      dragDrop: "Перетащите фото или нажмите",
      maxPhotos: `Максимум ${maxImages} фото`,
      removePhoto: "Удалить фото",
      loading: "Загрузка..."
    }
  };

  const t = translations[language];

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    if (filesToProcess === 0) return;

    // Initialize loading states
    const newLoadingStates = Array(filesToProcess).fill(true);
    setLoadingImages(prev => [...prev, ...newLoadingStates]);

    const newImages: string[] = [];
    const loadingPromises: Promise<void>[] = [];

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const promise = new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              newImages.push(e.target.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
        loadingPromises.push(promise);
      }
    }

    // Wait for all images to load
    await Promise.all(loadingPromises);
    
    // Update images and clear loading states
    onImagesChange([...images, ...newImages]);
    setLoadingImages(prev => prev.slice(0, prev.length - filesToProcess));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        onImagesChange([...images, image.dataUrl]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const canAddMore = images.length + loadingImages.length < maxImages;

  return (
    <div className="space-y-2">
      {canAddMore && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="file"
              id="image-upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <label htmlFor="image-upload">
              <Card
                className={`p-3 border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? theme === 'feminine'
                      ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : theme === 'dark'
                    ? 'border-gray-600 bg-gray-800/50 hover:border-purple-500'
                    : theme === 'feminine'
                    ? 'border-pink-300 bg-pink-25 hover:border-pink-400'
                    : 'border-gray-300 bg-gray-50 hover:border-purple-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <ImagePlus className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                    }`}>
                      {t.addPhoto}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
                    }`}>
                      {t.maxPhotos}
                    </p>
                  </div>
                </div>
              </Card>
            </label>
          </div>
          
          <Card
            className={`p-3 border-2 cursor-pointer transition-all duration-200 ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-800/50 hover:border-purple-500'
                : theme === 'feminine'
                ? 'border-pink-300 bg-pink-25 hover:border-pink-400'
                : 'border-gray-300 bg-gray-50 hover:border-purple-400'
            }`}
            onClick={takePhoto}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <Camera className={`w-6 h-6 ${
                theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                }`}>
                  {t.takePhoto}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {(images.length > 0 || loadingImages.length > 0) && (
        <div className="grid grid-cols-5 gap-1">
          {images.map((image, index) => (
            <div key={`image-${index}`} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-16 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                title={t.removePhoto}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {loadingImages.map((_, index) => (
            <div key={`loading-${index}`} className="relative">
              <Skeleton className="w-full h-16 rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
