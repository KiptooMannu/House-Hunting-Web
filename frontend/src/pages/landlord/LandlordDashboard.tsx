import { useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import { useGetProfileQuery } from '../../store/apiSlice';
import type { RootState } from '../../store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LandlordDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts[1] || 'overview';
  }, [pathname]);

  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery({});
  const profile = profileData?.user ?? user;

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    { id: 'bookings', label: 'Active Bookings', icon: 'calendar_today' },
    { id: 'properties', label: 'My Listings', icon: 'domain' },
    { id: 'revenue', label: 'Financials', icon: 'account_balance_wallet' },
    { id: 'compliance', label: 'Compliance', icon: 'verified_user' },
    { id: 'intelligence', label: 'Intelligence Hub', icon: 'insights' },
  ];

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#FBFCFD] text-on-surface min-h-screen flex text-left font-body antialiased">
      {/* SideNavBar */}
      <aside className="h-screen w-72 fixed left-0 top-0 bg-white flex flex-col py-0 z-40 hidden md:flex border-r border-slate-100 shadow-sm">
        <div className="p-10">
          <div className="text-2xl font-black tracking-tighter text-primary font-headline flex items-center gap-2">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-base">H</span>
            Console
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 px-6">
          <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Authority Panel</p>
          <div className="space-y-1">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => navigate(`/landlord/${item.id}`)}
                className={`w-full flex items-center gap-4 px-4 py-4 transition-all group rounded-2xl relative ${
                  activeTab === item.id 
                    ? 'text-primary bg-primary/5 font-black shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${activeTab === item.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} transition-colors`}>{item.icon}</span>
                <span className="font-headline text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-primary p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="relative z-10 text-white">
              <h4 className="font-black font-headline text-xs uppercase tracking-widest mb-3 opacity-60">Intelligence Pack</h4>
              <p className="text-xs font-medium leading-relaxed mb-6 opacity-90">Unlock regional hot-zones and seasonal yield patterns.</p>
              <button className="w-full bg-white text-primary text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-blue-50 transition-all">
                Activate Premium
              </button>
            </div>
            {/* Abstract Decors */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="mt-8 flex items-center gap-3 bg-slate-50/80 p-4 rounded-[2rem] border border-slate-100">
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm shrink-0">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback className="bg-primary text-white font-bold">{profile?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-black text-primary truncate leading-none mb-0.5">{profile?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Provider</p>
            </div>
            <button 
              onClick={handleLogout}
              className="material-symbols-outlined text-slate-400 text-lg hover:text-error transition-colors p-2 rounded-full hover:bg-white"
            >
              logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-slate-50/50">
          <div className="flex justify-between items-center px-12 h-24 max-w-full">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black tracking-tighter text-primary font-headline capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-2">
                 <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary hover:shadow-md transition-all">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                    <span className="absolute top-3 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
                 </button>
                 <button className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary hover:shadow-md transition-all">
                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                 </button>
              </div>
              <button 
                onClick={() => navigate('/landlord/create-listing')}
                disabled={profile?.accountStatus !== 'active'}
                className={`bg-primary text-white px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 ${profile?.accountStatus !== 'active' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                New Node
              </button>
            </div>
          </div>
        </header>

        {/* Verification Banner */}
        {profile?.accountStatus !== 'active' && (
          <div className="mx-12 mt-8 p-6 bg-secondary/10 border-2 border-secondary border-dashed rounded-[2.5rem] flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-secondary text-lg italic tracking-tighter">Fintech Verification Required.</h4>
                <p className="text-xs font-medium text-on-surface-variant italic">Your KRA PIN or TCC has not yet been authorized by the NestFind Compliance Node.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/landlord/compliance')}
              className="px-8 py-3 bg-secondary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Verify Identity
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="py-12 px-12 flex-1 max-w-[1400px] mx-auto w-full">
            <Outlet />
        </div>

        {/* Footer */}
        <footer className="w-full py-20 px-12 border-t border-slate-50 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full max-w-7xl mx-auto text-left">
            <div className="col-span-1 md:col-span-1">
              <span className="font-headline font-black text-primary text-2xl tracking-tighter block mb-6">NestFind Kenya</span>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[200px] font-medium">High-end real estate curation and financial management across the Kenyan highlands.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-headline font-black text-primary text-xs uppercase tracking-[0.2em]">Platform</span>
              <button className="text-slate-400 text-sm font-medium hover:text-primary text-left transition-colors">Privacy Policy</button>
              <button className="text-slate-400 text-sm font-medium hover:text-primary text-left transition-colors">Investment Terms</button>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-headline font-black text-primary text-xs uppercase tracking-[0.2em]">Compliance</span>
              <button className="text-slate-400 text-sm font-medium hover:text-primary text-left transition-colors">Tax Disclosure</button>
              <button className="text-slate-400 text-sm font-medium hover:text-primary text-left transition-colors">GavaConnect Rules</button>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-headline font-black text-primary text-xs uppercase tracking-[0.2em]">Support</span>
              <p className="text-slate-400 text-sm font-medium hover:text-primary transition-colors cursor-pointer">Intelligence Desk</p>
              <p className="text-slate-400 text-sm font-medium hover:text-primary transition-colors cursor-pointer">Agent Relations</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">© 2024 NestFind Kenya Real Estate. Licensed by GavaConnect.</p>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-slate-300 hover:text-primary cursor-pointer transition-colors">public</span>
              <span className="material-symbols-outlined text-slate-300 hover:text-primary cursor-pointer transition-colors">share</span>
            </div>
          </div>
        </footer>

        {/* Floating AI Assistant */}
        <div className="fixed bottom-10 right-10 z-50">
          <button 
            onClick={() => navigate('/landlord/concierge')}
            className="h-16 w-16 bg-primary text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative border border-white/20"
          >
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-secondary text-[8px] font-black items-center justify-center text-white">AI</span>
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
