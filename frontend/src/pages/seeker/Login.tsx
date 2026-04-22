import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/apiSlice';
import { setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';

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

  const [login, { isLoading: loading }] = useLoginMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      const { user, accessToken, refreshToken } = res;
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(setCredentials({ user, token: accessToken }));

      if (from) { navigate(from, { replace: true }); return; }

      const role = user.role;
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'landlord') navigate('/landlord', { replace: true });
      else navigate('/houses', { replace: true });
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errMsg);
    }
  }

  return (
    <main className="min-h-screen w-full relative font-body overflow-x-hidden">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        <img
          alt="Luxury Architecture"
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      {/* Content: sits below the fixed navbar (navbar ~72px tall) */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-10">

          {/* Brand Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black text-on-surface tracking-tight mb-1">Welcome Back</h1>
            <p className="text-on-surface-variant text-sm mt-2">Sign in to your NestFind account.</p>
          </div>

          {/* Contextual Messages */}
          {sessionExpired && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-lg">lock_clock</span>
              <p className="text-amber-700 text-xs font-semibold">Your session expired. Please sign in again.</p>
            </div>
          )}

          {showLandlordMsg && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-blue-700 text-xs font-semibold">
                You need a Landlord account.{' '}
                <Link to="/register?role=landlord" className="underline font-bold">Register here</Link>.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-primary font-medium focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 text-sm outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-primary font-medium focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 text-sm outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
