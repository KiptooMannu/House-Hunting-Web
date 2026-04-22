import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterMutation } from '../../store/apiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

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

    if (!form.fullName || !form.email || !form.password || !form.phone) {
      const errMsg = 'Please fill in all required fields.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    try {
      const payload: any = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone.startsWith('+254') ? form.phone : `+254${form.phone.replace(/^0/, '')}`,
        kraPin: form.role === 'landlord' ? form.kraPin : undefined,
        agencyName: form.role === 'landlord' ? form.agencyName : undefined,
      };

      await register(payload).unwrap();
      toast.success('Account created! Please sign in.', { duration: 5000 });
      navigate('/login');
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  }

  const nextStep = () => {
    if (step === 1 && !form.role) return;
    if (step === 2 && (!form.fullName || !form.email || !form.phone)) {
      const errMsg = 'Please fill in all fields before continuing.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center px-4 pt-24 pb-8 font-body overflow-hidden">
      {/* Same background as Login */}
      <div className="fixed inset-0 z-0">
        <img
          alt="Luxury Architecture"
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      {/* Centered Glass Card */}
      <div className="relative z-10 w-full max-w-[460px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black text-on-surface tracking-tight mb-1">Create Account</h1>
            <p className="text-on-surface-variant text-sm mt-2">Join NestFind Kenya — it only takes a minute.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step >= s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${step >= s ? 'text-primary' : 'text-slate-300'}`}>
                  {s === 1 ? 'Role' : s === 2 ? 'Details' : 'Password'}
                </span>
                {s < 3 && <div className={`absolute mt-4 h-[2px] w-12 transition-colors ${step > s ? 'bg-primary' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-sm">error</span>
              <p className="text-red-600 text-xs font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Step 1: Choose Role */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-400">
                <p className="text-sm font-semibold text-on-surface-variant mb-2">I am a...</p>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'seeker' })}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                    form.role === 'seeker' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-2xl">search_check</span>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Seeker</p>
                      <p className="text-xs text-on-surface-variant">I'm looking for a home to rent</p>
                    </div>
                    {form.role === 'seeker' && <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'landlord' })}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                    form.role === 'landlord' ? 'border-secondary bg-secondary/5' : 'border-slate-100 bg-slate-50 hover:border-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary text-2xl">real_estate_agent</span>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Landlord</p>
                      <p className="text-xs text-on-surface-variant">I have a property to list</p>
                    </div>
                    {form.role === 'landlord' && <span className="material-symbols-outlined text-secondary ml-auto">check_circle</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm mt-2"
                >
                  Continue
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-400">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Full Name</label>
                  <Input
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 font-medium text-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm"
                    placeholder="e.g. Jane Mwangi"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Email</label>
                  <Input
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 font-medium text-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm"
                    placeholder="you@example.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="bg-slate-100 rounded-2xl px-4 flex items-center font-bold text-primary text-sm shrink-0">+254</div>
                    <Input
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 font-medium text-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm"
                      placeholder="712 345 678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep} className="px-6 py-3.5 bg-slate-100 text-on-surface font-bold text-sm rounded-2xl hover:bg-slate-200 transition-all border-none">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex-grow bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm border-none">
                    Continue
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password + optional landlord fields */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-400">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Password</label>
                  <Input
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 font-medium text-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm"
                    placeholder="Create a strong password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                {form.role === 'landlord' && (
                  <div className="space-y-4 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">Landlord Details (optional)</p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant">KRA PIN</label>
                      <Input
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-secondary/20"
                        placeholder="A000XXXXX"
                        value={form.kraPin}
                        onChange={(e) => setForm({ ...form, kraPin: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant">Agency Name</label>
                      <Input
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-secondary/20"
                        placeholder="Your agency name (optional)"
                        value={form.agencyName}
                        onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep} className="px-6 py-3.5 bg-slate-100 text-on-surface font-bold text-sm rounded-2xl hover:bg-slate-200 transition-all border-none">
                    Back
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-grow bg-primary hover:bg-primary-container text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 border-none transition-all"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
