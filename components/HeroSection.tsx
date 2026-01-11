
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center mb-12 mt-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
      
      <div className="h-4"></div> {/* Spacer replacing the badge */}

      <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
        <span className="bg-gradient-to-br from-white via-gray-200 to-gray-400 text-transparent bg-clip-text drop-shadow-sm">Market Boost AI</span>
      </h1>
      <p className="text-gray-400 text-lg md:text-2xl max-w-4xl mx-auto leading-relaxed font-light">
        Ubah Foto Produk Jadi <span className="text-white font-medium">Mesin Penjualan Otomatis.</span> Optimasi SEO, Copywriting, dan Strategi Visual Marketplace dalam 1 Klik.
      </p>
    </div>
  );
};
