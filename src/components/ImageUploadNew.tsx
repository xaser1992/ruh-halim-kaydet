import { useState } from "react";
import { Camera, CameraResultType } from "@capacitor/camera";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Camera as CameraIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  language: "tr" | "en" | "de" | "fr" | "es" | "it" | "ru";
  theme: "light" | "dark" | "feminine";
  maxImages?: number;
}

const translations = {
  tr: {
    upload: "Fotoğraf Yükle",
    takePhoto: "Fotoğraf Çek",
    remove: "Sil",
    maxImages: "Maksimum {max} fotoğraf yükleyebilirsiniz",
    uploadError: "Fotoğraf yüklenirken hata oluştu",
    selectOrDrop: "Fotoğraf seçin veya sürükleyip bırakın",
  },
  en: {
    upload: "Upload Photo",
    takePhoto: "Take Photo",
    remove: "Remove",
    maxImages: "You can upload maximum {max} photos",
    uploadError: "Error uploading photo",
    selectOrDrop: "Select or drag and drop photos",
  },
  de: {
    upload: "Foto hochladen",
    takePhoto: "Foto machen",
    remove: "Entfernen",
    maxImages: "Sie können maximal {max} Fotos hochladen",
    uploadError: "Fehler beim Hochladen des Fotos",
    selectOrDrop: "Wählen oder ziehen Sie Fotos",
  },
  fr: {
    upload: "Télécharger une photo",
    takePhoto: "Prendre une photo",
    remove: "Supprimer",
    maxImages: "Vous pouvez télécharger un maximum de {max} photos",
    uploadError: "Erreur lors du téléchargement de la photo",
    selectOrDrop: "Sélectionnez ou faites glisser des photos",
  },
  es: {
    upload: "Subir foto",
    takePhoto: "Tomar foto",
    remove: "Eliminar",
    maxImages: "Puede cargar un máximo de {max} fotos",
    uploadError: "Error al cargar la foto",
    selectOrDrop: "Seleccione o arrastre fotos",
  },
  it: {
    upload: "Carica foto",
    takePhoto: "Scatta foto",
    remove: "Rimuovi",
    maxImages: "Puoi caricare un massimo di {max} foto",
    uploadError: "Errore nel caricamento della foto",
    selectOrDrop: "Seleziona o trascina le foto",
  },
  ru: {
    upload: "Загрузить фото",
    takePhoto: "Сделать фото",
    remove: "Удалить",
    maxImages: "Вы можете загрузить максимум {max} фотографий",
    uploadError: "Ошибка при загрузке фото",
    selectOrDrop: "Выберите или перетащите фотографии",
  },
};

export const ImageUploadNew = ({
  images,
  onImagesChange,
  language,
  theme,
  maxImages = 5,
}: ImageUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const t = translations[language] || translations.tr;

  const uploadToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("mood-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("mood-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > maxImages) {
      toast.error(t.maxImages.replace("{max}", maxImages.toString()));
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadToStorage(file);
      if (url) newImages.push(url);
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    } else {
      toast.error(t.uploadError);
    }

    setUploading(false);
  };

  const takePhoto = async () => {
    if (images.length >= maxImages) {
      toast.error(t.maxImages.replace("{max}", maxImages.toString()));
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });

      if (photo.webPath) {
        setUploading(true);
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        
        const url = await uploadToStorage(file);
        if (url) {
          onImagesChange([...images, url]);
        } else {
          toast.error(t.uploadError);
        }
        setUploading(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract file path from URL
    const urlParts = imageUrl.split("/mood-images/");
    if (urlParts.length === 2 && user) {
      const filePath = urlParts[1];
      
      // Delete from storage
      await supabase.storage.from("mood-images").remove([filePath]);
    }

    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.selectOrDrop}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {t.upload}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={takePhoto}
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                {t.takePhoto}
              </Button>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};