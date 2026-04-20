import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../store/apiSlice';
import { logout, setCredentials } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profileData } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = profileData?.user || user;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: ''
  });


  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(form).unwrap();
      dispatch(setCredentials({ user: updatedUser.user, token: localStorage.getItem('token') || '' }));
      toast.success('Identity protocol updated successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update discovery identity.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-left">
      <header>
        <h2 className="text-4xl font-black font-headline tracking-tighter text-primary">Account Intelligence</h2>
        <p className="text-on-surface-variant mt-2 font-medium">Manage your identity, security protocols, and discovery preferences.</p>
      </header>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        <aside className="lg:col-span-4 space-y-6 text-left">
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="relative group mb-6">
                 <div className="absolute -inset-4 bg-primary opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                 <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                    <img className="w-full h-full object-cover" src={form.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" />
                 </div>
                 <label className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <input type="text" className="hidden" onChange={(e) => setForm({...form, avatar: e.target.value})} placeholder="Avatar URL" />
                 </label>
              </div>
              <h3 className="text-2xl font-black font-headline text-primary">{form.fullName}</h3>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">{user?.role === 'landlord' ? 'Asset Curator' : 'Founding Member'}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 w-full space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant font-medium">Profile Status</span>
                    <span className="text-secondary font-black uppercase tracking-tighter flex items-center gap-1">
                       <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                       Verified
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant font-medium">Account Type</span>
                    <span className="text-primary font-black uppercase tracking-tighter">{user?.role === 'landlord' ? 'Institutional' : 'Elite Seeker'}</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
           >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out Securely
           </button>
        </aside>

        <form onSubmit={handleUpdate} className="lg:col-span-8 space-y-8 text-left">
           <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <h4 className="text-xl font-black font-headline text-primary">Identity Protocols</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Full Legal Name</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                      value={form.fullName}
                      onChange={(e) => setForm({...form, fullName: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Email Address</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Phone Number</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      placeholder="+254 7XX XXX XXX" 
                    />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Preferred Language</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none">
                       <option>English (UK)</option>
                       <option>Swahili</option>
                    </select>
                 </div>
              </div>
              <button 
                type="submit"
                disabled={updating}
                className="bg-primary text-white font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {updating ? 'Synchronizing...' : 'Update Identity'}
              </button>
           </section>

           <section className="bg-surface-container-low p-10 rounded-[2.5rem] border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-secondary">security</span>
                 <h4 className="text-xl font-black font-headline text-primary">Security Guard</h4>
              </div>
              <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100">
                 <div>
                    <p className="font-black text-primary">Two-Factor Authentication</p>
                    <p className="text-xs text-on-surface-variant font-medium">Adds an extra layer of security to your curated assets.</p>
                 </div>
                 <div className="w-12 h-6 bg-secondary/20 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-secondary rounded-full"></div>
                 </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100">
                 <div>
                    <p className="font-black text-primary">Biometric Login</p>
                    <p className="text-xs text-on-surface-variant font-medium">Use FaceID or Fingerprint for rapid access.</p>
                 </div>
                 <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                 </div>
              </div>
           </section>
        </form>
      </div>
    </div>
  );
}
