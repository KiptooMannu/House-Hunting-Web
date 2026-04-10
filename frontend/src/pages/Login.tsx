import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/apiSlice';
import { setCredentials } from '../store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [login, { isLoading: loading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password }).unwrap();
      console.log('✅ Auth success in frontend:', res);
      const { user, accessToken } = res;
      dispatch(setCredentials({ user, token: accessToken }));
      
      const role = user.role;
      console.log('🏁 Navigating to role-based dashboard:', role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'landlord') navigate('/landlord');
      else navigate('/houses');
    } catch (err: any) {
      console.error('❌ Auth error in frontend:', err);
      setError(err?.data?.error || err?.data?.message || 'Login failed. Please check your credentials.');
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 px-6 font-body">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Visual Side */}
        <div className="relative hidden md:block">
           <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx4YhjQetpBGj3c9OW8qr4tL64ZPtmOItiI5ZkfbX7UJ87LuWz7bxN8EFL_ceF3UKnNZkb0NweR_cmHkGiQaT5v5Tg-w7YTR8YOuA-bj_8XxMHYH8X_uYecnUr0KFt089ztpm3CmGSeUYc5RcgSp83ZPmWjpqLCw_h0mdtE6t4TOHCHwZTXw2nqKOgjbUD12ZCYI0RADil1ZzV9YlpRTvLJ4AYOP1O1juxiQxuAUhy8JzNfftGm8VfR32UdHQMRjdMtz0LF7TiCZU" 
            alt="Luxury Home"
           />
           <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex flex-col justify-end p-12 text-left">
              <Badge className="bg-secondary text-white w-fit mb-4 border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">Verified Portal</Badge>
              <h2 className="text-4xl font-headline font-black text-white leading-tight tracking-tighter mb-4">Kenya's Most Secure Real Estate Intelligence.</h2>
              <p className="text-white/80 font-medium">Log in to manage your portfolio or continue your curated property search.</p>
           </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center text-left">
          <div className="mb-10">
            <h1 className="text-3xl font-black font-headline text-primary tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 font-medium">Enter your credentials to access your estate hub.</p>
          </div>

          {error && <Badge variant="destructive" className="mb-6 p-4 w-full rounded-xl">{error}</Badge>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@company.com" 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-container text-white py-8 rounded-full font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-12 text-center text-slate-400 font-medium text-sm">
            Don't have an account? <Link to="/register" className="text-primary font-black hover:underline underline-offset-4">Create One</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
