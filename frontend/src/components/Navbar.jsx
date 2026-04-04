import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide the global navbar on specific dashboard routes where they have their own layouts.
  const hiddenRoutes = ['/admin', '/landlord'];
  const isHidden = hiddenRoutes.some(route => location.pathname.startsWith(route));
  if (isHidden) return null;

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none font-manrope text-sm font-semibold tracking-tight">
      <div className="flex justify-between items-center px-6 py-3 max-w-full mx-auto">
        <Link to="/" className="text-2xl font-black text-sky-900 dark:text-sky-100 tracking-tighter" onClick={() => setMobileMenuOpen(false)}>
          Modern Estate
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/houses" className="text-slate-500 dark:text-slate-400 hover:text-sky-800 transition-colors">Discover</Link>
          
          {isAuth && user?.role === 'user' && (
            <Link to="/my-bookings" className="text-slate-500 dark:text-slate-400 hover:text-sky-800 transition-colors">Bookings</Link>
          )}

          {isAuth && user?.role === 'landlord' && (
            <Link to="/landlord" className="text-slate-500 dark:text-slate-400 hover:text-sky-800 transition-colors">My Listings</Link>
          )}

          {isAuth && user?.role === 'admin' && (
            <Link to="/admin" className="text-slate-500 dark:text-slate-400 hover:text-sky-800 transition-colors">Admin</Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isAuth && (
            <button className="p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-colors active:scale-95 duration-100 text-sky-900 dark:text-sky-400">
              <span className="material-symbols-outlined">search</span>
            </button>
          )}
          
          {isAuth ? (
             <div className="flex items-center gap-2 relative group">
                <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full text-sky-900 dark:text-sky-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">account_circle</span>
                  <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700 py-2 w-48">
                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-error flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                   </button>
                </div>
             </div>
          ) : (
            <>
               <Link to="/login" className="flex items-center gap-2 px-4 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full text-sky-900 dark:text-sky-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                 Login
               </Link>
               <Link to="/register" className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                 Register
               </Link>
            </>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-primary">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-lg absolute w-full">
           <Link to="/houses" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400">Discover</Link>
           {isAuth && user?.role === 'user' && (
             <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400">Bookings</Link>
           )}
           {isAuth && user?.role === 'landlord' && (
             <Link to="/landlord" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400">My Listings</Link>
           )}
           {isAuth && user?.role === 'admin' && (
             <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400">Admin</Link>
           )}
           <hr className="border-slate-100 dark:border-slate-800" />
           {isAuth ? (
             <button onClick={handleLogout} className="text-left text-error w-full font-bold">Logout</button>
           ) : (
             <div className="flex gap-2">
               <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-slate-100 rounded-lg">Login</Link>
               <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-primary text-white rounded-lg">Register</Link>
             </div>
           )}
        </div>
      )}
    </nav>
  );
}
