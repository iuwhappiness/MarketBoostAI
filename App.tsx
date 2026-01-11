
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ResultView } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { ProjectsPanel } from './components/ProjectsPanel';
import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ProductForm } from './components/ProductForm';
import { generateProductContent } from './services/geminiService';
import type { GeneratedContent, ProductInput, ImageFile, SavedProject, ToastInfo } from './types';
import { Marketplace, CopywritingStyle, ToastType } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [productName, setProductName] = useState('');
  const [materials, setMaterials] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [platform, setPlatform] = useState<Marketplace | ''>('');
  const [copywritingStyle, setCopywritingStyle] = useState<CopywritingStyle>(CopywritingStyle.NATURAL);
  const [additionalBrief, setAdditionalBrief] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  // Project State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
  const deletedProjectRef = useRef<SavedProject | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const projectsFromStorage = localStorage.getItem('marketboost-ai-projects');
      if (projectsFromStorage) {
        setSavedProjects(JSON.parse(projectsFromStorage));
      }
    } catch (e) {
      console.error("Failed to load projects from localStorage", e);
      setSavedProjects([]);
    }
  }, []);
  
  // Auto-scroll effect
  useEffect(() => {
    if (loading || result || error) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, result, error]);

  const saveProjectsToStorage = (projects: SavedProject[]) => {
    try {
      localStorage.setItem('marketboost-ai-projects', JSON.stringify(projects));
    } catch (e) {
      console.error("Failed to save projects to localStorage", e);
    }
  };

  const showToast = (message: string, type: ToastType = ToastType.INFO, onUndo?: () => void) => {
    const newToast: ToastInfo = { id: uuidv4(), message, type };
    if (onUndo) {
      newToast.action = { label: 'Urungkan', onClick: onUndo };
    }
    setToastInfo(newToast);
  };

  const clearForm = (isNewProject: boolean) => {
    setImages([]);
    setProductName('');
    setMaterials('');
    setTargetMarket('');
    setEstimatedPrice('');
    setPlatform('');
    setCopywritingStyle(CopywritingStyle.NATURAL);
    setAdditionalBrief('');
    setResult(null);
    setError(null);
    if (isNewProject) {
        setCurrentProjectId(null);
    }
  };

  const handleNewProject = () => {
    clearForm(true);
    showToast('Memulai sesi baru.');
  };

  const handleSaveProject = () => {
    if (!productName) {
      setError("Nama produk wajib diisi untuk menyimpan proyek.");
      return;
    }

    const projectData = {
      id: currentProjectId || uuidv4(),
      name: productName,
      timestamp: new Date().toISOString(),
      input: {
        images,
        productName,
        materials,
        targetMarket,
        estimatedPrice,
        platform,
        copywritingStyle,
        additionalBrief,
      },
      result,
    };

    let updatedProjects;
    if (currentProjectId) {
      updatedProjects = savedProjects.map(p => p.id === currentProjectId ? projectData : p);
      showToast('Proyek berhasil diperbarui.');
    } else {
      updatedProjects = [...savedProjects, projectData];
      showToast('Proyek berhasil disimpan.');
      setCurrentProjectId(projectData.id);
    }

    setSavedProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };
  
  const handleLoadProject = (projectId: string) => {
    const project = savedProjects.find(p => p.id === projectId);
    if (project) {
      clearForm(false);
      setImages([]); // Clear images as we can't restore File objects easily without complex handling
      setProductName(project.input.productName);
      setMaterials(project.input.materials);
      setTargetMarket(project.input.targetMarket);
      setEstimatedPrice(project.input.estimatedPrice);
      setPlatform(project.input.platform);
      setCopywritingStyle(project.input.copywritingStyle);
      setAdditionalBrief(project.input.additionalBrief || '');
      setResult(project.result);
      setCurrentProjectId(project.id);
      showToast(`Memuat strategi "${project.name}"...`);
    }
  };

  const handleUndoDelete = () => {
    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
    }
    if (deletedProjectRef.current) {
        const restoredProjects = [...savedProjects, deletedProjectRef.current].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSavedProjects(restoredProjects);
        saveProjectsToStorage(restoredProjects);
        deletedProjectRef.current = null;
        setToastInfo(null);
        showToast('Proyek dikembalikan.');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
    }

    const projectToDelete = savedProjects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    deletedProjectRef.current = projectToDelete;
    
    const updatedProjects = savedProjects.filter(p => p.id !== projectId);
    setSavedProjects(updatedProjects);
    
    if (currentProjectId === projectId) {
        handleNewProject();
    }

    showToast('Proyek dihapus.', ToastType.DANGER, handleUndoDelete);
    
    undoTimeoutRef.current = window.setTimeout(() => {
        saveProjectsToStorage(updatedProjects);
        deletedProjectRef.current = null;
    }, 7000);
  };

  const handleGenerate = useCallback(async () => {
    if (!productName || images.length === 0 || !platform) {
      setError('Mohon lengkapi data produk (Foto, Nama, Marketplace) agar AI dapat bekerja maksimal.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const productInput: ProductInput = {
      images: images.map(img => ({ data: img.base64, mimeType: img.file.type })),
      productName,
      materials,
      targetMarket,
      estimatedPrice,
      platform,
      copywritingStyle,
      additionalBrief,
    };

    try {
      const content = await generateProductContent(productInput);
      setResult(content);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [images, productName, materials, targetMarket, estimatedPrice, platform, copywritingStyle, additionalBrief]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1c2e] via-[#0f111a] to-black text-gray-100 font-sans flex flex-col selection:bg-indigo-500/30">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <HeroSection />

        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          {/* Input Section */}
          <div className="bg-gray-800/20 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 border border-white/5 ring-1 ring-white/5 relative overflow-hidden">
            {/* Ambient Background Blur inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <ProjectsPanel 
                projects={savedProjects}
                currentProjectId={currentProjectId}
                onNew={handleNewProject}
                onLoad={handleLoadProject}
                onDelete={handleDeleteProject}
            />

            <ProductForm 
                images={images} setImages={setImages}
                productName={productName} setProductName={setProductName}
                materials={materials} setMaterials={setMaterials}
                targetMarket={targetMarket} setTargetMarket={setTargetMarket}
                estimatedPrice={estimatedPrice} setEstimatedPrice={setEstimatedPrice}
                platform={platform} setPlatform={setPlatform}
                copywritingStyle={copywritingStyle} setCopywritingStyle={setCopywritingStyle}
                additionalBrief={additionalBrief} setAdditionalBrief={setAdditionalBrief}
                loading={loading}
                handleGenerate={handleGenerate}
                handleSaveProject={handleSaveProject}
                currentProjectId={currentProjectId}
            />
          </div>

          {/* Output Section */}
          <div ref={resultsRef}>
             {error && (
                <div className="bg-red-500/10 backdrop-blur border border-red-500/30 text-red-200 px-6 py-4 rounded-xl mb-6 flex gap-4 animate-fadeIn" role="alert">
                    <div className="shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-bold text-red-400">Analisis Terhenti</p>
                        <p className="text-sm whitespace-pre-wrap opacity-90">{error}</p>
                    </div>
                </div>
            )}
            {loading && <Loader />}
            
            {result && <ResultView content={result} baseImages={images} />}
          </div>
        </div>
      </main>
      <Footer />
      <Toast info={toastInfo} onClear={() => setToastInfo(null)} />
    </div>
  );
};

export default App;
