
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const messages = [
    "Menganalisis detail visual produk...",
    "Melakukan riset kompetitor & tren pasar...",
    "Menyusun struktur SEO & kata kunci...",
    "Merancang konsep visual yang menjual...",
    "Finalisasi strategi konversi penjualan...",
    "Market Boost Engine sedang bekerja...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[450px] bg-[#0f111a]/60 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10 relative overflow-hidden group shadow-2xl">
            
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-24 h-24 mb-10">
                    <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 border-r-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-l-purple-500 border-b-cyan-500 rounded-full animate-spin-reverse opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Market Boost Intelligence</h3>
                <div className="h-10 overflow-hidden w-full max-w-md">
                    <p className="text-indigo-200/90 animate-fadeUp text-base font-medium bg-white/5 py-2 px-4 rounded-full border border-white/5">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};
