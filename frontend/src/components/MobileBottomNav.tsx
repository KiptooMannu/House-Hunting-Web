import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (!user) return null;

  const role = user.role;
  const isLandlord = role === 'landlord';
  const isAdmin = role === 'admin';
  const isSeeker = role === 'user' || role === 'seeker';

  // Navigation Items by Role
  const seekerItems = [
    { label: 'Explore', icon: 'explore', path: '/houses' },
    { label: 'Insights', icon: 'analytics', path: '/insights' },
    { label: 'Saved', icon: 'favorite', path: '/user/saved' },
    { label: 'Profile', icon: 'person', path: '/user/profile' },
  ];

  const landlordItems = [
    { label: 'Console', icon: 'grid_view', path: '/landlord/overview' },
    { label: 'Properties', icon: 'domain', path: '/landlord/properties' },
    { label: 'Bookings', icon: 'calendar_today', path: '/landlord/bookings' },
    { label: 'Registry', icon: 'verified_user', path: '/landlord/compliance' },
  ];

  const adminItems = [
    { label: 'Panel', icon: 'admin_panel_settings', path: '/admin/overview' },
    { label: 'Queue', icon: 'verification_check', path: '/admin/approvals' },
    { label: 'Audit', icon: 'history', path: '/admin/audit' },
    { label: 'Partners', icon: 'group', path: '/admin/landlords' },
  ];

  const items = isAdmin ? adminItems : isLandlord ? landlordItems : seekerItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-3 bg-white/80 backdrop-blur-2xl z-[100] border-t border-slate-100 shadow-[0_-1px_30px_rgba(0,0,0,0.08)] rounded-t-[2.5rem]">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.path);
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/10 shadow-inner' : 'bg-transparent'}`}>
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "''" }}>
                {item.icon}
              </span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 opacity-80 ${isActive ? 'text-primary' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
