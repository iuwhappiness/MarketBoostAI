
import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedContent, SeoKeywords, TrendAndStrategy, PriceSuggestion, ImageConcepts, ImageFile } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { SparklesIcon } from './icons/SparklesIcon';
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

const processParagraphs = (text: string) => {
    const processBold = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((paragraph, idx) => {
        // Detect headers like KEY HIGHLIGHTS, FITUR UTAMA, SPESIFIKASI TEKNIK
        const isHeader = /^(KEY HIGHLIGHTS|FITUR UTAMA|SPESIFIKASI TEKNIK|SKENARIO PENGGUNAAN|SOLUSI MASALAH):?$/i.test(paragraph.trim());
        
        if (isHeader) {
            return (
                <h4 key={idx} className="text-indigo-400 font-black text-sm uppercase tracking-[0.2em] mt-8 mb-4 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                    {paragraph.trim()}
                </h4>
            );
        }

        return (
            <p key={idx} className="whitespace-pre-wrap mb-4 last:mb-0">
                {processBold(paragraph)}
            </p>
        );
    });
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;

    // Detect [CTA]...[/CTA] blocks
    const parts = text.split(/(\[CTA\].*?\[\/CTA\])/gs);

    return (
        <div className="space-y-4 font-sans text-gray-300 leading-relaxed max-w-none">
            {parts.map((part, idx) => {
                if (part.startsWith('[CTA]') && part.endsWith('[/CTA]')) {
                    const ctaContent = part.slice(5, -6).trim();
                    return (
                        <div key={idx} className="bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl my-10 relative overflow-hidden group border-l-8 border-l-indigo-500">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><SparklesIcon className="w-12 h-12" /></div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                            <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                Penutup Strategis & Call To Action
                            </h5>
                            <div className="text-white font-bold text-xl leading-relaxed">
                                {processParagraphs(ctaContent)}
                            </div>
                        </div>
                    );
                }
                return <React.Fragment key={idx}>{processParagraphs(part)}</React.Fragment>;
            })}
        </div>
    );
};


const KeywordPills: React.FC<{ keywords: string[] | undefined, title: string }> = ({ keywords, title }) => (
  <div className="mb-6">
    <h4 className="font-bold text-gray-400 mb-3 text-[10px] uppercase tracking-[0.2em]">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {keywords && keywords.length > 0 ? keywords.map((kw, i) => (
        <span key={i} className="bg-indigo-500/5 border border-white/5 text-indigo-200 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-indigo-500/20 hover:border-indigo-500/50 transition cursor-default select-all shadow-sm">{kw}</span>
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
      shortDesc: true,
  };
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(initialOpenState);
  
  useEffect(() => {
    setOpenCards(initialOpenState);
  }, [content]);


  const handleToggle = (key: string) => {
    setOpenCards(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleCopy = (sectionKey: string, text: string) => {
    const cleanText = text.replace(/\[CTA\]/g, '').replace(/\[\/CTA\]/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
        setCopiedStates(prev => ({ ...prev, [sectionKey]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [sectionKey]: false })), 2000);
    });
  };
  
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
                    <h4 className="font-bold text-blue-300 mb-3 text-xs tracking-widest uppercase">VISUAL TRENDS</h4>
                    <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{content.trendAndStrategy.visualTrends}</p>
                </div>
                <div className="bg-pink-900/10 p-5 rounded-xl border border-pink-500/20">
                    <h4 className="font-bold text-pink-300 mb-3 text-xs tracking-widest uppercase">COPYWRITING ANGLE</h4>
                    <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{content.trendAndStrategy.copywritingTrends}</p>
                </div>
                <div className="md:col-span-2 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border-l-4 border-l-indigo-500">
                    <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2 text-sm tracking-widest uppercase">
                         PRO TIPS UNTUK SELLER
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-900/10 p-6 rounded-xl border border-green-500/20">
                 <div><h4 className="font-semibold text-gray-400 text-[10px] uppercase tracking-widest">Rentang Harga Disarankan</h4></div>
                 <div className="text-4xl font-black text-green-400 tracking-tight">{content.priceSuggestion.suggestedPriceRange}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl"><h4 className="font-bold text-gray-500 mb-2 text-[10px] uppercase tracking-widest">Justifikasi Ahli</h4><p className="whitespace-pre-wrap text-gray-300 text-sm">{content.priceSuggestion.justification}</p></div>
        </div>
    )},
    { 
        key: 'titles', 
        title: "Judul Produk SEO Power", 
        icon: "🏆",
        highlightColor: "border-purple-500/30",
        content: content.titles, 
        formatCopy: formatTitlesForCopy, 
        render: () => (
        <ul className="space-y-4">
            {content.titles.map((title, i) => (
                <li key={i} className="flex gap-5 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-purple-500/40 transition-all group cursor-pointer">
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg font-black border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg">{i + 1}</span>
                    <span className="font-bold text-gray-100 self-center leading-snug group-hover:translate-x-1 transition-transform">{title}</span>
                </li>
            ))}
        </ul>
    )},
    { 
        key: 'shortDesc', 
        title: "Studio Conversion Hook", 
        icon: "🔥", 
        highlightColor: "border-orange-500/40",
        content: content.shortDescription, 
        formatCopy: (c: string) => c, 
        render: () => (
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border border-orange-500/20 shadow-2xl overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] group-hover:bg-orange-500/20 transition-all duration-1000"></div>
                <div className="relative flex flex-col items-center text-center">
                    <div className="mb-6 p-4 bg-orange-500/20 rounded-2xl text-orange-400 animate-bounce-slow">
                        <SparklesIcon className="w-8 h-8" />
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-black text-white italic leading-tight mb-8">
                        "{content.shortDescription}"
                    </blockquote>
                    <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full opacity-30"></div>
                    <p className="mt-6 text-[10px] font-black text-orange-400 uppercase tracking-[0.4em]">Sales Hook Pro v5.0</p>
                </div>
            </div>
    )},
    { key: 'highlights', title: "Key Highlights", icon: "⚡", content: content.shortHighlights, formatCopy: formatHighlightsForCopy, render: () => (
        <div className="grid sm:grid-cols-2 gap-4">
            {content.shortHighlights.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="bg-yellow-400/20 p-2 rounded-lg"><svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                     <span className="text-sm font-bold text-gray-200">{item}</span>
                </div>
            ))}
        </div>
    )},
    { key: 'features', title: "Fitur & Spesifikasi", icon: "📋", content: content.bulletFeatures, formatCopy: formatFeaturesForCopy, render: () => (
        <ul className="space-y-3 columns-1 md:columns-2 gap-10">
             {content.bulletFeatures.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 mb-3 break-inside-avoid group">
                     <span className="text-purple-400 mt-2 w-2 h-2 bg-purple-400 rounded-full shrink-0 block shadow-[0_0_8px_rgba(168,85,247,0.5)] group-hover:scale-125 transition-transform"></span>
                     <span className="leading-relaxed font-medium text-sm">{item}</span>
                </li>
            ))}
        </ul>
    )},
    { key: 'longDesc', title: "Master Description (AIDA)", icon: "✍️", content: content.longDescription, formatCopy: (c: string) => c, render: () => (
        <FormattedText text={content.longDescription} />
    )},
    { key: 'whatsInBox', title: "Isi Paket", icon: "📦", content: content.whatsInTheBox, formatCopy: (c: string) => c, render: () => (
        <div className="flex items-center gap-5 text-gray-200 bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg">
             <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30"><svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
            <p className="font-black text-lg tracking-tight">{content.whatsInTheBox}</p>
        </div>
    )},
    { key: 'seo', title: "30 Master SEO Keywords", icon: "🔍", highlightColor: "border-indigo-500/30", content: content.seoKeywords, formatCopy: formatSeoForCopy, render: () => (
        <div className="space-y-8 p-2">
           <KeywordPills keywords={content.seoKeywords.primary} title="🎯 Primary Keywords (Volume Tinggi)" />
           <KeywordPills keywords={content.seoKeywords.secondary} title="🔗 Secondary Keywords (Relevansi)" />
           <KeywordPills keywords={content.seoKeywords.longTail} title="🗣️ Long-Tail Keywords (Konversi)" />
           <div className="pt-6 border-t border-white/10">
                <h4 className="font-bold text-gray-500 mb-4 text-[10px] uppercase tracking-[0.3em]">Backend Meta Tags</h4>
                <p className="text-xs text-gray-400 font-mono bg-black/40 p-5 rounded-2xl border border-white/5 leading-loose tracking-wider">{content.seoKeywords.backendTags.join(', ')}</p>
           </div>
        </div>
    )},
    { key: 'imageConcepts', title: "Studio Visual Strategy", icon: "🎨", highlightColor: "border-pink-500/30", content: content.imageConcepts, formatCopy: formatImageConceptsForCopy, render: () => (
         <ImageGenerationSection ref={imageSectionRef} concepts={content.imageConcepts} baseImage={baseImages?.[0]} />
    )},
    { key: 'videoContent', title: "Viral Video Blueprint", icon: "🎬", content: content.videoContent, formatCopy: formatVideoContentForCopy, render: () => (
        <div className="space-y-10">
            <div>
                <h4 className="font-bold text-gray-500 mb-6 text-[10px] uppercase tracking-[0.2em]">Viral Hooks (3 Detik Emas)</h4>
                <div className="grid gap-4">
                    {content.videoContent.hooks.map((hook, i) => (
                        <div key={i} className="bg-red-500/5 border-l-4 border-red-500 p-5 rounded-2xl text-gray-100 text-sm font-bold flex gap-4 items-center shadow-lg">
                            <span className="text-red-500 text-2xl">⚡</span>
                            <span className="italic leading-relaxed">"{hook}"</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                 <h4 className="font-bold text-gray-500 mb-6 text-[10px] uppercase tracking-[0.2em]">Detailed Studio Storyboard</h4>
                 <div className="space-y-6">
                    {content.videoContent.storyboard.map((scene, i) => (
                        <div key={i} className="bg-[#0f111a] p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row gap-6 group hover:border-indigo-500/30 transition-all">
                            <div className="md:w-32 flex-shrink-0 flex items-center justify-center bg-gray-900 rounded-2xl p-5 text-center border border-white/5 group-hover:bg-indigo-950/20 transition-colors">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Scene</div>
                                    <div className="text-4xl font-black text-white">{i + 1}</div>
                                    <div className="text-[10px] text-indigo-400 mt-2 font-mono font-bold">{scene.duration}s</div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h5 className="font-black text-lg text-gray-100 border-b border-white/10 pb-2">{scene.scene}</h5>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[8px] uppercase text-gray-500 font-black tracking-widest block mb-2">Visual Instruction</span>
                                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{scene.visual}</p>
                                    </div>
                                    <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                        <span className="text-[8px] uppercase text-indigo-500/70 font-black tracking-widest block mb-2">Audio / VO Script</span>
                                        <p className="text-sm text-indigo-200 italic font-bold leading-relaxed">"{scene.audio}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    )},
    { key: 'compliance', title: "Laporan Kepatuhan AI", icon: "🛡️", content: content.complianceReport, formatCopy: formatComplianceForCopy, render: () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <h4 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Status Keamanan:</h4>
                 <span className={`font-black px-5 py-2 rounded-full text-xs uppercase tracking-[0.2em] shadow-lg ${content.complianceReport.status === 'AMAN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                    {content.complianceReport.status}
                 </span>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <ul className="space-y-4">
                    {content.complianceReport.notes.map((note, i) => (
                        <li key={i} className="flex gap-4 text-sm text-gray-300 font-medium">
                            <span className="text-indigo-500 font-bold">•</span>
                            {note}
                        </li>
                    ))}
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
        const textFolder = zip.folder("MarketBoost_Text_Studio");
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
                 const imgFolder = zip.folder("MarketBoost_Studio_Visuals");
                 if (imgFolder) {
                     images.forEach((img, i) => {
                         const safeTitle = img.title.toLowerCase().replace(/ /g, '_').replace(/[^\w\s-]/g, '');
                         imgFolder.file(`${safeTitle}.png`, img.data, {base64: true});
                     });
                 }
            }
        }

        let zipFilename = "ProductGenius_Package.zip";
        if (content.titles && content.titles.length > 0) {
            const namePart = content.titles[0].split(' ').slice(0, 3).join('_').replace(/[^\w]/g, '');
            zipFilename = `ProductGenius_${namePart}.zip`;
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
    <div className="animate-fadeIn max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 mb-10 gap-6">
            <div className="space-y-2">
                <h2 className="text-4xl font-black text-white flex items-center gap-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient-x">Hasil Optimasi Studio</span>
                </h2>
                <p className="text-gray-400 text-base font-medium">Analisis mendalam selesai. Produk Anda kini siap mendominasi pasar.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                 <button 
                    onClick={handleDownloadAllAssets}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:scale-105 active:scale-95 text-white text-sm font-black px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-900/40 border border-white/10"
                >
                    <ArchiveIcon className="w-5 h-5" />
                    Unduh Master Aset (.zip)
                </button>
                <div className="flex items-center gap-3 ml-auto md:ml-0">
                    <button onClick={handleExpandAll} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl transition border border-white/5">Expand All</button>
                    <button onClick={handleCollapseAll} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl transition border border-white/5">Collapse All</button>
                </div>
            </div>
        </div>
        
        <div className="grid gap-8">
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
