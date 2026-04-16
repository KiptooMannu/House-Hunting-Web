import { useMemo } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import type { RootState } from '../../store';
import { useGetProfileQuery } from '../../store/apiSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: profileData, isLoading } = useGetProfileQuery(undefined);
  const profile = profileData?.user ?? user;

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard', path: '/user/overview' },
    { id: 'canvas', label: 'Discovery Canvas', icon: 'auto_awesome', path: '/user/canvas', badge: 'AI' },
    { id: 'saved', label: 'Saved Estates', icon: 'favorite', path: '/user/saved' },
    { id: 'bookings', label: 'Booking Timeline', icon: 'event_available', path: '/user/bookings' },
    { id: 'insights', label: 'Market Insights', icon: 'trending_up', path: '/user/insights' },
    { id: 'profile', label: 'Account Settings', icon: 'settings', path: '/user/profile' },
  ];

  const activeId = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts[1] || 'overview';
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#FBFCFD] text-on-surface antialiased">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-100 z-50 flex flex-col shadow-sm">
          <div className="p-10">
            <div className="text-2xl font-black tracking-tighter text-primary font-headline flex items-center gap-2">
              <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-base">H</span>
              Curator
            </div>
          </div>
          
          <nav className="flex-1 px-6 space-y-1">
            <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Management</p>
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
                  activeId === item.id 
                  ? 'text-primary bg-primary/5 shadow-sm' 
                  : 'text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${activeId === item.id ? 'text-primary' : 'text-slate-400'}`}>
                   {item.icon}
                </span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-50">
            <div className="flex items-center gap-3 bg-slate-50/80 p-4 rounded-[2rem] border border-slate-100 group transition-all">
              <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm shrink-0">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="bg-primary text-white font-bold">{profile?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-xs font-black text-primary truncate leading-none mb-0.5">{profile?.fullName}</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Elite Member</p>
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

        {/* Main Content Area */}
        <div className="flex-1 ml-72 flex flex-col">
          {/* Top Nav Shell */}
          <nav className="sticky top-0 w-full z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-50/50">
            <div className="flex justify-between items-center px-12 h-24">
              <div className="flex items-center gap-8">
                <div className="relative w-80 group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-transform group-focus-within:scale-110">search</span>
                  <input 
                    className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400" 
                    placeholder="Search estates or agents..." 
                    type="text" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex gap-2">
                   <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary hover:shadow-md transition-all">
                      <span className="material-symbols-outlined text-xl">notifications</span>
                      <span className="absolute top-3 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
                   </button>
                   <button className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary hover:shadow-md transition-all">
                      <span className="material-symbols-outlined text-xl">tune</span>
                   </button>
                </div>
                <button 
                  onClick={() => navigate('/chatbot')} 
                  className="bg-primary text-white px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 duration-200 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  Concierge
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-1 py-12 px-12 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
