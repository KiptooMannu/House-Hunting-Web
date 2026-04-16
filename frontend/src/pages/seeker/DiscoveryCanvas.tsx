import { useState, useRef, useEffect } from 'react';
import { useSendMessageMutation, useResetSessionMutation } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function DiscoveryCanvas() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [resetSession] = useResetSessionMutation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, customMsg?: string) => {
    e?.preventDefault();
    const msg = customMsg || input;
    if (!msg.trim() || isLoading) return;

    const userMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage({ message: msg }).unwrap();
      setMessages(prev => [...prev, { role: 'assistant', ...response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my central brain. Please try again." }]);
    }
  };

  const handleReset = async () => {
    await resetSession({}).unwrap();
    setMessages([]);
  };

  const suggestions = [
    "Find me a 3-bedroom house in Westlands under 150k",
    "Show me luxury lofts with gym and pool access",
    "Identify family-friendly neighborhoods with top schools",
    "What's the demand trend for Kilimani lately?"
  ];

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col animate-in fade-in zoom-in-95 duration-700">
      <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
        {/* Chat Stream (Col 1-8) */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
           <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">auto_awesome</span>
                 </div>
                 <div>
                    <h3 className="font-black font-headline text-primary text-sm uppercase tracking-widest leading-none">Discovery Canvas</h3>
                    <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-tighter">AI Concierge Active</p>
                 </div>
              </div>
              <button 
                onClick={handleReset}
                className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-red-50"
                title="Reset Session"
              >
                 <span className="material-symbols-outlined text-xl">restart_alt</span>
              </button>
           </header>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth hide-scrollbar bg-slate-50/10">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                   <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
                      <span className="material-symbols-outlined text-6xl">travel_explore</span>
                   </div>
                   <div>
                      <h3 className="text-2xl font-black font-headline text-primary tracking-tighter">Initiate Discovery</h3>
                      <p className="text-on-surface-variant font-medium mt-2">Speak naturally. I understand specific requirements, neighborhood nuances, and market data.</p>
                   </div>
                   <div className="grid grid-cols-1 gap-2 w-full text-left">
                      {suggestions.map(s => (
                        <button 
                           key={s} 
                           onClick={() => handleSend(undefined, s)}
                           className="p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-primary hover:border-secondary hover:shadow-md transition-all flex items-center group"
                        >
                           <span className="material-symbols-outlined text-slate-300 mr-3 group-hover:text-secondary">search</span>
                           {s}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                   <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm border ${
                     m.role === 'user' 
                     ? 'bg-primary text-white border-transparent' 
                     : 'bg-white text-primary border-slate-100'
                   } text-left`}>
                      <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                      
                      {/* Rich Content: Property Cards */}
                      {m.properties && m.properties.length > 0 && (
                        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
                           {m.properties.map((p: any) => (
                             <div 
                                key={p.houseId} 
                                className="w-64 bg-slate-50 rounded-2xl overflow-hidden shrink-0 snap-start border border-slate-200 group cursor-pointer"
                                onClick={() => navigate(`/houses/${p.houseId}`)}
                             >
                                <div className="h-32 overflow-hidden">
                                   <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={p.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"} alt="Property" />
                                </div>
                                <div className="p-4">
                                   <p className="font-black text-xs text-primary truncate">{p.title}</p>
                                   <p className="text-[10px] font-black text-secondary mt-1">{formatCurrency(p.monthlyRent)}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                   </div>
                </div>
              )}
           </div>

           <footer className="px-8 py-8 border-t border-slate-50 bg-white">
              <form onSubmit={handleSend} className="relative flex items-center gap-4">
                 <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">chat_bubble</span>
                    <input 
                       className="w-full pl-14 pr-14 py-5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary placeholder:text-slate-400 text-sm"
                       placeholder="Describe your ideal sanctuary..."
                       value={input}
                       onChange={e => setInput(e.target.value)}
                       disabled={isLoading}
                    />
                    <button 
                       type="submit"
                       disabled={!input.trim() || isLoading}
                       className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:bg-slate-300 transition-all"
                    >
                       <span className="material-symbols-outlined text-base">send</span>
                    </button>
                 </div>
              </form>
           </footer>
        </div>

        {/* Intelligence Panel (Col 9-12) */}
        <div className="hidden lg:block w-80 space-y-8 overflow-y-auto hide-scrollbar">
           <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-slate-100 text-left space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant font-headline">Discovery Intelligence</h4>
              
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">IDENTIFIED PREFERENCES</p>
                    <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1.5 bg-white rounded-full text-[10px] font-black text-primary border border-slate-100 shadow-sm">Westlands</span>
                       <span className="px-3 py-1.5 bg-white rounded-full text-[10px] font-black text-primary border border-slate-100 shadow-sm">Modern Lofts</span>
                       <span className="px-3 py-1.5 bg-white rounded-full text-[10px] font-black text-primary border border-slate-100 shadow-sm">KES 150k Max</span>
                    </div>
                 </div>
                 
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">QUICK ACTIONS</p>
                    <div className="space-y-2">
                       <button className="w-full p-4 bg-white rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-primary hover:border-secondary transition-all flex items-center justify-between">
                          Summarize Findings <span className="material-symbols-outlined text-sm">summarize</span>
                       </button>
                       <button className="w-full p-4 bg-white rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-primary hover:border-secondary transition-all flex items-center justify-between">
                          Schedule Batch Viewing <span className="material-symbols-outlined text-sm">calendar_month</span>
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-primary p-8 rounded-[2.5rem] text-white text-left relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Insight of the Hour</p>
                 <p className="text-sm font-medium leading-relaxed group-hover:opacity-100 transition-opacity">"Rentals in Parklands are currently yielding 15% higher occupancy than Westlands residential zones."</p>
                 <button className="mt-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    Explore Parklands <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </button>
              </div>
              {/* Decor */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary opacity-20 rounded-full blur-2xl"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
