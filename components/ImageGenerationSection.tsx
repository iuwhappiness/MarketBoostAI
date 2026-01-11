
import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { ImageConcepts, DetailedImageConcept, ImageFile } from '../types';
import { generateImageFromConcept } from '../services/geminiService';
import { CameraIcon } from './icons/CameraIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ImageIcon } from './icons/ImageIcon';

interface ImageGenerationSectionProps {
    concepts: ImageConcepts;
    baseImage?: ImageFile;
}

// Define the handle type for the parent to use
export interface ImageGenerationSectionHandle {
  getGeneratedImages: () => Promise<{ title: string, data: string }[]>;
}

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

interface ImageState {
    status: GenerationStatus;
    data: string | null; // Base64 string
    error: string | null;
}

const createFileName = (title: string): string => {
    return title.toLowerCase().replace(/ /g, '_') + '.png';
};

// Sub-component for individual concept generation
// Now using forwardRef to expose the image data to the parent list
interface ConceptGeneratorHandle {
  getImageData: () => { title: string, data: string } | null;
}

const ConceptGenerator = forwardRef<ConceptGeneratorHandle, { title: string; conceptData: DetailedImageConcept; baseImage?: ImageFile; autoGenerate?: boolean }>(
  ({ title, conceptData, baseImage, autoGenerate = false }, ref) => {
    const [imageState, setImageState] = useState<ImageState>({ status: 'idle', data: null, error: null });

    useImperativeHandle(ref, () => ({
      getImageData: () => {
        if (imageState.status === 'success' && imageState.data) {
          return { title, data: imageState.data };
        }
        return null;
      }
    }));

    const handleGenerate = useCallback(async () => {
        if (!baseImage) {
            setImageState({ status: 'error', data: null, error: "Gambar produk utama tidak ditemukan." });
            return;
        }
        setImageState({ status: 'loading', data: null, error: null });
        try {
            const imageData = await generateImageFromConcept(conceptData.prompt, { data: baseImage.base64, mimeType: baseImage.file.type });
            setImageState({ status: 'success', data: imageData, error: null });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal";
            setImageState({ status: 'error', data: null, error: errorMessage });
        }
    }, [conceptData.prompt, baseImage]);

    useEffect(() => {
        if (autoGenerate) {
            handleGenerate();
        }
    }, [autoGenerate, handleGenerate]);

    const handleDownload = () => {
        if (imageState.data) {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${imageState.data}`;
            link.download = createFileName(title);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="mb-6 last:mb-0">
            <h4 className="font-semibold text-gray-400 mb-2 flex items-center gap-2">
                {title}
            </h4>
            <div className="p-5 bg-gray-900/40 rounded-xl border border-gray-700/50 space-y-4">
                
                {/* Text Details */}
                <div className="space-y-3">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-indigo-900/50 text-indigo-300 mb-1 border border-indigo-700/30">
                            Konsep
                        </span>
                        <p className="text-sm text-gray-200 leading-relaxed">{conceptData.explanation}</p>
                    </div>
                    
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-900/50 text-green-300 mb-1 border border-green-700/30">
                            Strategi Konversi
                        </span>
                        <p className="text-sm text-gray-300 italic">{conceptData.rationale}</p>
                    </div>

                    <div>
                         <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-400 mb-1 border border-gray-700">
                            Prompt Teknis
                        </span>
                        <p className="font-mono text-xs text-gray-500 bg-gray-950/50 p-2 rounded border border-gray-800">{conceptData.prompt}</p>
                    </div>
                </div>

                {/* Image Generation Area */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                        <div className="text-xs text-gray-500">
                            {imageState.status === 'idle' && "Siap untuk membuat gambar."}
                            {imageState.status === 'loading' && "Sedang memproses..."}
                            {imageState.status === 'success' && "Gambar berhasil dibuat."}
                            {imageState.status === 'error' && "Gagal membuat gambar."}
                        </div>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleGenerate}
                                disabled={imageState.status === 'loading' || !baseImage}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 transition-all shadow-lg shadow-indigo-900/20"
                                title={!baseImage ? "Unggah gambar produk utama terlebih dahulu" : ""}
                            >
                                <CameraIcon className="w-4 h-4" />
                                {imageState.status === 'loading' ? 'Memproses...' : (imageState.status === 'success' ? 'Buat Ulang' : 'Buat Gambar')}
                            </button>
                            {imageState.status === 'success' && imageState.data && (
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-all border border-gray-600"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    <span>Unduh</span>
                                </button>
                            )}
                        </div>
                     </div>

                    {/* Image Preview Area */}
                    <div className="relative w-full min-h-[200px] bg-gray-950/50 rounded-lg border border-gray-800 flex items-center justify-center overflow-hidden">
                        {imageState.status === 'loading' && (
                            <div className="flex flex-col items-center text-gray-500 animate-pulse">
                                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs">AI sedang melukis ulang produk Anda...</p>
                            </div>
                        )}
                        
                        {imageState.status === 'error' && (
                            <div className="text-center text-red-400 p-4">
                                <p className="font-semibold text-sm mb-1">Gagal Membuat Gambar</p>
                                <p className="text-xs opacity-80">{imageState.error}</p>
                            </div>
                        )}

                        {imageState.status === 'success' && imageState.data && (
                            <img
                                src={`data:image/png;base64,${imageState.data}`}
                                alt={`Generated image for: ${title}`}
                                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                            />
                        )}

                        {imageState.status === 'idle' && (
                            <div className="flex flex-col items-center text-gray-700">
                                <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-xs">Klik "Buat Gambar" untuk melihat hasil</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export const ImageGenerationSection = forwardRef<ImageGenerationSectionHandle, ImageGenerationSectionProps>(({ concepts, baseImage }, ref) => {
    // Refs for each generator to collect data later
    const heroRef = React.useRef<ConceptGeneratorHandle>(null);
    const supportingRefs = React.useRef<(ConceptGeneratorHandle | null)[]>([]);

    // Initialize refs array
    if (supportingRefs.current.length !== concepts.supporting.length) {
        supportingRefs.current = Array(concepts.supporting.length).fill(null);
    }

    useImperativeHandle(ref, () => ({
        getGeneratedImages: async () => {
            const images: { title: string, data: string }[] = [];
            
            // Get Hero Image
            const heroData = heroRef.current?.getImageData();
            if (heroData) images.push(heroData);

            // Get Supporting Images
            supportingRefs.current.forEach(ref => {
                const data = ref?.getImageData();
                if (data) images.push(data);
            });

            return images;
        }
    }));

    return (
        <div className="space-y-8">
             <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex items-start gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-full shrink-0">
                    <CameraIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-indigo-300 mb-1">Studio Foto AI Interaktif</h4>
                    <p className="text-xs text-indigo-200/70">
                        AI akan menggunakan <strong>foto produk asli Anda</strong> sebagai bahan dasar (100% akurat) dan menempatkannya ke dalam adegan yang dirancang di bawah ini. Klik tombol "Buat Gambar" untuk memvisualisasikan setiap konsep.
                    </p>
                </div>
            </div>

            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
                <h4 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-3 border-b border-gray-700 pb-2">Landasan Strategis</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed italic">
                    "{concepts.reasoning}"
                </p>
            </div>

            <div className="space-y-8">
                <ConceptGenerator 
                    ref={heroRef}
                    title="Hero Image (Utama)" 
                    conceptData={concepts.hero} 
                    baseImage={baseImage} 
                    autoGenerate={true} 
                />
                
                {concepts.supporting.map((conceptData, i) => (
                    <ConceptGenerator 
                        key={i} 
                        ref={el => supportingRefs.current[i] = el}
                        title={`Gambar Pendukung ${i + 1}`} 
                        conceptData={conceptData} 
                        baseImage={baseImage} 
                    />
                ))}
            </div>
        </div>
    );
});
