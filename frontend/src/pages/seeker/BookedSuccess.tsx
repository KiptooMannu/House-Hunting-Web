import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function BookedSuccess() {
  const navigate = useNavigate();
  const [stampActive, setStampActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStampActive(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Success Header */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center text-white mb-8 shadow-2xl shadow-primary/40 relative">
            <span className="material-symbols-outlined text-4xl">verified</span>
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">
            Reservation <span className="text-primary italic">Secured.</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Your verification has been finalized. The property unit is now locked for your inspection.
          </p>
        </div>

        {/* Digital Compliance Receipt Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 mb-10 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-9xl">receipt_long</span>
          </div>

          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Audit Trail Node</p>
              <p className="text-sm font-bold text-slate-900 font-mono">GAVA-TX-CONF-8829</p>
            </div>
            <div className={`transition-all duration-700 transform ${stampActive ? 'opacity-100 scale-100 rotate-[-12deg]' : 'opacity-0 scale-150'}`}>
              <div className="px-4 py-1.5 border-4 border-emerald-500/30 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50">
                eTIMS Validated
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit Allocation</span>
              <span className="text-sm font-black text-slate-900">Standard Booking Fee</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KRA Compliance</span>
              <span className="text-[10px] font-bold text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">eTIMS Receipt #AUTO-GEN</span>
            </div>
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">MRI Revenue (7.5%)</p>
                <p className="text-lg font-black text-slate-800 tracking-tighter font-mono">KSh --.--</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Platform VAT (16%)</p>
                <p className="text-lg font-black text-slate-800 tracking-tighter font-mono">KSh --.--</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center font-medium italic">
            * This digital confirmation serves as a binding verification receipt for both Seeker and Landlord.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/user/bookings')}
            className="flex-1 max-w-[240px] px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
          >
            Manage Reservations
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 max-w-[240px] px-8 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95"
          >
            Find Another Unit
          </button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 text-slate-300 font-black uppercase tracking-[0.5em] text-[7px]">
          <span>GavaConnect Real-Time Gateway</span>
          <span className="w-1 h-1 bg-primary/40 rounded-full animate-ping"></span>
          <span>End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}
