import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 w-full py-24 border-t border-slate-200/50 dark:border-slate-800 font-body text-left">
      <div className="max-w-[1700px] mx-auto px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          {/* Brand Column */}
          <div className="space-y-8 text-left">
            <Link to="/" className="text-2xl font-black text-primary dark:text-blue-400 font-headline italic tracking-tighter">
              NestFind<span className="font-light not-italic opacity-50">Kenya</span>
            </Link>
            <p className="text-on-surface-variant/80 text-sm leading-relaxed font-medium italic text-left">
              Elevating the Kenyan real estate landscape through institutional-grade digital infrastructure and curated curation. Precision verified by NestFind Kenya.
            </p>
            <div className="flex gap-6 text-left">
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-all hover:scale-110">public</span>
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-all hover:scale-110">hub</span>
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-all hover:scale-110">shield</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-8 text-left">
            <h5 className="font-headline font-black text-primary dark:text-white uppercase tracking-[0.2em] text-[10px]">Ecosystem</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-left">
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/landlord/overview">Dashboard Pulse</Link></li>
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/houses">Property Anthology</Link></li>
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/insights">Investment Pulse</Link></li>
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/chatbot">AI Concierge</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-8 text-left">
            <h5 className="font-headline font-black text-primary dark:text-white uppercase tracking-[0.2em] text-[10px]">Legal & Authority</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-left">
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/terms">Real Estate Protocols</Link></li>
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/terms">Terms of Authority</Link></li>
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/privacy">Privacy Nodes</Link></li>
              <li><Link className="text-slate-500 hover:text-primary transition-colors" to="/support">Curator Support</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8 text-left">
            <h5 className="font-headline font-black text-primary dark:text-white uppercase tracking-[0.2em] text-[10px]">The Intelligence Brief</h5>
            <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic text-left">Receive quarterly institutional reports on high-growth capital nodes in the Nairobi metropolitan area.</p>
            <div className="flex gap-2 text-left">
              <input 
                className="bg-white border border-slate-200 rounded-full px-6 py-3 w-full text-xs font-bold focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-300" 
                placeholder="Email Registry" 
                type="email"
              />
              <button className="bg-primary text-white p-3 rounded-full flex items-center justify-center hover:bg-primary-container transition-all shadow-lg shadow-primary/20 border-none shrink-0">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-10 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-6 text-left">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">© 2024 NestFind Kenya Curator. Institutional Rights Reserved.</span>
          <div className="flex items-center gap-4 text-left">
            <div className="flex items-center gap-2 group cursor-help text-left">
               <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
               <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Protocol Live: GavaConnect Integrated</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Encrypted M-Pesa Tunnels Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
