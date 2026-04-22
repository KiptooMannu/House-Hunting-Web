import { useState } from 'react';
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
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuth } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Session terminated safely.');
    navigate('/login');
  };

  interface NavLink {
    name: string;
    path: string;
  }

  const navLinks: NavLink[] = [
    { name: 'Listings', path: '/houses' },
    { name: 'Insights', path: '/insights' }, 
    { name: 'Gallery', path: '/houses?filter=gallery' },
    { name: 'Concierge', path: '/chatbot' },
  ];

  const isAdminOrLandlord = user?.role === 'landlord' || user?.role === 'admin';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500">
      <nav className="flex justify-between items-center px-6 md:px-12 py-5 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-6 md:gap-16">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-primary hover:bg-slate-50 rounded-xl transition-colors border-none bg-transparent outline-none"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          
          <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-primary dark:text-blue-400 font-headline uppercase italic shrink-0">
            NestFind<span className="font-light opacity-50 not-italic">Kenya</span>
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

        <div className="flex items-center gap-4 md:gap-8">
          {!isAuth ? (
            <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all bg-transparent border-none outline-none"
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="px-6 md:px-8 py-2.5 md:py-3 bg-primary hover:bg-primary-container text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-primary/20 border-none"
              >
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-6">
               <button 
                onClick={() => navigate(isAdminOrLandlord ? '/landlord/overview' : '/user/overview')}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all border-none"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Console
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-0.5 rounded-full hover:bg-slate-50 transition-all outline-none border-none bg-transparent group">
                    <Avatar className="h-10 w-10 md:h-11 md:w-11 border-2 md:border-4 border-white shadow-xl ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
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

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-500 ease-out p-8 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-black text-primary italic">Menu.</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex flex-col space-y-6 flex-grow">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black text-primary dark:text-white tracking-tighter italic border-b border-slate-50 dark:border-slate-800 pb-4 transition-all hover:pl-2"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-4 pt-8">
            <button 
              onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
              className="w-full py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-primary dark:text-white font-black uppercase tracking-widest text-xs border-none"
            >
              System Login Access
            </button>
            {!isAuth ? (
              <button 
                onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs border-none shadow-xl"
              >
                Create Account
              </button>
            ) : (
              <button 
                onClick={() => { navigate(isAdminOrLandlord ? '/landlord/overview' : '/user/overview'); setIsMobileMenuOpen(false); }}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs border-none shadow-xl"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
