'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  shopId: string;
  initialImage?: string;
  onImageUploaded: (imageUrl: string, imageKey: string) => void;
  className?: string;
}

export function ImageUpload({
  shopId,
  initialImage,
  onImageUploaded,
  className = '',
}: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file);
      setImage(localPreview);

      // In a real app, we would upload to S3 here
      // For now, we'll just simulate a successful upload
      setTimeout(() => {
        // Mock successful upload
        const mockImageKey = `${shopId}/images/${Date.now()}-${file.name}`;
        const mockImageUrl = localPreview;
        
        // Call the callback with the uploaded image URL and key
        onImageUploaded(mockImageUrl, mockImageKey);
        setIsUploading(false);
      }, 1500);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setImage(null);
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    onImageUploaded('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {image ? (
        <div className="relative w-full aspect-square max-w-xs rounded-md overflow-hidden border">
          <img
            src={image}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="flex flex-col items-center justify-center w-full aspect-square max-w-xs rounded-md border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-primary transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                Click to upload an image
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                PNG, JPG or WEBP (max. 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}

      {!image && !isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="mt-4"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      )}
    </div>
  );
}
