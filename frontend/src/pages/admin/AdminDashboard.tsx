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

export default function AdminDashboard() {
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
    toast.success('Admin session terminated.');
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'approvals', label: 'Verification Queue', icon: 'verified' },
    { id: 'properties', label: 'Real Estate Hub', icon: 'domain' },
    { id: 'landlords', label: 'User Management', icon: 'group' },
    { id: 'compliance', label: 'KRA Compliance', icon: 'verified_user' },
    { id: 'audit', label: 'Security Vault', icon: 'assignment_late' },
  ];

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#f8fafb] text-on-surface min-h-screen flex text-left font-body antialiased overflow-x-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-[45] md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SideNavBar Component */}
      <aside className={`h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 flex flex-col py-6 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-900 leading-tight">Estate Curator</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Admin Console</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-slate-400 hover:text-blue-900 border-none bg-transparent cursor-pointer">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-grow space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/admin/${item.id}`);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 ease-in-out border-none outline-none cursor-pointer ${
                activeTab === item.id
                  ? 'text-blue-900 font-bold bg-white shadow-sm rounded-l-none'
                  : 'text-slate-500 hover:text-blue-900 bg-transparent'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === item.id ? 'text-primary' : ''}`}>{item.icon}</span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mb-6">
          <button type="button" className="w-full py-3.5 px-4 bg-primary text-white rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-primary/20 border-none cursor-pointer">
            Internal Audit
          </button>
        </div>

        <div className="mt-auto border-t border-slate-200/50 pt-4 px-2 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-blue-900 transition-colors border-none outline-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="text-xs font-semibold">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-error transition-colors border-none outline-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="text-xs font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col w-full min-w-0">
        {/* TopNavBar Component */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center h-16 md:h-20 px-4 md:px-8 font-headline tracking-tight gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 bg-slate-100 rounded-xl text-slate-600 hover:text-primary transition-colors border-none flex items-center cursor-pointer"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <PageExit />
              <h2 className="text-sm md:text-lg font-bold text-blue-900 capitalize truncate leading-tight">
                {activeTab.replace('-', ' ')}
              </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-8 shrink-0">
            <div className="relative hidden xl:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="bg-slate-100 border-none rounded-full py-1.5 pl-10 pr-4 text-sm w-48 focus:w-64 transition-all focus:ring-2 focus:ring-primary/10 outline-none" 
                placeholder="Search..." 
                type="text"
              />
            </div>
            <div className="flex items-center gap-3 md:gap-4 text-slate-500">
               <NotificationBell />
               <button className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors border-none bg-transparent outline-none p-1.5 hidden lg:flex">dark_mode</button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 border-l pl-3 md:pl-6 border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-blue-900 leading-none">{profile?.fullName}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-0.5">{profile?.role}</p>
              </div>
              <Avatar className="w-8 h-8 ring-2 ring-primary/10">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="bg-primary text-white font-bold text-[10px]">{profile?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Assistance */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="w-16 h-16 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0px_20px_40px_rgba(25,28,29,0.12)] rounded-full flex items-center justify-center group outline-none">
          <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">auto_awesome</span>
        </button>
      </div>
    </div>
  );
}
