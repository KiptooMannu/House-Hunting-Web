import { useNavigate, useLocation } from 'react-router-dom';

export default function PageExit() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleBack = () => {
    // If we're at the root of a dashboard, we go to landing.
    // Otherwise, we go back in history.
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      onClick={handleBack}
      className="p-3 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl text-slate-500 hover:text-primary hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0 border-none cursor-pointer"
      title="Go Back"
    >
      <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
    </button>
  );
}
