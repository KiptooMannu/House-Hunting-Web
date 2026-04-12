import { useState } from 'react';
import api from '../../../api/axios';

export default function AIConcierge() {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: `Greetings, curated investor. I have analyzed your portfolio performance against the current Savanna Ridge development. Your current liquidity is optimally positioned for a high-authority acquisition. Shall we review my top three refined selections?`,
      time: '9:41 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chatbot/message', { message: input });
      const botMsg = { 
        role: 'bot', 
        text: res.data?.data?.reply || "Analysis complete.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-8 animate-in fade-in slide-in-from-right-5 duration-700">
      {/* Conversational Core */}
      <section className="w-full lg:w-[450px] flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 overflow-hidden relative">
        <header className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-3xl font-variation-fill">smart_toy</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-primary font-headline tracking-tighter">AI Concierge</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Active Analysis Mode</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1">Equity Score</p>
              <p className="text-xl font-black text-primary font-headline tracking-tighter">84%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1">Portfolio Power</p>
              <p className="text-xl font-black text-primary font-headline tracking-tighter">KSh 42M</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[90%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
              <div className={`p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm font-medium ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm' 
                  : 'bg-slate-50 text-primary border border-slate-100 rounded-bl-sm'
              }`}>
                {m.isThinking && (
                  <div className="flex gap-2 items-center mb-3 text-secondary">
                    <span className="material-symbols-outlined text-sm animate-spin">filter_list</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Quiet Authority Engine Running...</span>
                  </div>
                )}
                {m.text}
              </div>
              <span className="text-[9px] mt-2 text-on-surface-variant font-black uppercase tracking-widest opacity-50 px-2">{m.time} • {m.role === 'bot' ? 'Savanna AI' : 'Protocol Node'}</span>
            </div>
          ))}
        </div>

        <div className="p-8 pt-0">
          <div className="relative group">
            <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
               className="w-full bg-slate-50 border-none rounded-full py-5 px-8 pr-16 text-sm font-bold text-primary placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
               placeholder="Inquire about regional yield..." 
               type="text"
            />
            <button 
              onClick={sendMessage}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined">{loading ? 'autorenew' : 'send'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Discovery Canvas Feature */}
      <section className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 p-10 overflow-y-auto hidden lg:block">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-primary font-headline tracking-tighter mb-2 italic underline decoration-secondary decoration-4 underline-offset-8">Discovery Canvas</h2>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed max-w-sm">AI-suggested property acquisitions based on your current equity distribution.</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Market Sentiment</p>
             <div className="flex items-center gap-2 text-secondary font-black bg-secondary/10 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined">trending_up</span>
                <span className="text-sm">BULLISH (+2.4%)</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 group cursor-pointer">
             <div className="relative aspect-[16/7] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 transition-all group-hover:shadow-primary/20">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdHtnQYFwzRoECJRBgSMDOHL1mPoOIL1CNwEJKpoPWljS_bDwQHsi8ls5kYwNEOnspkX13NKQLAbMbKCkV7M6f5hZsIpyubHdGZHarSqYLpKtd85JzxlMogtYsfewCE10jdVVFW9OrNKInUkBqpCvALQReKmSGo4I1X9B96Gh9LdvOkMHk7KUcgv8Pe0B3WIlfKGSST8euyJ-VJgwHzlC1S_6PvmulUCUDUw1CuYdOhKiReL6bR2dbDrdhRcuLaNWjgTOhC5mZ6uA" 
                  alt="Feature Match"
                />
                <div className="absolute top-8 left-8 flex gap-3">
                   <span className="bg-secondary text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">98% Strategic Match</span>
                   <span className="bg-white/90 backdrop-blur text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">Sustainable Tech</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 pt-20">
                   <div className="flex justify-between items-end">
                      <div>
                         <h3 className="text-3xl font-black text-white font-headline tracking-tighter mb-1">The Obsidian Pavillion</h3>
                         <p className="text-white/70 text-sm font-medium italic">Gigiri Heights Corridor • KSh 145M</p>
                      </div>
                      <button className="bg-white text-primary px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Details Portfolio</button>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="col-span-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
             <div className="relative z-10">
                <h4 className="font-black text-primary font-headline text-xl mb-4 tracking-tighter">Yield Forecast Expansion</h4>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black text-primary tracking-tighter">+18.2%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Annual</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-body">Driven by aggressive infrastructure expansion and embassy relocation projects in the Gigiri sector.</p>
             </div>
             <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[180px] text-primary opacity-[0.03] group-hover:scale-110 transition-transform">insights</span>
          </div>

          <div className="col-span-6 bg-primary text-white p-8 rounded-[2rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
             <div className="relative z-10 flex flex-col h-full justify-between">
                <h4 className="font-black font-headline text-xl mb-6 tracking-tighter">Acquisition Timeline</h4>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                         <span className="material-symbols-outlined text-xl">check</span>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Phase 01</p>
                         <p className="text-sm font-bold tracking-tight">Strategy Aligned</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shadow-xl">
                         <span className="material-symbols-outlined text-xl">map</span>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Phase 02</p>
                         <p className="text-sm font-black tracking-tight underline underline-offset-4 decoration-secondary">Discovery Mode Active</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
