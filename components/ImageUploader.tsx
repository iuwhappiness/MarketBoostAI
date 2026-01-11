
import React, { useState, useCallback, useEffect } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onImagesChange: (images: ImageFile[]) => void;
  initialImages: ImageFile[];
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Gagal membaca file sebagai string base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange, initialImages }) => {
  const [images, setImages] = useState<ImageFile[]>(initialImages);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);
    const newImages: ImageFile[] = [...images];
    const incomingFiles = Array.from(files);

    if (newImages.length + incomingFiles.length > 8) {
      setError("Anda hanya dapat mengunggah maksimal 8 gambar.");
      return;
    }
    
    for (const file of incomingFiles) {
      if (file instanceof File) {
        if (!file.type.startsWith('image/')) {
          setError("Mohon unggah file gambar saja.");
          continue;
        }
         try {
          const base64 = await fileToBase64(file);
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
            base64: base64,
          });
         } catch (e) {
           setError("Tidak dapat memproses salah satu file.");
         }
      }
    }
    
    const finalImages = newImages.slice(0, 8);
    setImages(finalImages);
    onImagesChange(finalImages);
  }, [images, onImagesChange]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Foto Produk (maks. 8 foto) <span className="text-red-500">*</span>
      </label>
      <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 py-10 hover:border-indigo-500 hover:bg-gray-800/30 transition-colors">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4 flex text-sm leading-6 text-gray-400">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-semibold text-purple-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-purple-500"
            >
              <span>Klik untuk unggah</span>
              <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
            </label>
            <p className="pl-1">atau seret foto ke sini</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">Format: PNG, JPG, GIF | Maks. 10MB per foto</p>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2 animate-pulse">{error}</p>}
      
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img src={image.preview} alt={`preview ${index}`} className="h-24 w-full object-cover rounded-md border border-gray-700" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                aria-label="Hapus gambar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
