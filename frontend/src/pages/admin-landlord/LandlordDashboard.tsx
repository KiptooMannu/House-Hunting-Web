import { useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import type { RootState } from '../../store';
import { 
  useGetRevenueQuery, 
  useGetHousesQuery, 
  useGetProfileQuery,
  useGetBookingsQuery
} from '../../store/apiSlice';
import { formatCurrency, getHouseImage } from '../../utils/helpers';
import IntelligenceHub from './subpages/IntelligenceHub';
import MpesaLedger from './subpages/MpesaLedger';
import AIConcierge from './subpages/AIConcierge';

type DashboardTab = 'overview' | 'bookings' | 'properties' | 'revenue' | 'compliance' | 'settings' | 'intelligence' | 'concierge';

export default function LandlordDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    return (parts[1] || 'overview') as DashboardTab;
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/landlord' || pathname === '/landlord/') {
      navigate('/landlord/overview', { replace: true });
    }
  }, [pathname, navigate]);

  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueQuery({ 
    landlordId: user?.role === 'landlord' ? user.userId : undefined 
  });
  const { data: housesData, isLoading: housesLoading } = useGetHousesQuery({ page: 1, limit: 100 });
  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery({ 
    landlordId: user?.role === 'landlord' ? user.userId : undefined 
  });
  const { data: profileData } = useGetProfileQuery({});
  
  const revenue = revenueData?.data ?? null;
  const listings = housesData?.items ?? [];
  const bookings = bookingsData ?? [];
  const summary = revenue?.summary || { total_revenue: 0, total_payments: 0, average_payment: 0 };
  
  const { ownedListings, marketListings } = useMemo(() => {
    if (user?.role === 'landlord') {
        return {
            ownedListings: listings.filter((l: any) => l.landlordId === user.userId),
            marketListings: listings.filter((l: any) => l.landlordId !== user.userId)
        };
    }
    return { ownedListings: listings, marketListings: [] };
  }, [listings, user]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    { id: 'bookings', label: 'Active Bookings', icon: 'calendar_today' },
    { id: 'properties', label: 'My Listings', icon: 'domain' },
    { id: 'revenue', label: 'Financials (M-Pesa)', icon: 'account_balance_wallet' },
    { id: 'compliance', label: 'Compliance (GavaConnect)', icon: 'verified_user' },
    { id: 'intelligence', label: 'Intelligence Hub', icon: 'insights' },
  ];

  if (revenueLoading || housesLoading || bookingsLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-left">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Financial Pulse Summary Bento */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/5 rounded-lg text-primary">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="text-xs font-bold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">+12.5%</span>
                </div>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-1">Portfolio Revenue</p>
                <h3 className="text-3xl font-headline font-extrabold text-primary">{formatCurrency(summary.total_revenue)}</h3>
                <p className="text-xs text-on-surface-variant mt-4 font-medium italic">Net after platform fees</p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-tertiary/5 rounded-lg text-tertiary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <span className="text-xs font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-1 rounded-full">{summary.total_payments} Payouts</span>
                </div>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-1">Expected Yield</p>
                <h3 className="text-3xl font-headline font-extrabold text-tertiary">{formatCurrency(summary.total_revenue / 4)}</h3>
                <p className="text-xs text-on-surface-variant mt-4 font-medium">Monthly projection active</p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-secondary/5 rounded-lg text-secondary">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <span className="text-xs font-bold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">GavaReady</span>
                </div>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-1">Reserved Compliance</p>
                <h3 className="text-3xl font-headline font-extrabold text-on-secondary-container">{formatCurrency(summary.total_revenue * 0.15)}</h3>
                <p className="text-xs text-on-surface-variant mt-4 font-medium italic">Protocol automated</p>
              </div>
            </section>

            {/* Managed Bookings Intelligence */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-10">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                    <h3 className="text-lg font-headline font-bold text-on-surface">Active Managed Node Bookings</h3>
                    <button className="text-xs font-bold text-primary hover:underline" onClick={() => navigate('/landlord/bookings')}>View All Clusters</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant/10">
                      <tr>
                        <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Property Node</th>
                        <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Tenant ID</th>
                        <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Status</th>
                        <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline text-right">Yield (KES)</th>
                        <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {bookings.length > 0 ? (
                        bookings.slice(0, 5).map((booking: any, i: number) => (
                          <tr key={i} className="hover:bg-surface-container-low/50 transition-colors group">
                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-on-surface">{booking.house?.title || `Node_${booking.houseId}`}</p>
                              <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{booking.house?.location?.town || 'Port Cluster'}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-medium">Seeker_{booking.seekerId}</span>
                            </td>
                             <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                booking.status === 'confirmed' ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-primary text-right">{formatCurrency(booking.totalPrice)}</td>
                            <td className="px-6 py-5 text-xs text-on-surface-variant">{new Date(booking.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant font-medium">No active node bookings detected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        );
      case 'properties':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* My Managed Nodes */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary mb-1">My Managed Assets</h2>
                  <p className="text-on-surface-variant text-sm font-medium">Exclusive assets under your direct operational authority.</p>
                </div>
                <button 
                  onClick={() => navigate('/landlord/create-listing')}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Deploy Property Node
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ownedListings.map((l: any) => (
                  <div key={l.houseId} className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:-translate-y-2 group group">
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={getHouseImage(l.images?.[0])} alt={l.title} />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest shadow-sm">
                        Managed Alpha
                      </div>
                      {/* Action Layer */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          onClick={() => navigate('/landlord/create-listing', { state: { edit: true, house: l } })}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-xl" 
                          title="Edit Node"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl" title="Delete Node">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-8">
                      <h4 className="text-xl font-headline font-extrabold text-on-surface mb-2">{l.title}</h4>
                      <p className="text-on-surface-variant text-xs mb-6 font-medium leading-relaxed">{l.location?.town || 'Nairobi Central'} • {l.houseType}</p>
                      <div className="flex justify-between items-center pt-6 border-t border-outline-variant/10">
                        <span className="text-lg font-extrabold text-primary font-headline">{formatCurrency(l.monthlyRent)}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold uppercase tracking-wider">Active Yield</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Global Market Inventory */}
            <section className="pt-12 border-t border-outline-variant/10">
               <div className="mb-8">
                  <h2 className="text-2xl font-headline font-bold text-outline mb-1">Market Liquidity Overviews</h2>
                  <p className="text-on-surface-variant text-sm font-medium italic text-left">Read-only snapshots of the broader ecosystem.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {marketListings.slice(0, 8).map((l: any) => (
                      <div key={l.houseId} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5 hover:border-outline-variant/30 transition-all cursor-default text-left">
                         <div className="aspect-square rounded-xl overflow-hidden mb-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                            <img className="w-full h-full object-cover" src={getHouseImage(l.images?.[0])} alt={l.title} />
                         </div>
                         <h5 className="text-sm font-bold text-on-surface truncate font-headline">{l.title}</h5>
                         <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">{l.location?.town || 'Nairobi'}</p>
                         <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs font-bold text-primary">{formatCurrency(l.monthlyRent)}</span>
                            <span className="text-[9px] font-black text-outline uppercase tracking-widest">Public Domain</span>
                         </div>
                      </div>
                   ))}
                </div>
            </section>
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-primary/5 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-xl">calendar_today</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Total Bookings</p>
                <h3 className="text-3xl font-headline font-extrabold text-primary">{bookings.length}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-secondary/5 rounded-lg text-secondary">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Confirmed</p>
                <h3 className="text-3xl font-headline font-extrabold text-secondary">{bookings.filter((b: any) => b.status === 'confirmed').length}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-tertiary/5 rounded-lg text-tertiary">
                    <span className="material-symbols-outlined text-xl">hourglass_top</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Pending Payment</p>
                <h3 className="text-3xl font-headline font-extrabold text-tertiary">{bookings.filter((b: any) => b.status === 'pending_payment').length}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-primary/5 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                <h3 className="text-3xl font-headline font-extrabold text-primary">{formatCurrency(bookings.reduce((acc: number, b: any) => acc + Number(b.totalPrice || 0), 0))}</h3>
              </div>
            </section>

            {/* Bookings Table */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Bookings on Your Listings</h3>
                  <p className="text-xs text-on-surface-variant mt-1">All bookings made by seekers on properties you manage</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant/10">
                    <tr>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Property</th>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Tenant</th>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Status</th>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Move-in</th>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline text-right">Amount (KES)</th>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Booking Fee</th>
                      <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Booked On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {bookings.length > 0 ? (
                      bookings.map((booking: any, i: number) => (
                        <tr key={booking.bookingId || i} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-on-surface">{booking.house?.title || `Property #${booking.houseId}`}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{booking.house?.location?.town || '—'} • {booking.house?.houseType || '—'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-medium text-on-surface">Seeker #{booking.seekerId}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              booking.status === 'confirmed' 
                                ? 'bg-secondary-container/20 text-secondary' 
                                : booking.status === 'pending_payment' 
                                ? 'bg-tertiary-fixed/20 text-tertiary'
                                : booking.status === 'cancelled'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                booking.status === 'confirmed' ? 'bg-secondary' 
                                : booking.status === 'pending_payment' ? 'bg-tertiary' 
                                : booking.status === 'cancelled' ? 'bg-red-500'
                                : 'bg-outline'
                              }`}></span>
                              {booking.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs text-on-surface-variant font-medium">
                            {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-primary text-right">{formatCurrency(booking.totalPrice)}</td>
                          <td className="px-6 py-5 text-xs font-medium text-on-surface-variant">{formatCurrency(booking.bookingFee)}</td>
                          <td className="px-6 py-5 text-xs text-on-surface-variant">
                            {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-4xl text-slate-200">event_busy</span>
                            <p className="text-on-surface-variant font-medium">No bookings found for your listings yet.</p>
                            <p className="text-xs text-on-surface-variant/60">When seekers book your properties, they'll appear here.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'revenue':
        return <MpesaLedger payments={revenue?.items || []} summary={summary} />;
      case 'intelligence':
        return <IntelligenceHub />;
      case 'concierge':
        return <AIConcierge />;
      default:
        return (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
               <span className="material-symbols-outlined text-4xl">construction</span>
            </div>
            <h2 className="text-2xl font-black text-primary font-headline tracking-tighter mb-2 italic">Module Under Refinement</h2>
            <p className="text-on-surface-variant text-sm max-w-sm font-medium">This intelligence node is currently being calibrated. Please check back during the next synchronization cycle.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex text-left font-body">
      {/* SideNavBar (Authority: Design System) */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col py-6 z-40 hidden md:flex border-r border-slate-100 dark:bg-slate-950">
        <div className="px-6 mb-10">
          <div className="px-8 py-8">
            <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-blue-900/60 dark:text-blue-200/60 font-headline uppercase">Landlord Console</h2>
            <div className="h-0.5 w-6 bg-primary mt-2 rounded-full"></div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <div className="flex flex-col gap-1 px-4">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => navigate(`/landlord/${item.id}`)}
                className={`flex items-center gap-4 px-4 py-3.5 transition-all group rounded-lg relative ${
                  activeTab === item.id 
                    ? 'text-primary bg-primary/5 dark:bg-primary/20 font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {activeTab === item.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"></div>}
                <span className={`material-symbols-outlined text-[22px] ${activeTab === item.id ? 'text-primary' : 'group-hover:text-primary'}`} data-icon={item.icon}>{item.icon}</span>
                <span className="font-headline text-[15px]">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="px-4 mt-auto">
          <div className="p-4">
            <div className="bg-primary-container rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              <h4 className="text-white font-headline font-bold text-sm mb-2 relative z-10">Portfolio Analytics</h4>
              <p className="text-white/80 text-[11px] leading-relaxed mb-6 relative z-10">Gain deeper insights with premium market data integration.</p>
              <button className="w-full bg-white text-primary text-[11px] font-bold py-2.5 rounded-lg hover:bg-blue-50 transition-colors relative z-10">
                Upgrade Now
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-primary transition-colors w-full text-left"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="text-xs font-medium font-headline">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-slate-100">
          <div className="flex justify-between items-center px-8 py-4 max-w-full">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50 font-headline capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-4 text-slate-500">
                <span className="material-symbols-outlined cursor-pointer hover:text-blue-900 transition-colors">notifications</span>
                <span className="material-symbols-outlined cursor-pointer hover:text-blue-900 transition-colors">account_balance_wallet</span>
              </div>
              <div className="h-px w-6 bg-slate-200 rotate-90 mx-2"></div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => navigate('/landlord/create-listing')}
                  className="bg-primary text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-all"
                >
                  Create Listing
                </button>
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm cursor-pointer" onClick={() => navigate('/landlord/settings')}>
                  <img 
                    alt="User profile" 
                    src={profileData?.user?.avatar || user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuADSb4LBrUvOv--7YkD8ee9Oo5KvCqNbtbBqK4RygeLF9KMlut2f_udkKrfZaavlZTuvXxZZWrn2R-_OFCU5ZlY2_W49EeJzJdxk4gqc96m1faGPthqtjC6MSQ3qWfe2ro77WYnykgHMR7dnHIT93-N8R-_CNdV_QWSduRZrTA37AgbyOGVoM16_6BvYalIwaJC4OkKvLOHbIVLUT4RWvdFk8A8RgJK8WPPQQ9uLGVcFP7EV1gTErxXnWczGMJ048uHgGSYg567GwQ"}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pt-24 px-8 pb-12 flex-1">
            {renderTabContent()}
        </div>

        {/* Footer (Authority: Design System) */}
        <footer className="w-full py-12 px-8 border-t border-slate-100 bg-white dark:bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
            <div className="col-span-1 md:col-span-1">
              <span className="font-headline font-bold text-blue-900 text-xl block mb-4">Savanna Horizon</span>
              <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">High-end real estate curation and financial management across the Kenyan highlands.</p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-headline font-bold text-on-surface text-sm">Quick Links</span>
              <button className="text-slate-500 text-xs hover:text-blue-900 text-left">Privacy Policy</button>
              <button className="text-slate-500 text-xs hover:text-blue-900 text-left">Investment Terms</button>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-headline font-bold text-on-surface text-sm">Compliance</span>
              <button className="text-slate-500 text-xs hover:text-blue-900 text-left">M-Pesa Disclosure</button>
              <button className="text-slate-500 text-xs hover:text-blue-900 text-left">Tax Compliance</button>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-headline font-bold text-on-surface text-sm">Support</span>
              <p className="text-slate-500 text-xs text-left">Help Center</p>
              <p className="text-slate-500 text-xs text-left">Contact Admin</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 font-body text-[10px]">© 2024 Savanna Horizon Real Estate. Licensed by GavaConnect.</p>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-slate-300 hover:text-blue-900 cursor-pointer text-lg">public</span>
              <span className="material-symbols-outlined text-slate-300 hover:text-blue-900 cursor-pointer text-lg">share</span>
            </div>
          </div>
        </footer>

        {/* Floating AI Assistant (Editorial Design Rule: Glassmorphism) */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => navigate('/landlord/concierge')}
            className="h-14 w-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
            </span>
          </button>
        </div>
      </main>

      {/* Mobile Nav could be updated similarly if needed, but keeping it simple for now */}
    </div>
  );
}
