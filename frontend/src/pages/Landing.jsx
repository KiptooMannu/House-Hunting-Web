import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function Landing() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="bg-background font-body text-on-surface">
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover brightness-[0.85]" 
              alt="Modern luxury villa in Karen Nairobi" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx4YhjQetpBGj3c9OW8qr4tL64ZPtmOItiI5ZkfbX7UJ87LuWz7bxN8EFL_ceF3UKnNZkb0NweR_cmHkGiQaT5v5Tg-w7YTR8YOuA-bj_8XxMHYH8X_uYecnUr0KFt089ztpm3CmGSeUYc5RcgSp83ZPmWjpqLCw_h0mdtE6t4TOHCHwZTXw2nqKOgjbUD12ZCYI0RADil1ZzV9YlpRTvLJ4AYOP1O1juxiQxuAUhy8JzNfftGm8VfR32UdHQMRjdMtz0LF7TiCZU"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-xs tracking-widest uppercase mb-6">
                Curated For You
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tighter mb-8">
                Find Your Next Home via Chat
              </h1>
              <p className="text-white/90 text-lg md:text-xl font-medium max-w-lg mb-10 leading-relaxed">
                Experience Kenya's first AI-driven property search. From Nairobi penthouses to coastal retreats, we find exactly what you're looking for.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/chatbot" 
                  className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  Start Guided Search
                  <span className="material-symbols-outlined">smart_toy</span>
                </Link>
                <Link 
                  to="/houses" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg shadow-xl hover:bg-white/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  Browse Manually
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Section */}
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-primary tracking-tight mb-4">Redefining Real Estate</h2>
              <p className="text-on-surface-variant text-lg">Modern solutions for the sophisticated Kenyan market.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Feature 1: Guided Search */}
              <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 md:p-12 flex flex-col justify-between group overflow-hidden relative">
                <div className="relative z-10 max-w-md">
                  <span className="material-symbols-outlined text-4xl text-primary mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                  <h3 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-4">Intelligent Guided Search</h3>
                  <p className="text-on-surface-variant leading-relaxed">Stop scrolling through endless grids. Describe your lifestyle to our AI assistant and get a curated shortlist of properties that actually match your needs.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
              </div>

              {/* Feature 2: M-Pesa */}
              <div className="md:col-span-4 bg-secondary-container/30 rounded-xl p-8 flex flex-col justify-center items-center text-center border-0">
                <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-secondary-fixed mb-3">Seamless M-Pesa Booking</h3>
                <p className="text-on-secondary-fixed-variant text-sm">Instant viewing reservations and deposit payments via Kenya's most trusted mobile money platform.</p>
              </div>

              {/* Feature 3: Verified */}
              <div className="md:col-span-5 bg-primary-container text-white rounded-xl p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-3xl text-on-primary-container mb-4">verified_user</span>
                  <h3 className="font-headline text-2xl font-bold mb-4">100% Verified Listings</h3>
                  <p className="text-white/80 leading-relaxed text-sm">Every property on Modern Estate undergoes a rigorous document and physical verification process. No ghost listings, no scams.</p>
                </div>
                <div className="mt-8 flex gap-2">
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">KRA Verified</div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">Site Surveyed</div>
                </div>
              </div>

              {/* Feature 4: Market Insight */}
              <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center border border-outline-variant/10">
                <div className="w-full md:w-1/2">
                  <img className="rounded-lg w-full h-48 object-cover" alt="Nairobi Central Business District skyline" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvOwV3eSwxEnKO4-KTpXkrkpaYnVko2tay02cMJJnQXmNLy11myd-icca7uLd8DtGAyj6o0RwmlYbIxyuDhQVUUnoJQ050jAZoB9ztwQlqahDL_jOxNkB8RZbDxcRCozW4qlZ3Tisj7CBnAzk3jzi7U-UMgW_SwD6usgs9vzCF8GVP5oTNTmbo_VTna0TlvPauIZsuJA0d_NcvVY1TY2oCHMUvXWtZqx9_qM8NzuB4VF1yaM0d5841yLrAvGvtArQWRl7dcyF6wSA"/>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="font-headline text-xl font-bold text-primary mb-3">Nairobi Market Insights</h3>
                  <p className="text-on-surface-variant text-sm mb-4">Get real-time data on rental yields and property appreciation across Westlands, Kilimani, and Runda.</p>
                  <Link to="/houses" className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    View Trends <span className="material-symbols-outlined">trending_up</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="font-headline font-black text-2xl text-slate-400">GavaConnect</div>
              <div className="font-headline font-black text-2xl text-slate-400">Nairobi City</div>
              <div className="font-headline font-black text-2xl text-slate-400">Equity Bank</div>
              <div className="font-headline font-black text-2xl text-slate-400">Safaricom</div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Chatbot Widget (Preview) */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
        {chatOpen ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col h-[500px] w-[calc(100vw-3rem)] sm:w-[350px] md:w-[400px] mb-4">
            <div className="bg-primary p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">Estate Assistant</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Online & Ready</p>
                </div>
              </div>
              <button className="text-white/60 hover:text-white transition-colors" onClick={() => setChatOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              <div className="flex flex-col items-start gap-1">
                <div className="bg-secondary-container text-on-secondary-container p-4 rounded-xl rounded-bl-sm max-w-[85%] text-sm shadow-sm leading-relaxed">
                  Hi! I'm your house-hunting assistant. What is your budget for a house in Kenya today?
                </div>
                <span className="text-[10px] text-slate-400 ml-1">Assistant · Now</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => navigate('/chatbot?budget=10M')} className="px-3 py-1.5 bg-white border border-outline-variant text-xs rounded-full hover:bg-slate-50 transition-colors">Under KES 10M</button>
                <button onClick={() => navigate('/chatbot?budget=10M-50M')} className="px-3 py-1.5 bg-white border border-outline-variant text-xs rounded-full hover:bg-slate-50 transition-colors">KES 10M - 50M</button>
                <button onClick={() => navigate('/chatbot?budget=50M+')} className="px-3 py-1.5 bg-white border border-outline-variant text-xs rounded-full hover:bg-slate-50 transition-colors">Above KES 50M</button>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input 
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400" 
                  placeholder="Tell me what you're looking for..." 
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/chatbot');
                  }}
                />
                <button className="absolute right-2 text-primary p-1.5 hover:bg-white rounded-lg transition-colors" onClick={() => navigate('/chatbot')}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setChatOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}
