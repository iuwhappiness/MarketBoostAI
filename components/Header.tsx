
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0f111a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-2 rounded-lg shadow-lg shadow-indigo-900/20 group-hover:shadow-indigo-900/40 transition-all transform group-hover:scale-105">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Market Boost</h1>
                <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase opacity-70">AI Growth Engine v3.0</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-gray-500">
             <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                System Ready
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};
