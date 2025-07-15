
import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage: string | null;
}

export const ImageUpload = ({ onImageUpload, currentImage }: ImageUploadProps) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleRemoveImage = () => {
    onImageUpload('');
  };

  return (
    <div className="space-y-3">
      {currentImage ? (
        <div className="relative inline-block">
          <img 
            src={currentImage} 
            alt="Uploaded medical image" 
            className="max-w-32 h-20 object-cover rounded-lg border-2 border-green-200 shadow-sm dark:border-green-600"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-200" />
              <span className="text-sm font-medium text-blue-700  dark:text-blue-100">Upload Medical Image</span>
            </div>
          </label>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <ImageIcon className="h-3 w-3" />
            <span>JPG, PNG, DICOM supported</span>
          </div>
        </div>
      )}
    </div>
  );
};
