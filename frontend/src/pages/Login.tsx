import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/apiSlice';
import { setCredentials } from '../store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
      console.log('✅ Auth success in frontend:', res);
      const { user, accessToken, refreshToken } = res;
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(setCredentials({ user, token: accessToken }));

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const role = user.role;
      console.log('🏁 Navigating to role-based dashboard:', role);
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'landlord') navigate('/landlord', { replace: true });
      else navigate('/houses', { replace: true });
    } catch (err: any) {
      console.error('❌ Auth error in frontend:', err);
      setError(err?.data?.error || err?.data?.message || 'Login failed. Please check your credentials.');
    }
  }

  return (
    <main className="flex min-h-screen bg-surface font-body text-on-surface antialiased overflow-hidden">
      {/* Left Side: Visual Anchor */}
      <section className="hidden lg:flex lg:w-3/5 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury Kenyan Villa"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx4YhjQetpBGj3c9OW8qr4tL64ZPtmOItiI5ZkfbX7UJ87LuWz7bxN8EFL_ceF3UKnNZkb0NweR_cmHkGiQaT5v5Tg-w7YTR8YOuA-bj_8XxMHYH8X_uYecnUr0KFt089ztpm3CmGSeUYc5RcgSp83ZPmWjpqLCw_h0mdtE6t4TOHCHwZTXw2nqKOgjbUD12ZCYI0RADil1ZzV9YlpRTvLJ4AYOP1O1juxiQxuAUhy8JzNfftGm8VfR32UdHQMRjdMtz0LF7TiCZU"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-primary/20"></div>
        </div>
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <span className="material-symbols-outlined text-primary-fixed-dim text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <blockquote className="text-white">
              <p className="font-headline text-3xl font-light leading-snug tracking-tight italic">
                "Real estate is not just about ownership; it is the ultimate anchor of generational stability and legacy."
              </p>
              <footer className="mt-6 text-white/70 font-label text-[10px] tracking-[0.4em] uppercase font-black">
                — Savanna Horizon Insights
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="absolute top-12 left-12 z-10">
          <h1 className="font-headline text-white text-2xl font-black tracking-tighter italic">Savanna Horizon.</h1>
        </div>
      </section>

      {/* Right Side: Interaction Canvas */}
      <section className="w-full lg:w-2/5 bg-white flex flex-col justify-center px-8 md:px-16 lg:px-20 xl:px-24">
        <div className="max-w-md w-full mx-auto space-y-10">
          {/* Brand Header for Mobile */}
          <div className="lg:hidden mb-8">
            <h1 className="font-headline text-primary text-2xl font-black tracking-tighter italic">Savanna Horizon.</h1>
          </div>

          <header className="space-y-4">
            <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight italic">Welcome Back.</h2>
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed">Access your premium property portfolio and curated insights through our secure terminal.</p>
          </header>

          {showLandlordMsg && (
            <div className="p-5 bg-secondary/5 border-l-4 border-secondary rounded-r-2xl animate-in fade-in slide-in-from-left-4">
              <p className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Curator Access Required</p>
              <p className="text-on-surface-variant text-xs font-bold leading-relaxed">
                To list properties, sign in to your curator account or <Link to="/register?role=landlord" className="text-secondary underline decoration-2 underline-offset-4 font-black">Register as Landlord</Link>.
              </p>
            </div>
          )}

          {sessionExpired && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-primary">lock_clock</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol Lock Active: Session secured due to inactivity.</p>
            </div>
          )}

          {error && <Badge variant="destructive" className="mb-6 p-4 w-full rounded-xl shadow-lg border-none font-bold">{error}</Badge>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40 ml-1" htmlFor="email">Identity Node (Email)</label>
              <Input
                id="email"
                type="email"
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 text-primary font-bold placeholder:text-slate-300 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all shadow-inner"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-black text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40" htmlFor="password">Security Protocol (Password)</label>
                <a className="text-[10px] font-black text-primary hover:text-secondary transition-all uppercase tracking-widest" href="#">Forgot Code?</a>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 text-primary font-bold placeholder:text-slate-300 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-white py-8 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] border-none"
              >
                {loading ? 'Authenticating...' : 'Authorize Entry'}
              </Button>
            </div>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Enhanced Security</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-4 bg-white border border-slate-100 text-on-surface-variant font-black text-[10px] uppercase tracking-widest py-6 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>smartphone</span>
              <span>Sign in with M-Pesa Node</span>
            </button>
          </div>

          <footer className="text-center pt-8 border-t border-slate-50">
            <p className="text-on-surface-variant text-xs font-medium">
              New to the collection?
              <Link to="/register" className="text-primary font-black hover:underline underline-offset-4 ml-2">Inquire for Registry</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
