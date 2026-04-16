import { useNavigate } from 'react-router-dom';

export default function BookedSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 mb-10 transform scale-110">
        <span className="material-symbols-outlined text-5xl font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-primary mb-6">
        Reservation <span className="italic">Secured.</span>
      </h1>
      
      <p className="text-on-surface-variant max-w-lg mb-12 text-lg font-medium leading-relaxed italic opacity-80">
        Your booking request has been successfully transmitted through the GavaConnect gateway. A KRA-compliant eTIMS tax invoice has been auto-generated and is available in your dashboard history.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <button 
          onClick={() => navigate('/user/bookings')}
          className="px-12 py-5 bg-primary text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-container transition-all shadow-xl hover:scale-105"
        >
          View Timeline
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-12 py-5 bg-white border border-slate-200 text-primary rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm"
        >
          Return Home
        </button>
      </div>

      <div className="mt-20 flex items-center gap-4 text-secondary/40 font-black uppercase tracking-[0.4em] text-[8px]">
        <span>GavaConnect Secure</span>
        <span className="w-1 h-1 bg-current rounded-full"></span>
        <span>Institutional Node</span>
      </div>
    </div>
  );
}
