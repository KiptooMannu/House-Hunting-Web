import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenue, setRevenue] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const [revenueRes, listingsRes] = await Promise.all([
          api.get('/payments/revenue'),
          api.get('/houses', { params: { page: 1, limit: 100 } })
        ]);
        if (!cancelled) {
          setRevenue(revenueRes.data?.data ?? null);
          setListings(listingsRes.data?.data?.houses ?? []);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load admin data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function updateListingStatus(listingId: number, approval_status: 'approved' | 'rejected') {
    setUpdating(listingId);
    try {
      await api.put(`/houses/${listingId}`, { approval_status });
      setListings(prev => prev.map(listing => 
        listing.id === listingId ? { ...listing, approval_status } : listing
      ));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update listing status.');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const pendingListings = listings.filter(l => l.approval_status === 'pending');

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* SideNavBar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 border-r-0 bg-primary flex-col p-4 gap-2 z-50 transform transition-transform duration-300 shadow-2xl flex ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-8 px-2 flex justify-between items-center text-white mt-4">
          <div>
             <h2 className="text-xl font-bold font-headline tracking-tighter">GavaConnect Portal</h2>
             <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase flex items-center gap-1 mt-1">
               <span className="w-1.5 h-1.5 bg-secondary-fixed rounded-full animate-pulse"></span>
               Live sync
             </p>
          </div>
        </div>
        <nav className="flex-grow space-y-2 mt-4">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl shadow-lg border border-white/10 font-bold transition-all backdrop-blur-md">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            <span className="font-headline text-sm tracking-wide">Revenue Metrics</span>
          </Link>
          <Link to="/houses" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-xl">
             <span className="material-symbols-outlined">maps_home_work</span>
             <span className="font-headline text-sm tracking-wide">All Properties</span>
          </Link>
        </nav>
        
        <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/10 mb-4 text-center">
           <span className="material-symbols-outlined text-3xl text-primary-fixed mb-2">admin_panel_settings</span>
           <p className="text-white font-bold text-sm tracking-tight">{(user as any)?.name || 'Administrator'}</p>
           <p className="text-white/60 text-xs mt-1">Superuser</p>
        </div>

        <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white/70 hover:text-error hover:bg-white/10 rounded-xl transition-all">
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 right-0 left-0 z-30 bg-white/90 backdrop-blur-xl shadow-sm border-b border-surface-container-low px-8 py-5">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <button onClick={() => setMobileMenuOpen(true)} className="md:hidden flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">menu</span>
                 </button>
                 <h1 className="text-2xl font-black text-primary tracking-tighter font-headline">Modern Estate</h1>
              </div>
              <div className="hidden md:flex items-center gap-4 bg-surface-container-lowest px-5 py-2.5 rounded-full border border-outline-variant/20 shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                 <span className="material-symbols-outlined text-outline">search</span>
                 <input type="text" placeholder="Search KRA PINs..." className="bg-transparent border-none focus:ring-0 text-sm w-56 placeholder:text-outline-variant" />
              </div>
           </div>
        </header>

        <section className="p-6 md:p-10 max-w-[1400px] w-full mx-auto flex-grow space-y-10">
           {error && <div className="p-4 bg-error-container text-on-error-container rounded-lg font-medium shadow-sm">{error}</div>}

           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
              <div>
                 <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Financial Overview</h2>
                 <p className="text-on-surface-variant font-medium mt-2 text-sm md:text-base">Real-time revenue and compliance tracking</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 bg-white border border-outline-variant/20 text-primary font-bold px-6 py-3 rounded-xl hover:bg-surface-container-lowest hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
                 <span className="material-symbols-outlined text-xl">download</span>
                 Export Compliance Report
              </button>
           </div>

           {/* Metrics Grid */}
           {currentRevenueMetrics(revenue).map((metricsRow, i) => (
             <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10 flex flex-col justify-between group relative overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                         <span className="material-symbols-outlined text-lg">payments</span>
                      </div>
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">YTD</span>
                   </div>
                   <div>
                      <h3 className="text-outline font-semibold text-xs uppercase tracking-widest mb-1">Total Revenue Collected</h3>
                      <p className="text-3xl font-black font-headline text-primary tracking-tight">{formatCurrency(metricsRow.total_revenue)}</p>
                      <p className="text-xs text-secondary font-bold flex items-center gap-1 mt-2">
                         <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.2% vs last year
                      </p>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10 flex flex-col justify-between group relative overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-error/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
                         <span className="material-symbols-outlined text-lg">account_balance</span>
                      </div>
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Est. 15%</span>
                   </div>
                   <div>
                      <h3 className="text-outline font-semibold text-xs uppercase tracking-widest mb-1">Projected Tax Due (KRA)</h3>
                      <p className="text-3xl font-black font-headline text-primary tracking-tight">{formatCurrency(metricsRow.total_revenue * 0.15)}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-2">To be remitted by EOFY</p>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10 flex flex-col justify-between group relative overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-secondary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center">
                         <span className="material-symbols-outlined text-lg">receipt_long</span>
                      </div>
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total</span>
                   </div>
                   <div>
                      <h3 className="text-outline font-semibold text-xs uppercase tracking-widest mb-1">Total M-Pesa Transactions</h3>
                      <p className="text-3xl font-black font-headline text-primary tracking-tight">{metricsRow.total_payments}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-2">Average {formatCurrency(metricsRow.average_payment)}/txn</p>
                   </div>
                </div>
             </div>
           ))}

           {/* Layout Grid for Tables */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              
              {/* Properties Pending Verification */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-surface-container-high bg-surface-container-lowest/50 flex justify-between items-center">
                    <div>
                      <h3 className="font-headline font-bold text-primary text-xl tracking-tight">KRA Pending Verification</h3>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">Approve properties before they go live on Modern Estate</p>
                    </div>
                    <span className="bg-error font-bold text-white text-xs px-2.5 py-1 rounded-full">{pendingListings.length} new</span>
                 </div>
                 
                 {pendingListings.length === 0 ? (
                    <div className="p-12 text-center text-outline-variant">
                       <span className="material-symbols-outlined text-5xl mb-3 opacity-50">done_all</span>
                       <p className="font-bold">Inbox zero</p>
                       <p className="text-sm">All properties verified.</p>
                    </div>
                 ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-surface-container-low text-on-surface-variant font-semibold text-xs">
                             <tr>
                                <th className="px-6 py-3">Property Location</th>
                                <th className="px-6 py-3">Landlord KRA</th>
                                <th className="px-6 py-3">Rent (Mn)</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-container-high">
                             {pendingListings.map(listing => (
                               <tr key={listing.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                  <td className="px-6 py-4">
                                     <div className="font-bold text-primary">{listing.title}</div>
                                     <div className="text-xs text-outline font-medium mt-0.5">{listing.location_name || listing.county || 'Undisclosed Area'}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="font-bold text-slate-700 font-mono tracking-wider">{listing.landlord?.email || 'N/A'}</div>
                                     <div className="text-[10px] bg-warning-container text-warning px-2 py-0.5 rounded-sm inline-block font-bold uppercase tracking-widest mt-1">Pending</div>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-primary">{formatCurrency(listing.rent)}</td>
                                  <td className="px-6 py-4">
                                     <div className="flex justify-end gap-3">
                                        <button 
                                          className="px-4 py-2 rounded-full bg-error/10 hover:bg-error text-error hover:text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-50 font-bold text-[11px] uppercase tracking-widest cursor-pointer"
                                          title="Reject"
                                          onClick={() => updateListingStatus(listing.id, 'rejected')}
                                          disabled={updating === listing.id}
                                        >
                                          Reject
                                        </button>
                                        <button 
                                          className="px-4 py-2 rounded-full bg-secondary-container hover:bg-secondary text-secondary hover:text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-50 font-bold text-[11px] uppercase tracking-widest cursor-pointer"
                                          title="Approve Listing & Log KRA"
                                          onClick={() => updateListingStatus(listing.id, 'approved')}
                                          disabled={updating === listing.id}
                                        >
                                          Approve
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </div>

              {/* Monthly Revenue Sync */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
                    <div>
                      <h3 className="font-headline font-bold text-primary text-xl tracking-tight">Monthly Revenue Ledger</h3>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">Automated tax logging history</p>
                    </div>
                 </div>
                 
                 {(!revenue?.monthly_revenue || revenue.monthly_revenue.length === 0) ? (
                    <div className="p-12 text-center text-outline-variant">
                       <span className="material-symbols-outlined text-5xl mb-3 opacity-50">analytics</span>
                       <p className="font-bold">No data</p>
                       <p className="text-sm">Revenue ledgers will appear here.</p>
                    </div>
                 ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-surface-container-low text-on-surface-variant font-semibold text-xs">
                             <tr>
                                <th className="px-6 py-3">Period</th>
                                <th className="px-6 py-3">Gross Collection</th>
                                <th className="px-6 py-3">Transactions</th>
                                <th className="px-6 py-3 text-right">GavaConnect Sync</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-container-high">
                             {revenue.monthly_revenue.slice(0, 5).map((row: any, idx: number) => (
                               <tr key={idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-primary">{row.month}</td>
                                  <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(row.revenue)}</td>
                                  <td className="px-6 py-4 text-on-surface-variant">{row.payment_count} processed</td>
                                  <td className="px-6 py-4 text-right">
                                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/10 text-secondary font-bold text-[10px] uppercase tracking-widest border border-secondary/20">
                                        <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
                                        Synced
                                     </span>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </div>

           </div>
        </section>
      </main>
    </div>
  );
}

// Helper to reliably wrap the metrics into an array for mapping
function currentRevenueMetrics(revenue: any) {
  if (!revenue || !revenue.summary) return [{ total_revenue: 0, total_payments: 0, average_payment: 0 }];
  return [revenue.summary];
}
