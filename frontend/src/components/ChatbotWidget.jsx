import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Don't show on admin or landlord pages if preferred, but usually it's global
  // For now, let's keep it global as requested by the HTML design

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col h-[500px] w-[350px] md:w-[400px] mb-4 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm leading-none">Estate Assistant</p>
                <p className="text-[10px] text-on-primary-container uppercase tracking-wider font-bold">Online & Ready</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-left">
            <div className="flex flex-col items-start gap-1">
              <div className="bg-secondary-container text-on-secondary-container p-4 rounded-xl rounded-bl-sm max-w-[85%] text-sm shadow-sm leading-relaxed">
                Hi! I'm your house-hunting assistant. What is your budget for a house in Kenya today?
              </div>
              <span className="text-[10px] text-slate-400 ml-1">Assistant · Now</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['Under KES 10M', 'KES 10M - 50M', 'Above KES 50M'].map((budget) => (
                <button 
                  key={budget}
                  className="px-3 py-1.5 bg-white border border-outline-variant text-xs rounded-full hover:bg-slate-50 transition-colors"
                >
                  {budget}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input 
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400" 
                placeholder="Tell me what you're looking for..." 
                type="text"
              />
              <button className="absolute right-2 text-primary p-1.5 hover:bg-white rounded-lg transition-colors">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-tertiary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'chat_bubble'}
        </span>
      </button>
    </div>
  );
}
