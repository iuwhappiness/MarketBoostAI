
import React from 'react';
import { ImageUploader } from './ImageUploader';
import { Tooltip } from './Tooltip';
import { SparklesIcon } from './icons/SparklesIcon';
import { Marketplace, CopywritingStyle, ImageFile } from '../types';
import { MARKETPLACE_OPTIONS, COPYWRITING_STYLE_OPTIONS } from '../constants';

interface ProductFormProps {
  images: ImageFile[];
  setImages: (images: ImageFile[]) => void;
  productName: string;
  setProductName: (name: string) => void;
  materials: string;
  setMaterials: (mat: string) => void;
  targetMarket: string;
  setTargetMarket: (market: string) => void;
  estimatedPrice: string;
  setEstimatedPrice: (price: string) => void;
  platform: Marketplace | '';
  setPlatform: (p: Marketplace) => void;
  copywritingStyle: CopywritingStyle;
  setCopywritingStyle: (s: CopywritingStyle) => void;
  additionalBrief: string;
  setAdditionalBrief: (brief: string) => void;
  loading: boolean;
  handleGenerate: () => void;
  handleSaveProject: () => void;
  currentProjectId: string | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  images, setImages,
  productName, setProductName,
  materials, setMaterials,
  targetMarket, setTargetMarket,
  estimatedPrice, setEstimatedPrice,
  platform, setPlatform,
  copywritingStyle, setCopywritingStyle,
  additionalBrief, setAdditionalBrief,
  loading, handleGenerate, handleSaveProject, currentProjectId
}) => {
  
  const isFormValid = productName && images.length > 0 && platform;

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6 text-gray-200 border-b border-gray-700 pb-4 mt-6">1. Masukkan Data Produk Anda</h2>
      
      <div className="space-y-6">
        
        <fieldset className="space-y-6 border border-gray-700/50 p-4 rounded-lg">
          <legend className="text-lg font-semibold text-gray-300 px-2">Informasi Produk</legend>
          <ImageUploader onImagesChange={setImages} initialImages={images} />
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-2">Nama Produk <span className="text-red-500">*</span></label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Contoh: Kemeja Batik Pria Lengan Panjang Premium"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-6 border border-gray-700/50 p-4 rounded-lg">
          <legend className="text-lg font-semibold text-gray-300 px-2">Detail Tambahan (Opsional)</legend>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="materials" className="block text-sm font-medium text-gray-300">Bahan / Material Produk</label>
              <Tooltip text="Contoh: 'Katun combed 30s', 'Singkong pilihan, bumbu alami'" />
            </div>
            <input
              id="materials"
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Contoh: Katun premium, kulit asli, stainless steel"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-300">Siapa pembeli ideal Anda?</label>
              <Tooltip text="Contoh: 'Anak muda, pecinta pedas', 'Keluarga modern'" />
            </div>
            <input
              id="targetMarket"
              type="text"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              placeholder="Contoh: 'Pria karir usia 25-40 tahun'"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="estimatedPrice" className="block text-sm font-medium text-gray-300">Berapa perkiraan harganya?</label>
              <Tooltip text="Sebutkan harga atau rentang (misal: 'Rp 25.000', '100rb-150rb') untuk membantu AI menganalisa posisi pasar." />
            </div>
            <input
              id="estimatedPrice"
              type="text"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              placeholder="Contoh: 'Sekitar Rp 150.000'"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-6 border border-gray-700/50 p-4 rounded-lg">
          <legend className="text-lg font-semibold text-gray-300 px-2">Konfigurasi AI Strategy</legend>
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-2">Pilih Marketplace Tujuan <span className="text-red-500">*</span></label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Marketplace)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="" disabled>Pilih marketplace utama Anda...</option>
              {MARKETPLACE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="copywritingStyle" className="block text-sm font-medium text-gray-300 mb-2">Gaya Bahasa Promosi</label>
            <select
              id="copywritingStyle"
              value={copywritingStyle}
              onChange={(e) => setCopywritingStyle(e.target.value as CopywritingStyle)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition appearance-none"
               style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {COPYWRITING_STYLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
           <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="additionalBrief" className="block text-sm font-medium text-gray-300">Brief Produk Tambahan (Opsional)</label>
              <Tooltip text="Masukkan info unik, promo khusus, atau request spesifik untuk AI." />
            </div>
            <textarea
              id="additionalBrief"
              value={additionalBrief}
              onChange={(e) => setAdditionalBrief(e.target.value)}
              placeholder="Contoh: 'Tekankan kalau produk ini buatan tangan pengrajin Jogja', 'Fokus ke fitur anti-air', atau 'Jangan gunakan bahasa yang terlalu gaul'."
              rows={3}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none"
            />
          </div>
        </fieldset>

         <div className="text-center text-sm text-gray-500 pt-2">
           ⚡ Isi lengkap agar AI menghasilkan ranking, caption, dan deskripsi yang lebih konversi.
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleGenerate}
              disabled={loading || !isFormValid}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <SparklesIcon className="w-5 h-5" />
              {loading ? 'AI Sedang Berpikir...' : '🚀 Optimalkan Produk Sekarang'}
            </button>
            <button
              onClick={handleSaveProject}
              disabled={loading || !productName}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
              title={currentProjectId ? 'Perbarui Proyek' : 'Simpan Proyek'}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
              <span>{currentProjectId ? 'Perbarui' : '💾 Simpan Proyek'}</span>
            </button>
        </div>
      </div>
    </>
  );
};
