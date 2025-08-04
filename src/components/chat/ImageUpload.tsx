
import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageUpload: (imageUrls: string[]) => void;
  currentImages: string[];
}

export const ImageUpload = ({ onImageUpload, currentImages }: ImageUploadProps) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      const readers = validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(results => {
        onImageUpload([...currentImages, ...results]);
      });
    }
    
    // Reset input
    event.target.value = '';
  }, [onImageUpload, currentImages]);

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImageUpload(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image Previews */}
      {currentImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentImages.map((image, index) => (
            <div key={index} className="relative inline-block">
              <img 
                src={image} 
                alt={`Uploaded medical image ${index + 1}`} 
                className="w-20 h-20 object-cover rounded-lg border-2 border-green-200 shadow-sm dark:border-green-600"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Button */}
      <div className="flex items-center space-x-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
            <Upload className="h-4 w-4 text-blue-600 dark:text-blue-200" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-100">
              {currentImages.length > 0 ? 'Add More Images' : 'Upload Medical Images'}
            </span>
          </div>
        </label>
        
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <ImageIcon className="h-3 w-3" />
          <span>JPG, PNG, DICOM supported</span>
        </div>
      </div>
    </div>
  );
};
