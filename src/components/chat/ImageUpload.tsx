import React, { useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (imageUrls: string[]) => void;
  currentImages: string[];
}

export const ImageUpload = ({
  onImageUpload,
  currentImages,
}: ImageUploadProps) => {
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const validFiles = files.filter((file) => file.type.startsWith("image/"));

      if (validFiles.length > 0) {
        const readers = validFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
        });

        Promise.all(readers).then((results) => {
          onImageUpload([...currentImages, ...results]);
        });
      }

      // Reset input
      event.target.value = "";
    },
    [onImageUpload, currentImages]
  );

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImageUpload(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image Previews */}
      {currentImages.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
          {currentImages.map((image, index) => (
            <div key={index} className="relative inline-block flex-shrink-0">
              <img
                src={image}
                alt={`Uploaded medical image ${index + 1}`}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border-2 border-green-200 shadow-sm dark:border-green-600"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-5 w-5 md:h-6 md:w-6 rounded-full p-0"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <label className="cursor-pointer flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
            <Upload className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-200" />
            <span className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-100">
              {currentImages.length > 0
                ? "Add More Images"
                : "Upload Medical Images"}
            </span>
          </div>
        </label>

        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <ImageIcon className="h-3 w-3" />
          <span className="hidden sm:inline">JPG, PNG, DICOM supported</span>
          <span className="sm:hidden">JPG, PNG, DICOM</span>
        </div>
      </div>
    </div>
  );
};
