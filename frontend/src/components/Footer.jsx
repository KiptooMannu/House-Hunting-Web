import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 px-6 mt-20 tonal-shift border-t-0 bg-slate-100/30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <div className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Modern Estate</div>
          <p className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-400 mb-6">
            Curated property experiences across East Africa. Quality, transparency, and intelligence in every listing.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-slate-400">social_leaderboard</span>
            <span className="material-symbols-outlined text-slate-400">public</span>
            <span className="material-symbols-outlined text-slate-400">share</span>
          </div>
        </div>
        <div>
          <h4 className="font-manrope font-bold text-sm text-sky-900 mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">About Us</Link></li>
            <li><Link to="/support" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Support</Link></li>
            <li><Link to="/privacy" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-manrope font-bold text-sm text-sky-900 mb-4">Locations</h4>
          <ul className="space-y-2">
            <li><Link to="/houses?location=Nairobi" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Nairobi</Link></li>
            <li><Link to="/houses?location=Mombasa" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Mombasa</Link></li>
            <li><Link to="/houses?location=Kisumu" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Kisumu</Link></li>
            <li><Link to="/houses?location=Nakuru" className="font-inter text-xs text-slate-500 hover:text-sky-800 transition-colors">Nakuru</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-manrope font-bold text-sm text-sky-900 mb-4">Partnered With</h4>
          <div className="text-sky-700 font-bold text-lg tracking-tight mb-4">GavaConnect</div>
          <p className="font-inter text-xs text-slate-400 leading-relaxed">
            © 2024 Modern Estate curator. Partnered with GavaConnect.
          </p>
        </div>
      </div>
    </footer>
  );
}
