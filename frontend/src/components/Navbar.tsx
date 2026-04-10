import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const { user, isAuth } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Discover', path: '/houses' },
    { name: 'Insights', path: '/insights' }, // Added Insights
    { name: 'Bookings', path: '/my-bookings', role: ['user', 'seeker'] }, // Allow both user and seeker
    { name: 'My Listings', path: '/landlord', role: 'landlord' },
    { name: 'Admin', path: '/admin', role: 'admin' },
    { name: 'API Test', path: '/test-api', role: 'admin' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm font-manrope text-sm font-bold tracking-tight">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-black text-primary dark:text-blue-200 tracking-tighter">
          Modern Estate Curator
        </Link>

        {/* Global Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks
            .filter((link) => {
              if (!link.role) return true;
              const userRole = (user as any)?.role;
              if (Array.isArray(link.role)) {
                return link.role.includes(userRole);
              }
              return userRole === link.role;
            })
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-primary dark:text-blue-100 border-b-4 border-primary dark:border-blue-400 pb-1'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary transition-colors'
                }`}
              >
                {link.name}
              </Link>
            ))}
        </div>

        {/* Action Controls & User Identity */}
        <div className="flex items-center gap-6">
          <Button 
            onClick={() => {
               if (!isAuth) navigate('/login?message=landlord_required');
               else if (['landlord', 'admin'].includes((user as any)?.role)) navigate('/landlord/create');
               else navigate('/register?role=landlord');
            }}
            className="hidden sm:flex bg-primary text-white px-8 h-12 rounded-full font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 border-none"
          >
            List Property
          </Button>

          {isAuth ? (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="w-12 h-12 rounded-full ring-4 ring-slate-50 overflow-hidden shadow-lg transform transition-transform hover:scale-105 active:scale-95">
                    <Avatar className="h-12 w-12 rounded-none">
                      <AvatarImage src={(user as any)?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} alt={(user as any)?.fullname} className="object-cover" />
                      <AvatarFallback className="bg-primary text-white font-black">{(user as any)?.fullname?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                 </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-64 mt-4 p-4 rounded-[1.5rem] border-none shadow-2xl ring-1 ring-slate-100" align="end">
                 <DropdownMenuLabel className="font-normal p-2 pb-4">
                   <div className="flex flex-col space-y-2">
                     <p className="text-lg font-black text-primary tracking-tighter">{(user as any)?.fullname}</p>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-none">
                       {(user as any)?.email}
                     </p>
                   </div>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator className="bg-slate-50" />
                 <div className="py-2 space-y-1">
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-slate-50 p-3 cursor-pointer">
                      <Link to="/dashboard" className="flex items-center gap-3 font-bold text-primary">
                        <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-slate-50 p-3 cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-3 font-bold text-primary">
                        <span className="material-symbols-outlined text-lg">person</span> Profile Settings
                      </Link>
                    </DropdownMenuItem>
                 </div>
                 <DropdownMenuSeparator className="bg-slate-50" />
                 <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-xl focus:bg-error/10 focus:text-error p-3 cursor-pointer font-bold text-slate-500 mt-2 flex items-center gap-3"
                 >
                   <span className="material-symbols-outlined text-lg">logout</span> Sign Out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
               <Button asChild variant="ghost" className="font-bold text-primary px-6 rounded-full">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary text-white px-8 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 border-none">
                <Link to="/register">Join Elite</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
