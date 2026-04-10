import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/apiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'seeker', phone: ''
  });
  const [error, setError] = useState('');
  
  const [register, { isLoading: loading }] = useRegisterMutation();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    try {
      const res = await register(form).unwrap();
      alert(`Account created! Your temporary password is: ${res.temporaryPassword}. Please log in.`);
      navigate('/login');
    } catch (err: any) {
      setError(err?.data?.error || err?.data?.message || 'Registration failed. Please try again.');
    }
  }

  return (
    <main className="bg-surface font-body text-on-surface min-h-screen flex flex-col antialiased">
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-sm h-20 flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-primary text-3xl">domain</span>
           <h1 className="text-xl font-bold tracking-tight text-primary font-headline">Estate Curator</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-label text-on-surface-variant hidden sm:block">Already have an account?</span>
          <Link to="/login" className="text-primary font-bold hover:bg-slate-50 transition-colors px-4 py-2 rounded-full">Log In</Link>
        </div>
      </header>

      <div className="flex-grow pt-32 pb-20 px-6 flex flex-col items-center">
        {/* Progress Indicator */}
        <div className="w-full max-w-3xl mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -z-10"></div>
            
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>1</div>
              <span className={`text-xs font-label font-medium ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Account Type</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>2</div>
              <span className={`text-xs font-label font-medium ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Personal Details</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface ${step >= 3 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>3</div>
              <span className={`text-xs font-label font-medium ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Verification</span>
            </div>
          </div>
        </div>

        {/* Conversational Form Container */}
        <div className="w-full max-w-4xl grid md:grid-cols-12 gap-12 items-start">
          {/* Left Side: Context */}
          <div className="md:col-span-5 pt-4 text-left">
            <h2 className="font-headline text-4xl font-extrabold text-primary leading-tight mb-6">Let's begin your curated property journey.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">Whether you are searching for your next architectural masterpiece or managing a premium portfolio, we provide the tools for excellence.</p>
            <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div>
                  <p className="font-medium text-on-surface font-bold">Trusted by 2,000+ Estates</p>
                  <p className="text-sm text-on-surface-variant">Verified listings and secure digital lease agreements are standard for every user.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:col-span-7 bg-white rounded-[2rem] p-8 shadow-2xl shadow-primary/5 border border-slate-100">
            {error && <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold">{error}</div>}

            {step === 1 && (
              <div className="space-y-8 text-left animate-in fade-in slide-in-from-right-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-2">How will you use the platform?</h3>
                  <p className="text-on-surface-variant font-label">Select your primary role to customize your experience.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setForm({...form, role: 'seeker'})}
                    className={`group flex flex-col p-6 rounded-xl border-2 transition-all text-left ${form.role === 'seeker' ? 'border-primary bg-primary/5' : 'border-surface-container-high hover:border-primary/50'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                    </div>
                    <span className="font-headline text-lg font-bold text-on-surface mb-1">Property Seeker</span>
                    <p className="text-xs text-on-surface-variant">I want to find, tour, and lease premium residences.</p>
                    {form.role === 'seeker' && <span className="mt-4 text-primary text-[10px] font-black uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Selected</span>}
                  </button>
                  <button 
                    onClick={() => setForm({...form, role: 'landlord'})}
                    className={`group flex flex-col p-6 rounded-xl border-2 transition-all text-left ${form.role === 'landlord' ? 'border-secondary bg-secondary/5' : 'border-surface-container-high hover:border-secondary/50'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>real_estate_agent</span>
                    </div>
                    <span className="font-headline text-lg font-bold text-on-surface mb-1">Estate Owner</span>
                    <p className="text-xs text-on-surface-variant">I want to list properties and manage premium leases.</p>
                    {form.role === 'landlord' && <span className="mt-4 text-secondary text-[10px] font-black uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Selected</span>}
                  </button>
                </div>
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full bg-primary hover:bg-primary-container text-white py-8 rounded-full font-bold text-lg shadow-xl shadow-primary/20 transition-all border-none"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 text-left animate-in fade-in slide-in-from-right-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Build your profile.</h3>
                  <p className="text-on-surface-variant font-label">These details will help landlords verify your application.</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Full Name</label>
                    <Input 
                      className="w-full bg-slate-50 border-none rounded-xl py-6 px-4 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20" 
                      placeholder="e.g. Jared Omondi" 
                      value={form.fullName}
                      onChange={(e) => setForm({...form, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                    <Input 
                      className="w-full bg-slate-50 border-none rounded-xl py-6 px-4 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20" 
                      placeholder="name@email.com" 
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Create Password</label>
                    <Input 
                      className="w-full bg-slate-50 border-none rounded-xl py-6 px-4 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20" 
                      placeholder="••••••••" 
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="bg-slate-100 rounded-xl px-4 flex items-center font-bold text-primary">+254</div>
                      <Input 
                        className="flex-grow bg-slate-50 border-none rounded-xl py-6 px-4 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20" 
                        placeholder="712 345 678" 
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="px-8 py-4 bg-slate-100 text-primary font-bold rounded-full hover:bg-slate-200 transition-colors">Back</button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-grow bg-primary hover:bg-primary-container text-white py-8 rounded-full font-bold text-lg shadow-xl shadow-primary/20 transition-all border-none"
                  >
                    {loading ? 'Registering...' : 'Complete Registry'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <div className="font-headline font-black text-primary text-lg">Estate Curator</div>
          <p className="text-sm font-inter text-slate-400">© 2024 Estate Curator. Editorial Real Estate Excellence.</p>
        </div>
      </footer>
    </main>
  );
}
