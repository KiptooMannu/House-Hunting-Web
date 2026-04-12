import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white pt-32 pb-16 border-t border-slate-100 text-left font-headline">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 px-6 lg:px-12 max-w-[1440px] mx-auto mb-32 text-left">
          <div className="md:col-span-1 text-left">
            <Link to="/" className="text-xl font-black text-primary block mb-8 uppercase tracking-widest">
                SAVANNA<span className="font-light">HORIZON</span>
            </Link>
            <p className="text-on-surface-variant text-sm font-light leading-relaxed mb-8">
                Redefining luxury real estate in Kenya through editorial presentation and intelligent infrastructure.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">public</span></a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">mail</span></a>
            </div>
          </div>
          <div className="text-left">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10">Portfolio</h5>
            <ul className="space-y-6 text-left">
              <li><Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/landlord">Luxury Dashboard</Link></li>
              <li><Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/houses">Private Listings</Link></li>
              <li><Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/insights">Investment Gallery</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10">Intelligence</h5>
            <ul className="space-y-6 text-left">
              <li><Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/messages">Concierge Support</Link></li>
              <li><Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/terms">Market Legalities</Link></li>
              <li><Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/privacy">Ethical Protocols</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10">The Insight</h5>
            <p className="text-sm text-on-surface-variant font-light mb-8 leading-relaxed">Exclusive monthly analysis on Kenyan real estate appreciation.</p>
            <div className="flex p-1 bg-slate-50 rounded-full focus-within:ring-2 focus-within:ring-primary/20 transition-all text-left">
              <input className="bg-transparent border-none rounded-full px-6 py-2 w-full text-xs font-medium focus:ring-0 outline-none" placeholder="Email Address" type="email"/>
              <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-primary-container transition-all border-none">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-slate-50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© 2024 SAVANNA HORIZON ASSET MANAGEMENT. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link className="hover:text-primary transition-colors" to="/privacy">Privacy</Link>
            <Link className="hover:text-primary transition-colors" to="/terms">Terms</Link>
            <a className="hover:text-primary transition-colors cursor-pointer">Cookies</a>
          </div>
        </div>
      </footer>
  );
}
