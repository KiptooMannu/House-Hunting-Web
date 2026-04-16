import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/apiSlice';
import { setCredentials } from '../../store/authSlice';

export default function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sessionExpired = searchParams.get('message') === 'session_expired';
  const from = (location.state as any)?.from;
  const showLandlordMsg = searchParams.get('message') === 'landlord_required';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { isLoading: loading }] = useLoginMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password }).unwrap();
      const { user, accessToken, refreshToken } = res;
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(setCredentials({ user, token: accessToken }));

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const role = user.role;
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'landlord') navigate('/landlord', { replace: true });
      else navigate('/houses', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.data?.error || err?.data?.message || 'Login failed. Please check your credentials.');
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-8 lg:p-12 font-body text-on-surface">
      <div className="max-w-[1100px] w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
        {/* ========== LEFT SIDE: VISUAL ANCHOR ========== */}
        <section className="hidden lg:flex relative overflow-hidden flex-col justify-end p-16">
          <div className="absolute inset-0 z-0 text-left">
            <img
              alt="Estate Anchor"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwegQ_-dj6TGfol1Le5oJ_wILGYnSO2hs-kwYaQ5WVYfgbubMrkpzvfWtnf3g6I5IhZfKJJ28q_jzrZpeYxIZeoWKOTHpkqy1bTyLxPaGGajVidTjEgxjA4ofKQJPKzLNI-U-CkKsb6pA6dBlbzsCbX6A_7QBsLlNbLiMuMdsZPh_-eR8s8a16fimCQe-5UjvNq5QF38cJW4J5jWkF5cYzBQRMSTpjNNDoyjP0oxoNDrbXiE1TRnDfZx_pJebbdVvVaP2Dvq6TM6Y"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
          </div>

          <div className="relative z-10 max-w-sm text-left">
            <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-8 italic">
              Defining the standard of <span className="text-secondary font-black">institutional</span> heritage.
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-white/30" />
              <p className="font-bold text-white/60 text-[10px] tracking-widest uppercase">
                Institutional Gateway
              </p>
            </div>
          </div>
        </section>

        {/* ========== RIGHT SIDE: LOGIN FORM ========== */}
        <section className="flex flex-col justify-center p-10 md:p-16 lg:p-20 bg-white relative text-left">
          <div className="w-full max-w-sm mx-auto flex flex-col">
            <div className="mb-12">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Estate Curator Alpha</span>
              <h2 className="font-black font-headline text-3xl text-primary mb-2 tracking-tighter">Authorize Entry</h2>
              <p className="text-slate-400 font-bold text-xs leading-relaxed uppercase tracking-tighter italic">
                Secure node access for premium asset curation.
              </p>
            </div>

            {showLandlordMsg && (
              <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-3xl animate-in zoom-in-95 mb-8">
                <p className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Curator Node Required</p>
                <p className="text-on-surface-variant text-xs font-bold leading-relaxed">
                  To deploy listings, authorize via a curator node or{' '}
                  <Link to="/register?role=landlord" className="text-secondary underline decoration-2 underline-offset-4 font-black">
                    Register Protocol
                  </Link>.
                </p>
              </div>
            )}

            {sessionExpired && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 mb-8">
                <span className="material-symbols-outlined text-primary">lock_clock</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Protocol Lock: Session Secured
                </p>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                 <span className="material-symbols-outlined text-sm">report</span>
                 {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 tracking-[0.2em] uppercase" htmlFor="email">
                  Identity Node
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg">alternate_email</span>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 text-sm outline-none"
                    placeholder="agent@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="block text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase" htmlFor="password">
                    Security Protocol
                  </label>
                  <a className="text-[9px] font-black text-primary uppercase tracking-widest hover:text-secondary transition-colors" href="#">
                    Recover Node
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg">lock</span>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 text-sm outline-none"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-6 space-y-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-black py-6 rounded-full shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[10px]"
                >
                  {loading ? 'Authenticating...' : 'Authorize Entry'}
                  {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-slate-100" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    Register Protocol
                  </span>
                  <div className="h-[1px] flex-1 bg-slate-100" />
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="w-full bg-white text-primary font-black py-4 rounded-full border border-slate-100 hover:bg-slate-50 transition-all text-[9px] uppercase tracking-widest"
                >
                  Deploy New Identity Node
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
