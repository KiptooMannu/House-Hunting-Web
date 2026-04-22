import { useMemo, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import { useGetProfileQuery } from '../../store/apiSlice';
import type { RootState } from '../../store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationBell from '../../components/NotificationBell';
import PageExit from '../../components/PageExit';
import toast from 'react-hot-toast';

export default function LandlordDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    toast.success('Protocol closed. Securely logged out.');
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    { id: 'bookings', label: 'Active Bookings', icon: 'calendar_today' },
    { id: 'properties', label: 'My Listings', icon: 'domain' },
    { id: 'revenue', label: 'Financials', icon: 'account_balance_wallet' },
    { id: 'compliance', label: 'Compliance Hub', icon: 'verified_user' },
  ];

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#FBFCFD] text-on-surface min-h-screen flex text-left font-body antialiased overflow-x-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[45] md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SideNavBar */}
      <aside className={`h-screen w-72 fixed left-0 top-0 bg-white flex flex-col py-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-100 shadow-sm`}>
        <div className="p-10 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-primary font-headline flex items-center gap-2">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-base">H</span>
            Console
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-6 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Authority Panel</p>
          <div className="space-y-1">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  navigate(`/landlord/${item.id}`);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-4 transition-all group rounded-2xl relative border-none cursor-pointer ${
                  activeTab === item.id 
                    ? 'text-primary bg-primary/5 font-black shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] shrink-0 mr-4 ${activeTab === item.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} transition-colors`}>{item.icon}</span>
                <span className="font-headline text-sm tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6">
          <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-[1.75rem] border border-slate-100">
            <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm shrink-0">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback className="bg-primary text-white font-bold">{profile?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-[11px] font-black text-primary truncate leading-none mb-0.5">{profile?.fullName}</p>
              <p className={`text-[9px] font-bold uppercase tracking-tighter ${profile?.accountStatus === 'active' ? 'text-slate-400' : 'text-amber-500'} truncate`}>
                {profile?.accountStatus === 'active' ? 'Verified' : 'Pending'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="material-symbols-outlined text-slate-400 text-base hover:text-error transition-colors p-1.5 rounded-full hover:bg-white border-none cursor-pointer bg-transparent"
            >
              logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-72 min-h-screen flex flex-col w-full min-w-0">
        {/* TopAppBar */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-3xl border-b border-slate-100/50 shadow-sm">
          <div className="flex justify-between items-center px-4 md:px-10 h-20 md:h-28 max-w-full gap-4">
            <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary transition-colors border-none flex items-center shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <PageExit />
              <h2 className="text-xl md:text-3xl font-black tracking-tighter text-primary font-headline capitalize italic truncate">
                {activeTab.replace(/-/g, ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-3 md:gap-8 shrink-0">
              <div className="flex gap-1 md:gap-2">
                 <NotificationBell />
                 <button className="p-3 md:p-4 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary hover:shadow-md transition-all border-none outline-none cursor-pointer hidden sm:flex">
                    <span className="material-symbols-outlined text-sm md:text-xl">account_balance_wallet</span>
                 </button>
              </div>
              <button 
                type="button"
                onClick={() => navigate('/landlord/create-listing')}
                disabled={profile?.accountStatus !== 'active'}
                className={`bg-primary text-white px-4 md:px-10 h-12 md:h-16 rounded-2xl md:rounded-[1.25rem] font-black text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-100 transition-all flex items-center justify-center gap-2 md:gap-3 shrink-0 border-none cursor-pointer ${profile?.accountStatus !== 'active' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span className="hidden xs:inline">New Node</span>
              </button>
            </div>
          </div>
        </header>

        {/* Verification Banner: Only show if KRA PIN is missing or account is inactive */}
        {(!profile?.kraPin || profile?.accountStatus !== 'active') && (
          <div className="mx-4 md:mx-12 mt-4 md:mt-8 p-6 md:p-10 bg-secondary/5 border border-secondary/20 rounded-[2rem] md:rounded-[3rem] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-secondary rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shrink-0">
                <span className="material-symbols-outlined text-4xl">verified_user</span>
              </div>
              <div className="text-left">
                <h4 className="font-headline font-black text-secondary text-2xl italic tracking-tighter leading-none mb-3">Fintech Verification Required.</h4>
                <p className="text-xs font-bold text-on-surface-variant italic opacity-70">Your KRA PIN or TCC has not yet been authorized by the NestFind Compliance Node.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => navigate('/landlord/compliance')}
              className="px-10 py-5 bg-secondary text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-[1.01] active:scale-100 transition-all shadow-xl shadow-secondary/20 border-none shrink-0"
            >
              Verify Identity
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="py-6 md:py-12 px-4 md:px-12 flex-1 max-w-[1400px] mx-auto w-full">
            <Outlet />
        </div>

        {/* Footer: Hardened Layout */}
        <footer className="w-full py-8 md:py-16 px-4 md:px-12 border-t border-slate-100 bg-[#FBFCFD] mt-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-16">
              <div className="space-y-6">
                <span className="font-headline font-black text-primary text-2xl tracking-tighter block">NestFind Kenya</span>
                <p className="text-slate-400 text-sm leading-relaxed font-medium italic">Curated real estate and financial compliance for the Nairobi highlands.</p>
              </div>
              <div className="space-y-4">
                <span className="font-headline font-black text-primary text-[10px] uppercase tracking-[0.2em]">Asset Class</span>
                <ul className="space-y-3 text-sm font-bold text-slate-400">
                  <li className="hover:text-primary cursor-pointer transition-colors">Portfolio Hub</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Private Listings</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Intelligence Desk</li>
                </ul>
              </div>
              <div className="space-y-4">
                <span className="font-headline font-black text-primary text-[10px] uppercase tracking-[0.2em]">Legal Nodes</span>
                <ul className="space-y-3 text-sm font-bold text-slate-400">
                  <li className="hover:text-primary cursor-pointer transition-colors">Tax Protocols</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">GavaConnect Rules</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Privacy Shield</li>
                </ul>
              </div>
              <div className="space-y-6">
                <span className="font-headline font-black text-primary text-[10px] uppercase tracking-[0.2em]">The Intelligence Brief</span>
                <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-100 shadow-inner">
                  <input className="flex-1 bg-transparent px-4 py-2 text-xs border-none outline-none" placeholder="Email Registry" />
                  <button className="bg-primary text-white p-2 rounded-lg material-symbols-outlined text-sm shadow-lg shadow-primary/20 border-none shrink-0">arrow_forward</button>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest italic flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                © 2024 NestFind Kenya Real Estate. Licensed by GavaConnect.
              </span>
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-slate-300 hover:text-primary cursor-pointer transition-colors text-xl">verified_user</span>
                <span className="material-symbols-outlined text-slate-300 hover:text-primary cursor-pointer transition-colors text-xl">share</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating AI Assistant */}
        <div className="fixed bottom-10 right-10 z-50">
          <button 
            type="button"
            onClick={() => navigate('/landlord/concierge')}
            className="h-16 w-16 bg-primary text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-[1.05] active:scale-100 transition-all group relative border border-white/20"
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
