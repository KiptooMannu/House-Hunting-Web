import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSendMessageMutation, useResetSessionMutation } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';

type ChatMsg = { role: 'user' | 'assistant'; text: string };

export default function Chatbot() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuth = !!(token && user);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { 
      role: 'assistant', 
      text: isAuth 
        ? `Greetings, ${user?.fullName || 'User'}. I am your Fintech Compliance Assistant. I have analyzed your linked KRA PIN and recent M-Pesa transaction history. How can I help you with your taxes, payments, or compliance status today?`
        : "Welcome to the Modern Estate Concierge. I'm your AI curator. What kind of property are you looking for today? Tell me about your budget, preferred location, and bedroom count." 
    }
  ]);
  const [input, setInput] = useState('');
  const [houses, setHouses] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [sendChatMessage, { isLoading: loading }] = useSendMessageMutation();
  const [resetChatSession] = useResetSessionMutation();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || loading) return;

    setError('');
    try {
      setMessages((prev) => [...prev, { role: 'user', text: message }]);
      setInput('');

      const res = await sendChatMessage({
        session_id: sessionId ?? undefined,
        message,
        persona: isAuth ? 'compliance' : 'house-hunting',
      }).unwrap();

      // Adjust based on the actual API response structure (checking both dats.data and direct res)
      const data = res.data || res;
      setSessionId(data?.session_id || data?.sessionId || sessionId);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data?.reply || "I've analyzed your request." },
      ]);

      if (Array.isArray(data?.houses)) {
        setHouses(data.houses);
      } else {
        setHouses([]);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.data?.message || err?.data?.error || 'Failed to send message.';
      setError(errMsg);
      toast.error(errMsg);
    }
  }

  async function reset() {
    setError('');
    try {
      if (sessionId) {
        await resetChatSession({ session_id: sessionId }).unwrap();
      }
    } catch {
    } finally {
      setSessionId(null);
      setMessages([
        { 
          role: 'assistant', 
          text: isAuth 
            ? "Compliance session reset. How can I assist with your financial or tax inquiries?"
            : "Concierge session reset. How can I help you find your new home?"
        }
      ]);
      setHouses([]);
    }
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 max-w-7xl mx-auto font-body text-left">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 h-auto lg:h-[calc(100vh-160px)]">
        
        {/* Chat Interface */}
        <section className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
           {/* Header */}
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                 </div>
                 <div>
                    <h2 className="text-xl font-black font-headline text-primary">AI Concierge</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                      Intelligence Active
                    </p>
                 </div>
              </div>
              <Button onClick={reset} variant="ghost" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-error">Reset Session</Button>
           </div>

           {/* Messages */}
           <ScrollArea className="flex-1 p-8 bg-slate-50/30">
              <div className="space-y-8 max-w-3xl mx-auto">
                 {messages.map((m, idx) => (
                   <div key={idx} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <Avatar className="w-10 h-10 shadow-sm">
                        {m.role === 'assistant' ? (
                          <AvatarFallback className="bg-primary text-white"><span className="material-symbols-outlined text-sm">smart_toy</span></AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-slate-200">U</AvatarFallback>
                        )}
                      </Avatar>
                      <div className={`p-6 rounded-3xl max-w-[80%] text-sm font-medium leading-relaxed shadow-sm ${
                        m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                      }`}>
                         {m.text}
                      </div>
                   </div>
                 ))}
                 {loading && (
                    <div className="flex items-start gap-4 animate-pulse">
                        <Avatar className="w-10 h-10"><AvatarFallback className="bg-primary/20"></AvatarFallback></Avatar>
                        <div className="p-6 bg-white rounded-3xl rounded-tl-sm w-32 h-12 border border-slate-50"></div>
                    </div>
                 )}
                 <div ref={scrollRef} />
              </div>
           </ScrollArea>

           {/* Compose */}
           <div className="p-8 bg-white border-t border-slate-50 relative z-10">
              <div className="max-w-3xl mx-auto relative flex items-center">
                 <Input 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                   placeholder="e.g. Find me a 3BR apartment in Kilimani for under 150k" 
                   className="w-full bg-slate-50 border-none rounded-full py-8 pl-8 pr-16 font-bold text-primary focus-visible:ring-primary/20 shadow-inner"
                 />
                 <Button 
                   onClick={sendMessage}
                   disabled={loading || !input.trim()}
                   className="absolute right-2 w-12 h-12 bg-primary hover:bg-primary-container text-white rounded-full p-0 flex items-center justify-center shadow-lg transition-transform active:scale-95 border-none"
                 >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                 </Button>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">Powered by Modern Estate LLM • KRA Compliant</p>
           </div>
        </section>

        {/* Curation Display */}
        <section className={`w-full lg:w-96 flex flex-col gap-6 ${houses.length === 0 ? 'hidden lg:flex' : ''}`}>
           <div className="bg-tertiary/10 rounded-3xl p-8 border border-tertiary/10">
              <h3 className="font-headline font-black text-tertiary text-xl mb-2">Discovery Card</h3>
              <p className="text-slate-500 text-sm font-medium">As you chat, I will curate matching properties in real-time right here.</p>
           </div>

           {houses.length > 0 ? (
              <ScrollArea className="flex-1">
                 <div className="space-y-6">
                    {houses.map(h => (
                      <Card key={h.id} className="rounded-2xl border-none shadow-md overflow-hidden group hover:ring-2 ring-primary/20 transition-all cursor-pointer" onClick={() => navigate(`/houses/${h.id}`)}>
                         <div className="h-32 relative">
                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={h.images?.[0] || 'https://lh3.googleusercontent.com/ia-m/AIda-public/home_placeholder.png'} alt={h.title} />
                            <Badge className="absolute top-2 right-2 bg-secondary text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Verified</Badge>
                         </div>
                         <CardContent className="p-4">
                            <h4 className="font-bold text-primary font-headline text-sm line-clamp-1">{h.title}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">{h.county}</p>
                            <span className="text-base font-black text-tertiary">{formatCurrency(h.rent)}</span>
                         </CardContent>
                      </Card>
                    ))}
                 </div>
              </ScrollArea>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                 <span className="material-symbols-outlined text-8xl mb-4">search_insights</span>
                 <p className="font-black font-headline text-lg uppercase tracking-tighter">Waiting for specs</p>
              </div>
           )}
        </section>
      </div>

      {error && <Badge variant="destructive" className="mt-4 p-4 w-full rounded-xl">{error}</Badge>}
    </main>
  );
}
