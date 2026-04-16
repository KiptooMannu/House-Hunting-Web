import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterMutation } from '../../store/apiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'landlord' ? 'landlord' : 'seeker';
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', 
    email: '', 
    password: '', 
    role: initialRole, 
    phone: '',
    kraPin: '',
    agencyName: ''
  });
  const [error, setError] = useState('');
  
  const [register, { isLoading: loading }] = useRegisterMutation();
  const navigate = useNavigate();

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    
    // Basic validation for the last step
    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setError('Please ensure all identity nodes are fully defined.');
      return;
    }

    try {
      // We only send the fields supported by the backend schema for now
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone
      };
      
      const res = await register(payload).unwrap();
      alert(`NestFind Kenya account created! Your temporary security code is: ${res.temporaryPassword}. Please authorize your first entry.`);
      navigate('/login');
    } catch (err: any) {
      setError(err?.data?.error || err?.data?.message || 'Registry initialization failed. Please verify your connection.');
    }
  }

  const nextStep = () => {
    if (step === 1 && !form.role) return;
    if (step === 2 && (!form.fullName || !form.email || !form.phone)) {
        setError("Please define all personal nodes before proceeding.");
        return;
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <main className="min-h-screen relative flex items-center justify-center pt-20 pb-12 px-4 overflow-hidden bg-surface font-body text-on-surface antialiased">
      {/* Blurred Architectural Background */}
      <div className="absolute inset-0 z-0 text-left">
        <img 
            alt="Luxury modern villa architecture" 
            className="w-full h-full object-cover scale-110 blur-xl brightness-90 opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx4YhjQetpBGj3c9OW8qr4tL64ZPtmOItiI5ZkfbX7UJ87LuWz7bxN8EFL_ceF3UKnNZkb0NweR_cmHkGiQaT5v5Tg-w7YTR8YOuA-bj_8XxMHYH8X_uYecnUr0KFt089ztpm3CmGSeUYc5RcgSp83ZPmWjpqLCw_h0mdtE6t4TOHCHwZTXw2nqKOgjbUD12ZCYI0RADil1ZzV9YlpRTvLJ4AYOP1O1juxiQxuAUhy8JzNfftGm8VfR32UdHQMRjdMtz0LF7TiCZU" 
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
      </div>

      {/* Registration Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_32px_96px_-16px_rgba(0,52,97,0.2)] flex flex-col md:flex-row border border-white/40">
        
        {/* Left Panel: Brand & Trust */}
        <div className="hidden md:flex md:w-5/12 bg-primary p-12 flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-container opacity-90 -z-10"></div>
          <div>
            <h1 className="font-headline font-black text-5xl leading-tight tracking-tighter mb-8 italic">Elevate Your Lifestyle.</h1>
            <p className="text-white/70 text-lg leading-relaxed font-body italic">Join an exclusive community of curators and visionaries. Secure, transparent, and refined real estate management starting today.</p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">shield_lock</span>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest text-secondary-fixed mb-1">Bank-Grade Security</p>
                <p className="text-xs opacity-70 font-medium">Your data is encrypted and protected by NestFind's highest tier protocols.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">verified</span>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest text-secondary-fixed mb-1">Verified Network</p>
                <p className="text-xs opacity-70 font-medium">A curated ecosystem of vetted landlords and institutional seekers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: The Form */}
        <div className="w-full md:w-7/12 bg-white/40 p-8 md:p-16 flex flex-col justify-center text-left">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-16 max-w-md mx-auto w-full px-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 shadow-xl ${
                    step >= s ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-300'
                }`}>
                    {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                </div>
                <span className={`text-[9px] font-black tracking-[0.2em] uppercase transition-colors duration-500 ${step >= s ? 'text-primary' : 'text-slate-300'}`}>
                    {s === 1 ? 'Identity' : s === 2 ? 'Details' : 'Secure'}
                </span>
                {s < 3 && <div className={`absolute top-5 left-[60%] w-[80%] h-[2px] -z-10 transition-colors duration-500 ${step > s ? 'bg-primary' : 'bg-slate-100'}`}></div>}
              </div>
            ))}
          </div>

          <div className="mb-10 text-left">
            <span className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Registry Protocol</span>
            <h2 className="font-headline font-black text-4xl text-primary mb-2 italic tracking-tighter">Create Your Account.</h2>
            <p className="text-on-surface-variant text-sm font-medium italic">Define your journey in the NestFind Kenya ecosystem.</p>
          </div>

          {error && <Badge variant="destructive" className="mb-8 p-4 w-full rounded-xl shadow-lg border-none font-bold animate-in fade-in slide-in-from-top-2">{error}</Badge>}

          <form className="space-y-8 text-left">
            
            {/* Step 1: Identity Selection */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    type="button"
                    onClick={() => setForm({...form, role: 'seeker'})}
                    className={`relative p-8 rounded-[2rem] border-2 text-left transition-all group ${
                        form.role === 'seeker' ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-slate-50 hover:border-primary/20 bg-slate-50/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary mb-4 block text-4xl transition-transform group-hover:scale-110">search_check</span>
                    <p className="font-headline font-black text-primary text-xl mb-1 italic tracking-tighter">I am a Seeker</p>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed font-bold uppercase tracking-widest">Finding architectural masterpieces.</p>
                    {form.role === 'seeker' && <div className="absolute top-4 right-4 text-primary"><span className="material-symbols-outlined text-xl">check_circle</span></div>}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setForm({...form, role: 'landlord'})}
                    className={`relative p-8 rounded-[2rem] border-2 text-left transition-all group ${
                        form.role === 'landlord' ? 'border-secondary bg-secondary/5 shadow-2xl shadow-secondary/10' : 'border-slate-50 hover:border-secondary/20 bg-slate-50/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-secondary mb-4 block text-4xl transition-transform group-hover:scale-110">real_estate_agent</span>
                    <p className="font-headline font-black text-secondary text-xl mb-1 italic tracking-tighter">I am a Landlord</p>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed font-bold uppercase tracking-widest">Managing premium property nodes.</p>
                    {form.role === 'landlord' && <div className="absolute top-4 right-4 text-secondary"><span className="material-symbols-outlined text-xl">check_circle</span></div>}
                  </button>
                </div>
                <Button onClick={nextStep} className="w-full bg-primary hover:bg-primary-container text-white py-8 rounded-full font-black text-lg shadow-2xl border-none transition-all hover:scale-[1.02] active:scale-95">Continue Discovery</Button>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Full Name</label>
                    <Input 
                        className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner" 
                        placeholder="e.g. Jared Omondi" 
                        value={form.fullName}
                        onChange={(e) => setForm({...form, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Email Node</label>
                    <Input 
                        className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner" 
                        placeholder="john@example.com" 
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Secure Contact (Phone)</label>
                  <div className="flex gap-4">
                    <div className="bg-slate-100 rounded-2xl px-6 flex items-center font-black text-primary text-xs">+254</div>
                    <Input 
                        className="flex-grow bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner" 
                        placeholder="712 345 678" 
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={prevStep} className="px-10 py-5 bg-slate-100 text-primary font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all">Back</button>
                  <Button onClick={nextStep} className="flex-grow bg-primary hover:bg-primary-container text-white py-8 rounded-full font-black text-lg shadow-2xl border-none transition-all hover:scale-[1.02] active:scale-95">Secure Credentials</Button>
                </div>
              </div>
            )}

            {/* Step 3: Security & Verification */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Master Access Key (Password)</label>
                  <Input 
                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner" 
                    placeholder="••••••••" 
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                  />
                </div>

                {form.role === 'landlord' && (
                  <div className="p-8 bg-secondary/5 rounded-[2.5rem] space-y-6 border border-secondary/10 animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Verified Curator Section</span>
                      </div>
                      <Badge className="bg-secondary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border-none">Required</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">KRA PIN Node</label>
                        <Input 
                            className="w-full bg-white border-none rounded-xl py-5 px-4 text-xs font-bold text-secondary focus-visible:ring-2 focus-visible:ring-secondary/20 shadow-sm" 
                            placeholder="A000XXX" 
                            value={form.kraPin}
                            onChange={(e) => setForm({...form, kraPin: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Agency Brand</label>
                        <Input 
                            className="w-full bg-white border-none rounded-xl py-5 px-4 text-xs font-bold text-secondary focus-visible:ring-2 focus-visible:ring-secondary/20 shadow-sm" 
                            placeholder="Horizon Realty Opt." 
                            value={form.agencyName}
                            onChange={(e) => setForm({...form, agencyName: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={prevStep} className="px-10 py-5 bg-slate-100 text-primary font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all">Back</button>
                  <Button 
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="flex-grow bg-primary hover:bg-primary-container text-white py-8 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl border-none transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? 'Initializing Protocol...' : 'Begin Your Legacy'}
                  </Button>
                </div>
                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  By authorizing, you align with our <Link to="/terms" className="text-primary underline font-black">Terms of Excellence</Link> and <Link to="/privacy" className="text-primary underline font-black">Privacy Charter</Link>.
                </p>
              </div>
            )}
          </form>

          <footer className="mt-12 text-center pt-8 border-t border-slate-50">
            <p className="text-on-surface-variant text-xs font-medium">
              Existing curator? 
              <Link to="/login" className="text-primary font-black hover:underline underline-offset-4 ml-2">Authorize Entry</Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
