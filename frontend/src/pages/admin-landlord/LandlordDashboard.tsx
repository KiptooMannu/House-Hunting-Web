import { useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import type { RootState } from '../../store';
import { 
  useGetRevenueQuery, 
  useGetHousesQuery, 
  useGetProfileQuery
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
  const { data: profileData } = useGetProfileQuery({});
  
  const revenue = revenueData?.data ?? null;
  const listings = housesData?.items ?? [];
  const summary = revenue?.summary || { total_revenue: 2840500, total_payments: 42, average_payment: 0 };
  
  const displayListings = useMemo(() => {
    if (user?.role === 'landlord') {
        return listings.filter((l: any) => l.landlordId === user.userId);
    }
    return listings;
  }, [listings, user]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'bookings', label: 'Active Bookings', icon: 'calendar_today' },
    { id: 'properties', label: 'My Listings', icon: 'domain' },
    { id: 'revenue', label: 'Financials (M-Pesa)', icon: 'payments' },
    { id: 'compliance', label: 'Compliance (GavaConnect)', icon: 'verified_user' },
  ];

  if (revenueLoading || housesLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-left">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-background text-on-surface min-h-screen flex text-left font-body">
      {/* SideNavBar */}
      <aside className="h-screen w-72 left-0 top-0 fixed bg-[#f2f4f5] flex flex-col py-6 z-40 hidden md:flex border-r border-slate-200/50">
        <div className="px-8 mb-10">
          <h1 className="text-lg font-black text-[#003461] tracking-tight font-headline">Savanna Horizon</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Landlord Console</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => navigate(`/landlord/${item.id}`)}
              className={`flex items-center gap-3 px-6 py-3 w-full transition-all duration-300 ease-in-out text-left ${
                activeTab === item.id 
                  ? 'bg-white text-[#004B87] font-bold rounded-lg ml-2 shadow-sm scale-95' 
                  : 'text-[#424750] hover:text-[#004B87] hover:translate-x-1'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-headline text-sm">{item.label}</span>
            </button>
          ))}
          <button 
              onClick={() => navigate('/landlord/intelligence')}
              className={`flex items-center gap-3 px-6 py-3 w-full transition-all duration-300 text-left ${
                activeTab === 'intelligence' 
                  ? 'bg-white text-[#004B87] font-bold rounded-lg ml-2 shadow-sm scale-95' 
                  : 'text-[#424750] hover:text-[#004B87]'
              }`}
            >
              <span className="material-symbols-outlined">monitoring</span>
              <span className="font-headline text-sm">Intelligence Hub</span>
            </button>
        </nav>
        <div className="px-6 mt-auto">
          <div className="bg-primary-container p-5 rounded-2xl mb-8">
            <p className="text-on-primary-container text-xs font-bold mb-2">Portfolio Analytics</p>
            <p className="text-white text-[10px] leading-relaxed opacity-80 mb-4 font-medium italic">Gain deeper insights with premium market data integration.</p>
            <button className="w-full py-2 bg-white text-primary text-xs font-bold rounded-full hover:bg-surface-bright transition-colors">Upgrade Plan</button>
          </div>
          <div className="space-y-1">
            <button onClick={() => navigate('/landlord/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-[#424750] hover:text-[#004B87] transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-headline text-sm">Settings</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-error hover:opacity-80 transition-all font-bold">
              <span className="material-symbols-outlined font-variation-fill">logout</span>
              <span className="font-headline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-72 flex-1 min-h-screen">
        {/* TopNavBar */}
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 shadow-sm px-8 h-16 flex justify-between items-center w-full">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary-container placeholder:text-outline-variant outline-none" placeholder="Search bookings, properties, or users..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 mr-6">
              <button onClick={() => navigate('/chatbot')} className="text-[#424750] font-headline font-semibold text-sm hover:text-[#004B87]">AI Support</button>
              <button className="text-[#424750] font-headline font-semibold text-sm hover:text-[#004B87]">Help Center</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
              </button>
              <button onClick={() => navigate('/landlord/concierge')} className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full text-secondary">
                <span className="material-symbols-outlined font-variation-fill">smart_toy</span>
              </button>
            </div>
            <div className="h-8 w-px bg-outline-variant mx-2"></div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/landlord/create-listing')}
                className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-all border-none"
              >
                Create Listing
              </button>
              <div className="flex items-center gap-2">
                 <img 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-container/20 shadow-sm" 
                  src={profileData?.user?.avatar || user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuC0P-pAVbDvv1_TdGe-uRum14LuZp_IfbsfWtXVFE842ewlN4vzYDHXAjsai_hc7TrDhimqtMmCOA6iZAaP5vNHAEhSpn1ifKj_zzWNb9iKhNHmd6XM_gr_kECtDM3r24jM_miDebQd2BC4FP-QfEgT1M2jiT75FxfV1evhHKRszL3glX7x4z5sLhYq-vC7Gx8RWri8bcecoCXepXiLZLAx8O519Uc99nfypmBkGZLHdvo74XhWzkjL7ITNMOvmsjLWM_G_QPir774"}
                 />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-12 max-w-[1600px] mx-auto text-left">
          {activeTab === 'overview' && (
            <>
              {/* Hero Title Section */}
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2 font-headline italic">Estate Overview</h2>
                  <p className="text-on-surface-variant max-w-xl font-medium italic opacity-80 leading-relaxed">
                    Welcome back, Curator. Your portfolio is currently performing 12% above market average in the Nairobi metropolitan area.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-lowest text-primary font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-surface-container transition-all border border-slate-100">
                    <span className="material-symbols-outlined text-lg">file_download</span>
                    Quick Export
                  </button>
                  <button 
                    onClick={() => navigate('/landlord/concierge')}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                    AI Advisor
                  </button>
                </div>
              </section>

              {/* KPI Cards Grid */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-7xl">payments</span>
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="material-symbols-outlined text-primary bg-primary-fixed p-3 rounded-2xl shadow-inner">payments</span>
                    <span className="text-secondary font-black text-[10px] flex items-center gap-1 bg-secondary-container px-3 py-1 rounded-full uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">trending_up</span> 14%
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest mb-2 opacity-60">Total Revenue (KSh)</p>
                    <h3 className="text-3xl font-black text-primary font-headline italic tracking-tighter">{formatCurrency(summary.total_revenue || 2840500)}</h3>
                  </div>
                </div>
                <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden group text-left">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-7xl">calendar_month</span>
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-3 rounded-2xl shadow-inner">calendar_month</span>
                    <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest opacity-60">Current Month</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest mb-2 opacity-60">Active Bookings</p>
                    <h3 className="text-3xl font-black text-primary font-headline italic tracking-tighter">42</h3>
                  </div>
                </div>
                <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden group text-left">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-7xl">verified</span>
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="material-symbols-outlined text-secondary bg-secondary-container p-3 rounded-2xl shadow-inner">verified</span>
                    <span className="text-secondary font-black text-[10px] uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full">Platinum Status</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest mb-2 opacity-60">Compliance Score</p>
                    <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-black text-primary font-headline italic tracking-tighter">98%</h3>
                      <span className="text-[9px] uppercase font-black text-outline mb-1 tracking-[0.2em] opacity-40">GavaConnect Verified</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Active Bookings Table Section */}
              <section className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 text-left">
                <div className="px-10 py-8 flex justify-between items-center bg-surface-container-low/30 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary font-headline">Active M-Pesa Confirmed Bookings</h3>
                  </div>
                  <button onClick={() => navigate('/landlord/revenue')} className="text-primary-container text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all">
                    View Audit Log <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                <div className="overflow-x-auto text-left">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-on-surface-variant/60 text-[10px] uppercase tracking-[0.3em] font-black border-b border-slate-50">
                        <th className="px-10 py-6">Seeker Name</th>
                        <th className="px-10 py-6">Property Name</th>
                        <th className="px-10 py-6">Move-in Date</th>
                        <th className="px-10 py-6">Transaction ID</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container text-left">
                      {[ 
                        { name: 'Amara Okoro', prop: 'The Azure Penthouse', date: 'Oct 12, 2023', tid: 'RJK90210HL', status: 'Confirmed', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD24TcEKP17sjKUQsP5F7XL81U2M1t0ActxKGJl9x29OJkMsvaTK9kPGb3kRnU6sEAhXvJv5vaLgdr4mBbbU_Vc3sMvt6PZK5e-SKdMkJrGmyWPKvsx4Hr_NjKUXRNLyB5D3Edzc0rLplT28nDqUJDin2WNORQgybOBevq7rkEHYmrKkaDLXYVh2DTXwhSLEDNLfBZLYoYD5iL0R4VHqtYCjUPPHJt7ioDvPSLqDpAbj2jqMSfLrx4t5NCZs1myVcDeMOH-r0uT5SU' },
                        { name: 'Kofi Mensah', prop: 'Savanna Ridge Villa 4', date: 'Oct 15, 2023', tid: 'MPL77321XP', status: 'Pending Feedback', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu_cJpu-R-OFk-Dwrt4HThkIevvgYj3bk229a3nYjPo2QLQRF0QrgA44N7iYrM47bgmX2QczlsS2dQqDI6bPsOcQWQpklHmp82KPpVwb4wiqp3D_oAauYpo7JahvX35mVXIApUGGYb7I1a9Gf4aC7MtdlsC9B2teLg2jQmdyyGZ1Wq_XmKMh9RqAbw7NYuRxAgAvfb5Om401r8_0IoZPP8wLjz9ifhZ8G9FCHSJl-isFcc8u28bceLmsk3VGK8bSECIycjKmwgtPc' },
                        { name: 'Zahra Mahmoud', prop: 'Horizon Heights B2', date: 'Oct 20, 2023', tid: 'KLO33219WW', status: 'Confirmed', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDHBefQ0VsuFKUswLl8dmYXpUmirW09PgBKwwD45xwNIDHPEhy4Vpw25m89fVpOTLSg-9iuq4RXJUHfnTOa-OZvTmcFBOGS1ZFsN3zpNkeCFVBHFA0O3rAeWtLcrTSZlitZnVTav5vou4O5E2-GBwjs2PYvEl60O6FQ4MJsZNw58eN4M7AIEyQEmulkXlMkCa8v1anrg_-OrZ07RpSLHGhR2dmxL0kDBnKfuQds1cVpIiUHmaLUW7Kglnoskg5N3TO_GNZWI6ccIY' }
                      ].map((bk, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-all group text-left">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <img alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" src={bk.img} />
                              <span className="font-bold text-primary text-sm font-headline tracking-tight">{bk.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-80">{bk.prop}</td>
                          <td className="px-10 py-6 text-on-surface-variant text-sm font-medium">{bk.date}</td>
                          <td className="px-10 py-6 font-mono text-[11px] text-primary font-black bg-slate-100/50 rounded-lg inline-block my-6 ml-10 px-3">{bk.tid}</td>
                          <td className="px-10 py-6">
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] ${bk.status === 'Confirmed' ? 'bg-secondary-container/30 text-secondary' : 'bg-tertiary-fixed text-tertiary-container'}`}>
                              {bk.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-lg">chat</span>
                              </button>
                              <button className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-lg">visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* My Listings Section */}
              <section className="space-y-8 text-left">
                <div className="flex items-center justify-between text-left">
                  <h3 className="text-2xl font-black text-primary font-headline italic tracking-tighter">My Listings</h3>
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">filter_list</span>
                      <input className="bg-surface-container-high border-none rounded-full py-2 pl-9 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-container shadow-inner" placeholder="Filter listings..." type="text"/>
                    </div>
                    <button onClick={() => navigate('/landlord/properties')} className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all">Manage All</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 text-left">
                  {displayListings.slice(0, 3).map((listing: any) => (
                    <div key={listing.houseId} className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group border border-slate-100 text-left">
                      <div className="relative h-56 overflow-hidden">
                        <img alt="Property" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={getHouseImage(listing.images?.[0])} />
                        <div className="absolute top-4 left-4">
                          <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${listing.status === 'active' ? 'bg-secondary text-white' : 'bg-slate-500 text-white'}`}>
                            {listing.status || 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 text-left">
                        <h4 className="text-primary font-black text-lg mb-1 truncate font-headline tracking-tight">{listing.title}</h4>
                        <p className="text-on-surface-variant text-[11px] font-bold mb-6 flex items-center gap-2 opacity-60">
                          <span className="material-symbols-outlined text-sm">location_on</span> {listing.location?.town || 'Nairobi'}
                        </p>
                        <div className="flex justify-between items-center pt-6 border-t border-slate-50 text-left">
                          <span className="text-primary font-black text-base italic">{formatCurrency(listing.monthlyRent)}/mo</span>
                          <div className="flex gap-2">
                            <button onClick={() => navigate('/landlord/create-listing', { state: { edit: true, house: listing } })} className="w-10 h-10 rounded-xl bg-slate-50 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center shadow-sm group/archive relative">
                              <span className="material-symbols-outlined text-lg">delete</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/archive:block bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xl">Soft Archive Only</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Add New Listing Card */}
                  <button 
                    onClick={() => navigate('/landlord/create-listing')}
                    className="border-2 border-dashed border-outline-variant rounded-[2rem] flex flex-col items-center justify-center p-10 text-center group hover:border-primary-container transition-all hover:bg-primary-container/5 bg-slate-50/50 shadow-inner"
                  >
                    <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-primary-container group-hover:scale-110 transition-all shadow-md">
                      <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">add_business</span>
                    </div>
                    <p className="text-primary font-black uppercase tracking-widest text-[11px] mb-2">Add New Listing</p>
                    <p className="text-on-surface-variant text-[10px] font-medium italic opacity-60 leading-relaxed max-w-[160px]">Expand your curated portfolio today.</p>
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === 'intelligence' && <IntelligenceHub />}
          {activeTab === 'revenue' && <MpesaLedger payments={revenueData?.data?.payments || []} />}
          {activeTab === 'concierge' && <AIConcierge />}
          
          {/* Default Content for other tabs */}
          {!['overview', 'intelligence', 'revenue', 'concierge'].includes(activeTab) && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
               <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <span className="material-symbols-outlined text-8xl mb-6">dynamic_feed</span>
                  <h3 className="text-2xl font-black font-headline tracking-tighter uppercase">{activeTab.replace('-', ' ')}</h3>
                  <p className="text-xs font-bold mt-2 uppercase tracking-[0.3em]">Module Synchronizing...</p>
               </div>
            </div>
          )}
        </div>

        {/* Floating Chatbot Interface */}
        <div className="fixed bottom-12 right-12 z-50 group">
          <button 
            onClick={() => navigate('/landlord/concierge')}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white relative"
          >
            <span className="material-symbols-outlined text-3xl font-variation-fill">auto_awesome</span>
            <span className="absolute top-0 right-0 w-5 h-5 bg-tertiary rounded-full border-4 border-surface animate-pulse"></span>
          </button>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-24 flex items-center justify-around px-6 z-50 border-t border-slate-100 rounded-t-[3rem]">
        {navItems.slice(0, 4).map(item => (
          <button 
            key={item.id}
            onClick={() => navigate(`/landlord/${item.id}`)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-primary scale-110' : 'text-on-surface-variant opacity-40'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === item.id ? 'font-variation-fill' : ''}`}>{item.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
