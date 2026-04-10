import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200/60 font-manrope">
      <div className="max-w-screen-2xl mx-auto px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-left">
          
          {/* Brand Vision */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-black text-primary tracking-tighter block mb-8">
              Modern Estate Curator
            </Link>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 font-medium">
              Redefining the luxury real estate experience in Kenya through editorial presentation and intelligent technology. Partnered with the GavaConnect Protocol.
            </p>
          </div>

          {/* Navigation Hub */}
          <div>
            <h5 className="font-black text-primary text-xs uppercase tracking-[0.3em] mb-10">Explore Hub</h5>
            <ul className="space-y-5">
              <li>
                <Link to="/dashboard" className="text-on-surface-variant hover:text-primary text-sm font-bold transition-all flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary scale-0 group-hover:scale-100 transition-transform"></span>
                  Personal Dashboard
                </Link>
              </li>
              <li>
                <Link to="/houses" className="text-on-surface-variant hover:text-primary text-sm font-bold transition-all flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary scale-0 group-hover:scale-100 transition-transform"></span>
                  Curated Listings
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-on-surface-variant hover:text-primary text-sm font-bold transition-all flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary scale-0 group-hover:scale-100 transition-transform"></span>
                  AI Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="font-black text-primary text-xs uppercase tracking-[0.3em] mb-10">Verification Hub</h5>
            <ul className="space-y-5">
              <li className="text-on-surface-variant text-sm font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                KRA Compliance
              </li>
              <li className="text-on-surface-variant text-sm font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>gshield</span>
                GavaConnect Verified
              </li>
              <li className="text-on-surface-variant text-sm font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Safaricom Secured
              </li>
            </ul>
          </div>

          {/* Intelligent Insights */}
          <div>
            <h5 className="font-black text-primary text-xs uppercase tracking-[0.3em] mb-10">Curated Insights</h5>
            <p className="text-on-surface-variant text-sm mb-6 font-medium opacity-70">Stay updated with our curated market intelligence.</p>
            <div className="relative group">
              <input 
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none pr-16" 
                placeholder="Email Address" 
                type="email"
              />
              <button className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-none">
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal Strip */}
        <div className="pt-12 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center md:text-left">
            © 2024 Modern Estate Curator. All Rights Reserved. GavaConnect Protocol Enabled.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.3em] transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.3em] transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.3em] transition-colors">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
