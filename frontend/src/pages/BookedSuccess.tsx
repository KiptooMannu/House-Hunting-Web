import { Link } from 'react-router-dom';

export default function BookedSuccess() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-8 shadow-xl shadow-secondary/20">
        <span className="material-symbols-outlined text-secondary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary mb-4 leading-tight">
        Booking Initiated <br/><span className="text-secondary text-2xl">Awaiting M-Pesa Confirmation.</span>
      </h1>
      <p className="text-on-surface-variant max-w-md text-lg leading-relaxed mb-12">
        A prompt has been sent to your phone. Once you enter your PIN, your reservation at <span className="font-bold text-on-surface">The Horizon Estate</span> will be finalized.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</p>
            <p className="text-xs font-bold text-primary">SH-MPESA-98210X</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <span className="material-symbols-outlined text-secondary">event_available</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Viewing Date</p>
            <p className="text-xs font-bold text-primary">Aug 24, 2:00 PM</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/my-bookings" className="px-10 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity">Track Booking Status</Link>
        <Link to="/houses" className="px-10 py-4 bg-white border border-slate-200 text-on-surface rounded-full font-bold hover:bg-slate-50 transition-colors">Return to Explorer</Link>
      </div>

      <p className="mt-16 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">
        Secured by GavaConnect & Safaricom
      </p>
    </div>
  );
}
