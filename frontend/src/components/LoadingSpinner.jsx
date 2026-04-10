import React from 'react';

export default function LoadingSpinner({ text = 'Curating Your Selection...' }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md font-manrope">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        {/* Spinning Segment */}
        <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Pulse Core */}
        <div className="absolute inset-6 bg-secondary/20 rounded-full animate-pulse flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>luxury_residences</span>
        </div>
      </div>
      <div className="space-y-3 text-center">
        <h3 className="text-xl font-black text-primary tracking-tighter uppercase">{text}</h3>
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em] opacity-50">Savanna Horizon Protocol</p>
      </div>
    </div>
  );
}
