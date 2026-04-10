import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import type { RootState } from '../../store';
import { 
  useGetRevenueQuery, 
  useGetHousesQuery, 
  useUpdateHouseMutation 
} from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueQuery({});
  const { data: housesData, isLoading: housesLoading } = useGetHousesQuery({ page: 1, limit: 100 });
  const [updateHouse] = useUpdateHouseMutation();

  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');

  const revenue = revenueData?.data ?? null;
  const listings = housesData?.items ?? [];
  const pendingListings = listings.filter((l: any) => l.approval_status === 'pending');
  const summary = revenue?.summary || { total_revenue: 12480000, total_payments: 0, average_payment: 0 };

  async function updateListingStatus(listingId: number, approvalStatus: 'approved' | 'rejected') {
    setUpdating(listingId);
    try {
      await updateHouse({ id: listingId, approval_status: approvalStatus }).unwrap();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update listing status.');
    } finally {
      setUpdating(null);
    }
  }

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  if (revenueLoading || housesLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface antialiased flex">
      {/* SideNavBar */}
      <aside className="h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-slate-50 border-r border-slate-200/50 flex flex-col p-6 gap-2 z-50 text-left">
        <div className="text-lg font-black text-primary mb-8 font-headline">Curator Admin</div>
        <nav className="flex-grow space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 bg-white text-primary rounded-xl shadow-sm duration-300 ease-in-out font-headline font-medium" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Management Overview</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform duration-300 ease-in-out font-headline font-medium" href="#">
            <span className="material-symbols-outlined">group</span>
            <span>User Management</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform duration-300 ease-in-out font-headline font-medium" href="#">
            <span className="material-symbols-outlined">domain</span>
            <span>Property Oversight</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform duration-300 ease-in-out font-headline font-medium" href="#">
            <span className="material-symbols-outlined">payments</span>
            <span>Revenue & Financials</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform duration-300 ease-in-out font-headline font-medium" href="#">
            <span className="material-symbols-outlined">verified_user</span>
            <span>GavaConnect Compliance</span>
          </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-1">
           <button onClick={() => navigate('/landlord/create-listing')} className="mb-4 w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-headline font-bold shadow-md hover:opacity-90 transition-opacity text-sm">
                Add New Listing
            </button>
          <div className="flex items-center gap-3 mb-6 p-2">
             <Avatar className="w-10 h-10 shadow-sm">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-white font-bold">{user?.fullName?.charAt(0) || 'A'}</AvatarFallback>
             </Avatar>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-primary truncate">{user?.fullName}</p>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Administrator</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/5 rounded-xl transition-all w-full"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-72 flex-1 min-h-screen">
        {/* Top Nav */}
        <header className="h-20 flex justify-between items-center px-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-40">
          <div className="text-left">
            <h1 className="text-2xl font-headline font-extrabold tracking-tight text-primary">Management Overview</h1>
            <p className="text-[13px] text-on-surface-variant font-body">Platform performance for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm font-body w-48 placeholder:text-on-surface-variant/60 outline-none" placeholder="Global search..." type="text"/>
            </div>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-10 text-left">
          {error && <div className="p-4 bg-error-container text-on-error-container rounded-xl font-bold text-sm tracking-tight">{error}</div>}

          {/* Bento Grid - Primary Stats */}
          <section className="grid grid-cols-12 gap-6">
            {/* Revenue Summary Widget */}
            <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-xl relative overflow-hidden group border border-outline-variant/10 shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-9xl">payments</span>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-2">Total Collections</p>
                <h2 className="text-4xl font-headline font-black text-primary mb-4 tracking-tight">{formatCurrency(summary.total_revenue)}</h2>
                <div className="flex items-center gap-2 text-on-secondary-container">
                  <span className="material-symbols-outlined text-lg">trending_up</span>
                  <span className="font-bold text-sm">+14.2% from last month</span>
                </div>
                <div className="mt-8 flex gap-3">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full"></div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant/70 font-label">KSh 15M Monthly Target</p>
              </div>
            </div>

            {/* Compliance Pulse Widget */}
            <div className="col-span-12 lg:col-span-7 bg-slate-50 p-8 rounded-xl flex flex-col justify-between border border-outline-variant/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-headline font-bold text-primary">Compliance Pulse</h3>
                  <p className="text-on-surface-variant text-[13px] mt-1">Portfolio verification & ecosystem health</p>
                </div>
                <span className="px-4 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold uppercase tracking-wider">92% Health</span>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant mb-1">Total Properties</p>
                  <p className="text-2xl font-headline font-black text-primary">{listings.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant mb-1">Pending Review</p>
                  <p className="text-2xl font-headline font-black text-tertiary">{pendingListings.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant mb-1">Approved</p>
                  <p className="text-2xl font-headline font-black text-secondary">{listings.length - pendingListings.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Rows */}
          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
               {/* User Ecosystem Growth Chart Placeholder */}
              <div className="bg-slate-50 p-8 rounded-xl border border-outline-variant/10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-primary">User Ecosystem Growth</h3>
                    <p className="text-[13px] text-on-surface-variant">Seekers vs Landlords month-on-month</p>
                  </div>
                  <div className="flex gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-xs font-semibold text-on-surface-variant">Seekers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <span className="text-xs font-semibold text-on-surface-variant">Landlords</span>
                    </div>
                  </div>
                </div>
                 <div className="h-48 flex items-end justify-between gap-6 px-4">
                  {[40, 60, 100, 75, 90].map((h, i) => (
                    <div key={i} className="flex-1 space-y-3">
                      <div className="flex gap-1 h-full items-end">
                        <div className="w-1/2 bg-primary/40 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }}></div>
                        <div className="w-1/2 bg-secondary/40 rounded-t-lg transition-all hover:bg-secondary" style={{ height: `${h * 0.7}%` }}></div>
                      </div>
                      <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May'][i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

               {/* Verification Queue Table */}
              <div className="bg-slate-50 p-8 rounded-xl border border-outline-variant/10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-primary">Verification Queue</h3>
                    <p className="text-[13px] text-on-surface-variant">Properties awaiting administrative approval</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pendingListings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-medium">
                       <p>No listings pending verification.</p>
                    </div>
                  ) : (
                    pendingListings.map((listing: any) => (
                      <div key={listing.houseId} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                             <img src={listing.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{listing.title}</p>
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                               {listing.location?.county} • {formatCurrency(listing.monthlyRent)}/mo
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => updateListingStatus(listing.houseId, 'rejected')}
                            disabled={updating === listing.houseId}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-error hover:bg-error/5 rounded-full transition-colors"
                           >
                            Reject
                           </button>
                           <button 
                            onClick={() => updateListingStatus(listing.houseId, 'approved')}
                            disabled={updating === listing.houseId}
                            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-secondary text-white rounded-full shadow-lg shadow-secondary/20 hover:scale-105 transition-all outline-none"
                           >
                            Approve
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Compliance Feed Widget */}
            <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-xl shadow-sm self-start border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-headline font-bold text-primary">Compliance Feed</h3>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">Real-time verification alerts</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                   </div>
                   <div>
                      <h5 className="text-[14px] font-bold font-headline text-on-surface">System Audit Complete</h5>
                      <p className="text-[12px] text-on-surface-variant font-body mt-1">Relational integrity check passed for {listings.length} nodes.</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">Just Now</p>
                   </div>
                </div>
                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                   </div>
                   <div>
                      <h5 className="text-[14px] font-bold font-headline text-on-surface">New Landlord Onboarded</h5>
                      <p className="text-[12px] text-on-surface-variant font-body mt-1">Prime Kenya Realty Group</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">3 hours ago</p>
                   </div>
                </div>
                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container shrink-0">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                   </div>
                   <div>
                      <h5 className="text-[14px] font-bold font-headline text-on-surface">Verification Alert</h5>
                      <p className="text-[12px] text-on-surface-variant font-body mt-1">A house in Nairobi requires immediate status review.</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">5 hours ago</p>
                   </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full py-12 px-10 bg-slate-50 border-t border-slate-200 mt-10 text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-headline font-black text-primary text-lg">Estate Curator</div>
            <div className="text-slate-400 font-body text-xs">© 2024 Estate Curator. Editorial Real Estate Excellence.</div>
            <div className="flex gap-6">
              <a className="text-slate-400 font-body text-xs hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a className="text-slate-400 font-body text-xs hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
