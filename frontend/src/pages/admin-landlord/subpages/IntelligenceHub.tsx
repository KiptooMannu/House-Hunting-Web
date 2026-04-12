import { formatCurrency } from '../../../utils/helpers';

export default function IntelligenceHub() {

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="max-w-4xl">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-2 font-headline">Investment Intelligence Hub</h2>
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-body">Curating real-time data for the discerning Kenyan investor. Track appreciation across Nairobi’s most prestigious corridors.</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Market Pulse - Featured Property */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] shadow-2xl shadow-primary/5 border border-slate-100 transition-all hover:translate-y-[-4px] group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-1 block">Market Pulse</span>
              <h3 className="text-2xl font-black text-primary font-headline tracking-tighter">Portfolio Alpha</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-8 bg-slate-50 relative group-hover:shadow-xl transition-all">
            <img 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK2TlOPb_L-BH6NIcT5M7_dELo-ymi7fMxFPlNjb9H3U4xd0hap_SD2ppyzZiOw3bJTWXkxgioPk1D1asDj10JJ1T8DTEE5vLX1_KlDOENDaLxBIeUOOHS2ceiRJ7YScd1DMw-jsaBWVP6g8wrrBd6ghQ68HfgWPqq4JUNm-ZKJO7zsqt2nuJdkMDfqOThgsMESsBjahu3WxUoce_b3KSchJyLIoss_Dp2iNvmBeeHjYIjiMxSmxVfYtbCaP4sVaxzQAaQ0Qx2Ngk" 
              alt="Premium Asset"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">Verified Node</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest mb-2">Appreciation</p>
              <p className="text-xl font-black text-primary font-headline">+12.4% <span className="text-[10px] text-slate-400 font-bold ml-1">YoY</span></p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest mb-2">Avg. Yield</p>
              <p className="text-xl font-black text-primary font-headline">6.8%</p>
            </div>
          </div>
        </div>

        {/* Growth Trajectory Chart Mockup */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-primary font-headline tracking-tighter">Growth Trajectory</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Capital appreciation over selected cycle</p>
            </div>
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100">
              <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary text-white shadow-lg transition-all">12 Months</button>
              <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full text-slate-400 hover:text-primary transition-all">5 Years</button>
            </div>
          </div>
          
          <div className="h-72 flex items-end gap-3 px-2 relative pt-10">
             <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between py-10 pointer-events-none">
                {[1,2,3,4].map(i => <div key={i} className="border-t border-slate-50 w-full h-0"></div>)}
             </div>
             {/* Dynamic Bars */}
             {[40, 45, 55, 50, 65, 75, 85, 95, 80, 88, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-primary/5 to-primary rounded-t-2xl group relative transition-all hover:scale-x-110 active:scale-95" style={{ height: `${h}%` }}>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-xl scale-0 group-hover:scale-100 transition-transform origin-bottom shadow-xl z-20 whitespace-nowrap">
                        Month {i+1}: {formatCurrency(h * 100000)}
                    </div>
                </div>
             ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2 font-label">
            <span>January Cycle</span>
            <span>Performance Peak</span>
          </div>
        </div>

        {/* Heat Map Section Mockup */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 min-h-[450px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-primary font-headline tracking-tighter">Regional Heatmap</h3>
            <p className="text-[13px] text-on-surface-variant font-medium mt-1 leading-relaxed">Density of high-yield rental transactions by neighborhood corridor.</p>
          </div>
          <div className="flex-1 rounded-[2rem] overflow-hidden relative border border-slate-50 group">
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
              <img 
                className="w-full h-full object-cover mix-blend-multiply" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4q8gvXLFQv0GlptnjUx6qTUS5HP3qk19hBh11EiIdKaKnmE8OglBKV8DV8Ds26CS7-t2c7M_E5O5k_X5aBFvyuiedmyAj9G57N2u_A87KmeiKwh9KjM7HgdjO_SYCzs0i64Un5oHbb9KJ_iAELOGhg0lj13jChRh2OLOJP4HWO3naKcS1GxQ3j2oW_L_k-TN-vb8NdWbBR2aNKnvzt_iNCfTULKoE6DvKWvbVw9-hleA1gBa5SoXuT1yDAhsOSjyA_09fTMcQUmE" 
                alt="Nairobi Map"
              />
              {/* Floating Intelligence Anchors */}
              <div className="absolute top-1/4 left-1/3 animate-bounce shadow-2xl">
                 <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl border border-secondary/20 shadow-2xl">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Westlands</p>
                    <p className="text-sm font-black text-secondary">+18.4%</p>
                 </div>
              </div>
              <div className="absolute top-1/2 left-1/2 shadow-2xl">
                 <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl border border-primary/20 shadow-2xl">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Gigiri</p>
                    <p className="text-sm font-black text-primary">+12.1%</p>
                 </div>
              </div>
              <div className="absolute bottom-1/4 right-1/4 shadow-2xl">
                 <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl border border-tertiary/20 shadow-2xl">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Karen Cor.</p>
                    <p className="text-sm font-black text-tertiary-container">+22.5%</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Architect Calculator */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary to-primary-container text-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/20 flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-black font-headline tracking-tighter mb-2">Yield Architect</h3>
            <p className="text-primary-fixed/70 text-sm mb-10 italic font-body">Sophisticated projections for the curated portfolio.</p>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 mb-3 block">Property Valuation (KSh)</label>
                <input className="w-full bg-white/10 border-none rounded-2xl py-5 px-6 text-white font-bold placeholder:text-white/20 focus:ring-2 focus:ring-secondary shadow-inner" placeholder="Enter Value" defaultValue="45,000,000" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 mb-3 block">Market Rental Rate (KSh)</label>
                <input className="w-full bg-white/10 border-none rounded-2xl py-5 px-6 text-white font-bold placeholder:text-white/20 focus:ring-2 focus:ring-secondary shadow-inner" placeholder="Enter Rate" defaultValue="280,000" />
              </div>
            </div>
          </div>
          <div className="mt-12 pt-10 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 mb-1">Net Yield Efficiency</p>
              <p className="text-5xl font-black text-white font-headline tracking-tighter italic">7.42%</p>
            </div>
            <button className="bg-white text-primary p-5 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl">
              <span className="material-symbols-outlined text-3xl">refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
