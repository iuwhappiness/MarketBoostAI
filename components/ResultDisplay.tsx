
import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedContent, SeoKeywords, TrendAndStrategy, PriceSuggestion, ImageConcepts, ImageFile } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { ImageGenerationSection, ImageGenerationSectionHandle } from './ImageGenerationSection';
import JSZip from 'jszip';

interface ResultViewProps {
  content: GeneratedContent;
  baseImages?: ImageFile[];
}

const downloadAsTextFile = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename.replace(/ /g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const ResultCard: React.FC<{ 
    title: string; 
    icon?: string;
    children: React.ReactNode; 
    onCopy: () => void; 
    onDownload: () => void; 
    copied: boolean;
    isOpen: boolean;
    onToggle: () => void;
    highlightColor?: string;
}> = ({ title, icon, children, onCopy, onDownload, copied, isOpen, onToggle, highlightColor = "border-gray-700/50" }) => {
    return (
        <div className={`bg-[#131520] rounded-2xl shadow-xl border ${highlightColor} mb-6 transition-all duration-300 overflow-hidden group hover:border-opacity-100 border-opacity-60`}>
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex items-center justify-between p-5 w-full text-left focus:outline-none bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.05] transition-all"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                     <div className="flex items-center gap-3">
                        {icon && <span className="text-2xl opacity-90">{icon}</span>}
                        <h3 className="text-lg font-bold text-gray-100 tracking-tight">{title}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5 backdrop-blur-sm">
                        <button
                            onClick={onCopy}
                            className="text-gray-400 hover:text-white transition relative p-1.5 hover:bg-white/10 rounded-md"
                            title="Salin Konten"
                        >
                            {copied ? <span className="text-xs text-green-400 font-bold px-1">Tersalin!</span> : <CopyIcon className="w-4 h-4" />}
                        </button>
                        <div className="w-px h-4 bg-white/10"></div>
                        <button
                            onClick={onDownload}
                            className="text-gray-400 hover:text-white transition p-1.5 hover:bg-white/10 rounded-md"
                            title="Unduh sebagai .txt"
                        >
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className={`p-1.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-white/10 text-white rotate-180' : 'text-gray-500'}`}>
                         <ChevronDownIcon className="w-5 h-5" />
                    </div>
                </div>
            </button>
            <div 
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-6 text-gray-300 text-base leading-relaxed border-t border-white/5 bg-black/20">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for formatted text rendering
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;

    const processBold = (str: string) => {
        // Split by **text** pattern
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/);

    return (
        <div className="space-y-4 font-sans text-gray-300 leading-relaxed">
            {paragraphs.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                    {processBold(paragraph)}
                </p>
            ))}
        </div>
    );
};


const KeywordPills: React.FC<{ keywords: string[] | undefined, title: string }> = ({ keywords, title }) => (
  <div className="mb-6">
    <h4 className="font-bold text-gray-400 mb-3 text-xs uppercase tracking-widest">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {keywords && keywords.length > 0 ? keywords.map((kw, i) => (
        <span key={i} className="bg-white/5 border border-white/10 text-indigo-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 hover:border-indigo-500/50 transition cursor-default select-all">{kw}</span>
      )) : <p className="text-sm text-gray-500">Tidak ada data.</p>}
    </div>
  </div>
);


export const ResultView: React.FC<ResultViewProps> = ({ content, baseImages }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const imageSectionRef = useRef<ImageGenerationSectionHandle>(null);
  
  const initialOpenState = {
      trends: true,
      price: true,
      titles: true,
  };
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(initialOpenState);
  
  useEffect(() => {
    setOpenCards(initialOpenState);
  }, [content]);


  const handleToggle = (key: string) => {
    setOpenCards(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleCopy = (sectionKey: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedStates(prev => ({ ...prev, [sectionKey]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [sectionKey]: false })), 2000);
    });
  };
  
  // Formatters
  const formatTrendStrategyForCopy = (strategy: TrendAndStrategy) => `ANALISIS TREN & STRATEGI:\n\n**Tren Visual:**\n${strategy.visualTrends}\n\n**Tren Copywriting:**\n${strategy.copywritingTrends}\n\n**Saran Strategi:**\n${strategy.actionableAdvice}`;
  const formatPriceSuggestionForCopy = (price: PriceSuggestion) => `SARAN HARGA & ANALISIS PASAR:\n\n**Rentang Harga Disarankan:**\n${price.suggestedPriceRange}\n\n**Justifikasi:**\n${price.justification}`;
  const formatSeoForCopy = (seo: SeoKeywords) => `KATA KUNCI UTAMA:\n- ${seo.primary.join('\n- ')}\n\nKATA KUNCI SEKUNDER:\n- ${seo.secondary.join('\n- ')}\n\nLONG-TAIL KEYWORDS:\n- ${seo.longTail.join('\n- ')}\n\nBACKEND TAGS:\n- ${seo.backendTags.join(', ')}`;
  const formatTitlesForCopy = (titles: string[]) => `OPSI JUDUL PRODUK:\n\n1. ${titles[0]}\n2. ${titles[1]}\n3. ${titles[2]}`;
  const formatHighlightsForCopy = (items: string[]) => `HIGHLIGHTS PENDEK:\n\n- ${items.join('\n- ')}`;
  const formatFeaturesForCopy = (items: string[]) => `FITUR UTAMA (BULLET POINTS):\n\n- ${items.join('\n- ')}`;
  const formatImageConceptsForCopy = (concepts: ImageConcepts) => {
    const heroText = `Hero Image Concept:\nExplanation: ${concepts.hero.explanation}\nRationale: ${concepts.hero.rationale}\nHero Prompt: ${concepts.hero.prompt}`;
    const supportingText = concepts.supporting.map((concept, i) => `Support ${i + 1}:\nExplanation: ${concept.explanation}\nRationale: ${concept.rationale}\nPrompt: ${concept.prompt}`).join('\n\n---\n\n');
    const reasoningText = `Global Reasoning:\n${concepts.reasoning}`;
    return `${heroText}\n\n---\n\n${supportingText}\n\n---\n\n${reasoningText}`;
  };
  const formatVideoContentForCopy = (video: typeof content.videoContent) => {
      const hooks = `VIDEO HOOKS (3 DETIK PERTAMA):\n- ${video.hooks.join('\n- ')}`;
      const storyboard = video.storyboard.map((scene, i) => 
        `SCENE ${i+1}: ${scene.scene}\nVisual: ${scene.visual}\nAudio: ${scene.audio}\nDurasi: ${scene.duration}`
      ).join('\n\n');
      return `${hooks}\n\nSTORYBOARD DETAIL:\n${storyboard}`;
  };
  const formatComplianceForCopy = (report: typeof content.complianceReport) => `STATUS KEPATUHAN: ${report.status}\n\nCATATAN:\n- ${report.notes.join('\n- ')}`;

  const resultSections = [
    { 
        key: 'trends', 
        title: "Strategi & Tren Pasar", 
        icon: "🧠",
        highlightColor: "border-blue-500/30",
        content: content.trendAndStrategy, 
        formatCopy: formatTrendStrategyForCopy, 
        render: () => (
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20">
                    <h4 className="font-bold text-blue-300 mb-3 text-sm tracking-wide">VISUAL TRENDS</h4>
                    <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{content.trendAndStrategy.visualTrends}</p>
                </div>
                <div className="bg-pink-900/10 p-5 rounded-xl border border-pink-500/20">
                    <h4 className="font-bold text-pink-300 mb-3 text-sm tracking-wide">COPYWRITING ANGLE</h4>
                    <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{content.trendAndStrategy.copywritingTrends}</p>
                </div>
                <div className="md:col-span-2 bg-gradient-to-r from-gray-800 to-gray-900 p-5 rounded-xl border-l-4 border-l-indigo-500">
                    <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                         ACTIONABLE ADVICE
                    </h4>
                    <p className="whitespace-pre-wrap font-medium text-gray-200">{content.trendAndStrategy.actionableAdvice}</p>
                </div>
            </div>
    )},
    { 
        key: 'price', 
        title: "Analisis Harga & Pasar", 
        icon: "💰",
        content: content.priceSuggestion, 
        formatCopy: formatPriceSuggestionForCopy, 
        render: () => (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-900/10 p-5 rounded-xl border border-green-500/20">
                 <div><h4 className="font-semibold text-gray-400 text-xs uppercase tracking-wide">Rentang Harga Kompetitif</h4></div>
                 <div className="text-3xl font-bold text-green-400 tracking-tight">{content.priceSuggestion.suggestedPriceRange}</div>
            </div>
            <div className="p-4"><h4 className="font-bold text-gray-400 mb-2 text-xs uppercase">Analisis Expert</h4><p className="whitespace-pre-wrap text-gray-300">{content.priceSuggestion.justification}</p></div>
        </div>
    )},
    { 
        key: 'titles', 
        title: "Judul Produk (Algorithm Friendly)", 
        icon: "🏆",
        highlightColor: "border-purple-500/30",
        content: content.titles, 
        formatCopy: formatTitlesForCopy, 
        render: () => (
        <ul className="space-y-3">
            {content.titles.map((title, i) => (
                <li key={i} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-sm font-bold border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white transition-colors">{i + 1}</span>
                    <span className="font-medium text-gray-200 self-center">{title}</span>
                </li>
            ))}
        </ul>
    )},
    { key: 'shortDesc', title: "Hook Deskripsi", icon: "🪝", content: content.shortDescription, formatCopy: (c: string) => c, render: () => (
        <div className="bg-gray-800/50 p-6 rounded-xl border-l-4 border-l-orange-500 italic text-gray-200 text-lg font-light leading-relaxed">
            "{content.shortDescription}"
        </div>
    )},
    { key: 'highlights', title: "Key Highlights", icon: "⚡", content: content.shortHighlights, formatCopy: formatHighlightsForCopy, render: () => (
        <div className="grid sm:grid-cols-2 gap-3">
            {content.shortHighlights.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                     <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     <span className="text-sm text-gray-200">{item}</span>
                </div>
            ))}
        </div>
    )},
    { key: 'features', title: "Fitur & Spesifikasi", icon: "📋", content: content.bulletFeatures, formatCopy: formatFeaturesForCopy, render: () => (
        <ul className="space-y-2 columns-1 md:columns-2 gap-8">
             {content.bulletFeatures.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 mb-2 break-inside-avoid">
                     <span className="text-purple-400 mt-1.5 w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0 block"></span>
                     <span className="leading-snug">{item}</span>
                </li>
            ))}
        </ul>
    )},
    { key: 'longDesc', title: "Deskripsi Lengkap", icon: "✍️", content: content.longDescription, formatCopy: (c: string) => c, render: () => (
        <FormattedText text={content.longDescription} />
    )},
    { key: 'whatsInBox', title: "Isi Paket", icon: "📦", content: content.whatsInTheBox, formatCopy: (c: string) => c, render: () => (
        <div className="flex items-center gap-4 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10">
             <div className="p-2 bg-gray-700 rounded-lg"><svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
            <p className="font-medium">{content.whatsInTheBox}</p>
        </div>
    )},
    { key: 'seo', title: "SEO Keywords", icon: "🔍", highlightColor: "border-indigo-500/30", content: content.seoKeywords, formatCopy: formatSeoForCopy, render: () => (
        <div className="space-y-6">
           <KeywordPills keywords={content.seoKeywords.primary} title="Primary Keywords" />
           <KeywordPills keywords={content.seoKeywords.secondary} title="Secondary Keywords" />
           <KeywordPills keywords={content.seoKeywords.longTail} title="Long-Tail Keywords" />
           <div className="pt-4 border-t border-white/10">
                <h4 className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-widest">Backend Search Tags</h4>
                <p className="text-sm text-gray-400 font-mono bg-black/30 p-3 rounded-lg border border-white/5">{content.seoKeywords.backendTags.join(', ')}</p>
           </div>
        </div>
    )},
    { key: 'imageConcepts', title: "Konsep Visual AI", icon: "🎨", highlightColor: "border-pink-500/30", content: content.imageConcepts, formatCopy: formatImageConceptsForCopy, render: () => (
         <ImageGenerationSection ref={imageSectionRef} concepts={content.imageConcepts} baseImage={baseImages?.[0]} />
    )},
    { key: 'videoContent', title: "Storyboard Video", icon: "🎬", content: content.videoContent, formatCopy: formatVideoContentForCopy, render: () => (
        <div className="space-y-8">
            <div>
                <h4 className="font-bold text-gray-400 mb-4 text-xs uppercase tracking-widest">Viral Hooks (3 Detik Pertama)</h4>
                <div className="grid gap-3">
                    {content.videoContent.hooks.map((hook, i) => (
                        <div key={i} className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-xl text-gray-200 text-sm flex gap-3 items-center">
                            <span className="text-red-500 font-bold text-lg">!</span>
                            <span className="italic">"{hook}"</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                 <h4 className="font-bold text-gray-400 mb-4 text-xs uppercase tracking-widest">Detailed Storyboard</h4>
                 <div className="space-y-4">
                    {content.videoContent.storyboard.map((scene, i) => (
                        <div key={i} className="bg-[#0f111a] p-4 rounded-xl border border-white/10 shadow-inner flex flex-col md:flex-row gap-4">
                            <div className="md:w-32 flex-shrink-0 flex items-center justify-center bg-gray-800 rounded-lg p-3 text-center">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Scene</div>
                                    <div className="text-2xl font-bold text-white">{i + 1}</div>
                                    <div className="text-xs text-indigo-400 mt-1 font-mono">{scene.duration}</div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <h5 className="font-bold text-gray-200 border-b border-gray-700 pb-1">{scene.scene}</h5>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-800/50 p-3 rounded-lg">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Visual</span>
                                        <p className="text-sm text-gray-300">{scene.visual}</p>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded-lg">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Audio / Script</span>
                                        <p className="text-sm text-gray-300 italic">"{scene.audio}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    )},
    { key: 'compliance', title: "Laporan Kepatuhan", icon: "🛡️", content: content.complianceReport, formatCopy: formatComplianceForCopy, render: () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                 <h4 className="font-semibold text-gray-400 text-sm">Status:</h4>
                 <span className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider ${content.complianceReport.status === 'AMAN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                    {content.complianceReport.status}
                 </span>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    {content.complianceReport.notes.map((note, i) => <li key={i}>{note}</li>)}
                </ul>
            </div>
        </div>
    )},
  ];
  
  const allSectionKeys = resultSections.map(s => s.key);

  const handleExpandAll = () => {
    const allOpen = allSectionKeys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setOpenCards(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenCards({});
  };

  const handleDownloadAllAssets = async () => {
        const zip = new JSZip();
        const textFolder = zip.folder("MarketBoost_Text");
        if (textFolder) {
             resultSections.forEach((section, index) => {
                if (section.content) {
                     const prefix = (index + 1).toString().padStart(2, '0');
                     const safeTitle = section.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_').toLowerCase();
                     const filename = `${prefix}_${safeTitle}.txt`;
                     textFolder.file(filename, section.formatCopy(section.content as any));
                }
            });
        }

        if (imageSectionRef.current) {
            const images = await imageSectionRef.current.getGeneratedImages();
            if (images.length > 0) {
                 const imgFolder = zip.folder("MarketBoost_Visuals");
                 if (imgFolder) {
                     images.forEach((img, i) => {
                         const safeTitle = img.title.toLowerCase().replace(/ /g, '_').replace(/[^\w\s-]/g, '');
                         imgFolder.file(`${safeTitle}.png`, img.data, {base64: true});
                     });
                 }
            }
        }

        let zipFilename = "MarketBoost_Assets.zip";
        if (content.titles && content.titles.length > 0) {
            const namePart = content.titles[0].split(' ').slice(0, 3).join('_').replace(/[^\w]/g, '');
            zipFilename = `MarketBoost_${namePart}.zip`;
        }

        zip.generateAsync({type:"blob"}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
  };


  return (
    <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Analisis Selesai</span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">Market Boost Intelligence telah mengoptimalkan produk Anda.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                 <button 
                    onClick={handleDownloadAllAssets}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-bold px-6 py-2.5 rounded-full transition shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-0.5"
                >
                    <ArchiveIcon className="w-4 h-4" />
                    Unduh Semua Aset
                </button>
                <div className="flex items-center gap-2 ml-auto md:ml-0">
                    <button onClick={handleExpandAll} className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-white/5">Buka Semua</button>
                    <button onClick={handleCollapseAll} className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-white/5">Tutup Semua</button>
                </div>
            </div>
        </div>
        
        <div className="grid gap-6">
            {resultSections.map(section => (
                section.content && (
                    <ResultCard 
                        key={section.key}
                        title={section.title}
                        icon={section.icon}
                        highlightColor={section.highlightColor}
                        onCopy={() => handleCopy(section.key, section.formatCopy(section.content as any))}
                        onDownload={() => downloadAsTextFile(section.title, section.formatCopy(section.content as any))}
                        copied={!!copiedStates[section.key]}
                        isOpen={!!openCards[section.key]}
                        onToggle={() => handleToggle(section.key)}
                    >
                        {section.render()}
                    </ResultCard>
                )
            ))}
        </div>
    </div>
  );
};
