import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Navbar() {
  const { user, isAuth } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  interface NavLink {
    name: string;
    path: string;
    role?: string | string[];
  }

  const navLinks: NavLink[] = [
    { name: 'Listings', path: '/houses' },
    { name: 'Insights', path: '/insights' }, 
    { name: 'Gallery', path: '/houses?filter=gallery' },
    { name: 'Concierge', path: '/chatbot' },
  ];

  const isAdminOrLandlord = user?.role === 'landlord' || user?.role === 'admin';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500">
      <nav className="flex justify-between items-center px-8 lg:px-12 py-5 max-w-full mx-auto w-full">
        <div className="flex items-center gap-16">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary dark:text-blue-400 font-headline uppercase italic">
            Savanna<span className="font-light opacity-50 not-italic">Horizon</span>
          </Link>
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant/70'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {!isAuth ? (
            <div className="flex items-center gap-8">
              <button 
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all bg-transparent border-none outline-none"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-primary hover:bg-primary-container text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all transform active:scale-95 shadow-lg shadow-primary/20 border-none"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
               <button 
                onClick={() => navigate(isAdminOrLandlord ? '/landlord/overview' : '/user/overview')}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all border-none"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Dashboard
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-all outline-none border-none bg-transparent group">
                    <Avatar className="h-11 w-11 border-4 border-white shadow-xl ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={(user as any)?.avatar} className="object-cover" />
                      <AvatarFallback className="bg-primary text-white font-black italic">{(user as any)?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 mt-6 p-6 rounded-[2.5rem] border-none shadow-3xl ring-1 ring-slate-100 font-headline animate-in slide-in-from-top-4 duration-300" align="end">
                  <DropdownMenuLabel className="font-normal p-2 pb-6 text-left">
                    <p className="text-xl font-black text-primary tracking-tighter italic">{(user as any)?.fullName}</p>
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">{(user as any)?.email}</p>
                    <p className="inline-block mt-4 px-3 py-1 bg-secondary-container/30 text-secondary text-[9px] font-black uppercase tracking-widest rounded-full leading-none">{(user as any)?.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <div className="py-2 space-y-1">
                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-slate-50 p-4 cursor-pointer">
                      <Link 
                        to={isAdminOrLandlord ? '/landlord/overview' : '/user/overview'} 
                        className="flex items-center justify-between font-black text-primary group"
                      >
                        <span className="text-[10px] uppercase tracking-[0.2em]">Dashboard Pulse</span>
                        <span className="material-symbols-outlined text-[18px] opacity-40 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-slate-50 p-4 cursor-pointer">
                      <Link to={isAdminOrLandlord ? '/landlord/profile' : '/user/profile'} 
                        className="flex items-center justify-between font-black text-primary group"
                      >
                        <span className="text-[10px] uppercase tracking-[0.2em]">Identity Node</span>
                        <span className="material-symbols-outlined text-[18px] opacity-40 group-hover:opacity-100 transition-opacity">fingerprint</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-2xl focus:bg-error/10 focus:text-error p-4 cursor-pointer font-black text-slate-400 mt-2 flex items-center justify-between group"
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] group-hover:text-error">Terminate Session</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:text-error">logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
