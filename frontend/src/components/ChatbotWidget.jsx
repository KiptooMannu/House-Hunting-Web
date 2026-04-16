import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSendMessageMutation } from '../store/apiSlice';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your house-hunting assistant. What is your budget for a house in Kenya today?" }
  ]);
  const messagesEndRef = useRef(null);
  
  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');

    try {
      const res = await sendMessage({ message: textToSend }).unwrap();
      setMessages(prev => [...prev, { role: 'bot', text: res.data?.reply || res.reply || 'Analysis complete.'}]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting to the network right now.' }]);
    }
  };

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
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col items-${msg.role === 'user' ? 'end' : 'start'} gap-1`}>
                <div className={`${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-secondary-container text-on-secondary-container rounded-bl-sm'} p-4 rounded-xl max-w-[85%] text-sm shadow-sm leading-relaxed whitespace-pre-wrap`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mx-1">{msg.role === 'bot' ? 'Assistant' : 'You'}</span>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex flex-col items-start gap-1">
                 <div className="bg-secondary-container text-on-secondary-container p-4 rounded-xl rounded-bl-sm flex items-center gap-2 max-w-[85%] text-sm shadow-sm">
                    <span className="material-symbols-outlined text-sm animate-spin">filter_list</span>
                    Thinking...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
             {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {['Under KES 10M', 'KES 10M - 50M', 'Above KES 50M'].map((budget) => (
                  <button 
                    key={budget}
                    onClick={() => handleSend(budget)}
                    className="px-3 py-1.5 bg-white border border-outline-variant text-xs rounded-full hover:bg-slate-50 transition-colors"
                  >
                    {budget}
                  </button>
                ))}
              </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input 
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400" 
                placeholder="Tell me what you're looking for..." 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={() => handleSend()} className="absolute right-2 text-primary p-1.5 hover:bg-white rounded-lg transition-colors">
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
