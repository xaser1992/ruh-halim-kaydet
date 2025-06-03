
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  language: 'tr' | 'en';
  theme: 'light' | 'dark';
  maxImages?: number;
}

export const ImageUpload = ({ 
  images, 
  onImagesChange, 
  language, 
  theme, 
  maxImages = 3 
}: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);

  const translations = {
    tr: {
      addPhoto: "Fotoğraf Ekle",
      dragDrop: "Fotoğraf sürükleyip bırakın veya tıklayın",
      maxPhotos: `En fazla ${maxImages} fotoğraf`,
      removePhoto: "Fotoğrafı kaldır"
    },
    en: {
      addPhoto: "Add Photo",
      dragDrop: "Drag and drop photos or click",
      maxPhotos: `Maximum ${maxImages} photos`,
      removePhoto: "Remove photo"
    }
  };

  const t = translations[language];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === filesToProcess) {
              onImagesChange([...images, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
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

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {canAddMore && (
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
              className={`p-4 border-2 border-dashed cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-purple-500'
                  : 'border-gray-300 bg-gray-50 hover:border-purple-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <ImagePlus className={`w-8 h-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {t.addPhoto}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {t.dragDrop}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {t.maxPhotos}
                  </p>
                </div>
              </div>
            </Card>
          </label>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                title={t.removePhoto}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
