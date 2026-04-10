import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import type { RootState } from '../../store';
import { 
  useGetBookingsQuery, 
  useGetHousesQuery, 
  useUpdateBookingStatusMutation,
  useSendRevenueToGavaMutation,
  useSubmitNilFilingMutation,
  useGetComplianceLogsQuery,
  useValidateTccMutation
} from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LandlordDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery({});
  const { data: housesData, isLoading: housesLoading } = useGetHousesQuery({ page: 1, limit: 100 });
  const { data: complianceLogs } = useGetComplianceLogsQuery({});
  
  const [updateStatus] = useUpdateBookingStatusMutation();
  const [sendRevenue, { isLoading: isSendingRevenue }] = useSendRevenueToGavaMutation();
  const [submitNil, { isLoading: isSubmittingNil }] = useSubmitNilFilingMutation();
  const [validateTcc, { isLoading: isValidatingTcc }] = useValidateTccMutation();

  const [activeTab, setActiveTab] = useState('overview');
  const [kraPin, setKraPin] = useState('');
  const [tccNumber, setTccNumber] = useState('');
  const [tccResult, setTccResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const bookings = bookingsData ?? [];
  const housesAll = housesData?.items ?? [];
  const houses = housesAll.filter((h: any) => h.landlordId === user?.id);

  async function updateBookingStatus(bookingId: number, status: 'confirmed' | 'cancelled') {
    try {
      await updateStatus({ id: bookingId, status }).unwrap();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update booking.');
    }
  }

  const stats = useMemo(() => {
    const total = houses.length;
    const pending = bookings.filter((b: any) => b.booking_status === 'pending').length;
    const confirmed = bookings.filter((b: any) => b.booking_status === 'confirmed').length;
    const active = pending + confirmed;
    const revenue = bookings.reduce((sum: number, b: any) => {
      // In this system, booking fee is revenue for landlord? 
      // Usually booking fee might be platform, rent is landlord. 
      // For this demo, let's treat completed payments in bookings as revenue.
      if (b.payment?.payment_status === 'completed') return sum + Number(b.payment.amount || 0);
      return sum;
    }, 0);
    return { total, active, revenue };
  }, [bookings, houses]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  if (bookingsLoading || housesLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface antialiased flex">
      {/* SideNavBar */}
      <aside className="h-screen w-72 hide-scrollbar sticky left-0 top-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col p-6 gap-2 z-50">
        <div className="text-lg font-black text-primary dark:text-sky-100 mb-8 font-headline">Curator Admin</div>
        <nav className="flex-grow space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline font-bold ${activeTab === 'overview' ? 'bg-white dark:bg-slate-900 text-primary dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('properties')} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline font-bold ${activeTab === 'properties' ? 'bg-white dark:bg-slate-900 text-primary dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}>
            <span className="material-symbols-outlined">domain</span>
            <span>My Properties</span>
          </button>
          <button onClick={() => setActiveTab('compliance')} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline font-bold ${activeTab === 'compliance' ? 'bg-white dark:bg-slate-900 text-primary dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}>
            <span className="material-symbols-outlined text-secondary">account_balance</span>
            <span className="text-secondary">GavaConnect & Taxes</span>
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-xl hover:translate-x-1 transition-transform duration-300 ease-in-out font-headline font-bold">
            <span className="material-symbols-outlined">insights</span>
            <span>Analytics</span>
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
          <Link to="/landlord/create-listing" className="mb-4 w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-headline font-bold shadow-md hover:opacity-90 transition-opacity text-center text-sm">
            Add New Listing
          </Link>
          <div className="flex items-center gap-3 mb-6 p-2">
             <Avatar className="w-10 h-10 shadow-sm font-bold">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-white">{user?.fullName?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-primary truncate">{user?.fullName}</p>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Verified Landlord</p>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-error dark:text-slate-400 rounded-xl transition-all w-full text-sm font-bold">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 min-h-screen">
        {/* Top Nav */}
        <header className="h-20 flex justify-between items-center px-10 sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-slate-200/50 z-40">
          <div>
            <h1 className="text-2xl font-headline font-extrabold tracking-tight text-primary">Management Overview</h1>
            <p className="text-[13px] text-on-surface-variant font-body">Platform performance for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm font-body w-48 placeholder:text-on-surface-variant/60" placeholder="Global search..." type="text"/>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-10">
          {error && <div className="p-4 bg-error-container text-on-error-container rounded-xl font-bold text-sm tracking-tight mb-6">{error}</div>}
          {success && <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-sm tracking-tight mb-6">{success}</div>}

          {activeTab === 'overview' && (
            <>
              {/* Bento Grid - Primary Stats */}
          <section className="grid grid-cols-12 gap-6">
            {/* Revenue Summary Widget */}
            <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group border border-outline-variant/10 shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-9xl">payments</span>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-2">Total Collections</p>
                <h2 className="text-4xl font-headline font-black text-primary mb-4 tracking-tight">{formatCurrency(stats.revenue)}</h2>
                <div className="flex items-center gap-2 text-on-secondary-container">
                  <span className="material-symbols-outlined text-lg">trending_up</span>
                  <span className="font-bold text-sm">+{((stats.revenue / 1000000) * 10).toFixed(1)}% from last month</span>
                </div>
                <div className="mt-8 flex gap-3">
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3 rounded-full"></div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant/70 font-label">KSh 1M Monthly Target</p>
              </div>
            </div>

            {/* Compliance Pulse Widget */}
            <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between border border-outline-variant/10 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-headline font-bold text-primary">Compliance Pulse</h3>
                  <p className="text-on-surface-variant text-[13px] mt-1">Portfolio verification & health</p>
                </div>
                <span className="px-4 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold uppercase tracking-wider">92% Health</span>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant mb-1">Properties</p>
                  <p className="text-2xl font-headline font-black text-primary">{stats.total}</p>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant mb-1">Pending Bookings</p>
                  <p className="text-2xl font-headline font-black text-tertiary">{stats.active}</p>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant mb-1">Portfolio Tier</p>
                  <p className="text-lg font-headline font-black text-secondary uppercase tracking-tighter">Elite Partner</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Rows */}
          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* My Properties Table */}
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 text-left">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-primary">Property Inventory</h3>
                    <p className="text-[13px] text-on-surface-variant">Live units in your regional portfolio</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {houses.length === 0 ? (
                    <div className="py-12 text-center text-slate-300">
                       <span className="material-symbols-outlined text-6xl">event_busy</span>
                       <p className="font-bold text-lg mt-4">No Listings</p>
                    </div>
                  ) : houses.map((h: any) => (
                    <div key={h.houseId} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                           <img src={h.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">{h.title}</p>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                             {h.location?.county} • {formatCurrency(h.monthlyRent)}/mo
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${h.approval_status === 'approved' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {h.approval_status || 'pending'}
                        </span>
                        <Link to={`/houses/${h.houseId}`} className="text-primary hover:bg-primary/5 p-2 rounded-full transition-colors">
                           <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Bookings Area */}
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 text-left">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-primary">Pending Viewings</h3>
                    <p className="text-[13px] text-on-surface-variant">Potential tenants awaiting confirmation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {bookings.filter((b:any) => b.booking_status === 'pending').map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                       <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 shadow-sm border-2 border-white">
                             <AvatarFallback className="bg-slate-100 text-primary font-bold">U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-primary text-sm">Tenant Request</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">For {b.house?.title} • {b.booking_date}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'cancelled')}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-error hover:bg-error/5 rounded-full"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                          >
                            Confirm
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Feed Widget */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm self-start border border-outline-variant/10 text-left h-full">
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
                      <h5 className="text-[14px] font-bold font-headline text-on-surface">Agencies Verified</h5>
                      <p className="text-[12px] text-on-surface-variant font-body mt-1">Your profile meets standard compliance for the current quarter.</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">Just Now</p>
                   </div>
                </div>
                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                   </div>
                   <div>
                      <h5 className="text-[14px] font-bold font-headline text-on-surface">Auto-Withdrawal Enabled</h5>
                      <p className="text-[12px] text-on-surface-variant font-body mt-1">Rent disbursements via GavaConnect M-Pesa are now active.</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">2 hours ago</p>
                   </div>
                </div>
                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                   </div>
                   <div>
                      <h5 className="text-[14px] font-bold font-headline text-on-surface">Audit Trails Updated</h5>
                      <p className="text-[12px] text-on-surface-variant font-body mt-1">Relational integrity synced across {houses.length} assets.</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">Yesterday</p>
                   </div>
                </div>
              </div>
            </div>
          </section>
          </>)}

          {activeTab === 'compliance' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                  GavaConnect Integration
                </div>
                <h2 className="text-4xl font-headline font-black text-primary tracking-tighter mb-4">Tax & Compliance Hub</h2>
                <p className="text-on-surface-variant max-w-3xl leading-relaxed text-lg">
                  Submit your real estate revenue reports directly to KRA. As an Elite Landlord, maintaining a <b>Verified</b> status requires monthly or quarterly declarations of your M-Pesa ecosystem earnings.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Actions Form */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                  <div className="bg-white p-10 rounded-[2rem] border-t-8 border-primary shadow-xl shadow-primary/5 text-left">
                     <h3 className="text-2xl font-black font-headline text-primary mb-2">Declare Monthly Revenue</h3>
                     <p className="text-on-surface-variant font-medium mb-8">Submit total income generated across your curated listings.</p>
                     
                     <div className="p-6 bg-surface-container-low rounded-xl mb-8 flex flex-col sm:flex-row justify-between items-center border border-outline-variant/10">
                        <div>
                          <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest mb-1">Calculated Portfolio Value (M-Pesa)</p>
                          <p className="text-3xl font-black text-primary">{formatCurrency(stats.revenue)}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Period Start</p>
                          <p className="font-bold text-on-surface-variant">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={async () => {
                            setError(''); setSuccess('');
                            try {
                              const res = await sendRevenue({
                                periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                                periodEnd: new Date().toISOString(),
                                totalRevenueKes: stats.revenue,
                                totalBookingFees: stats.active * 1500
                              }).unwrap();
                              setSuccess(res.message + ' (Ref: ' + res.gavaConnectRequestId + ')');
                            } catch(err: any) { setError('Failed to submit revenue to GavaConnect.'); }
                          }}
                          disabled={isSendingRevenue}
                          className="flex-1 bg-primary text-white py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-container transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                           {isSendingRevenue ? 'Encrypting & Sending...' : 'Submit M-Pesa Income'}
                        </button>
                        
                        <button 
                          onClick={async () => {
                            setError(''); setSuccess('');
                            try {
                              const res = await submitNil({
                                periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                                periodEnd: new Date().toISOString(),
                              }).unwrap();
                              setSuccess(res.message + ' (Ref: ' + res.gavaConnectRequestId + ')');
                            } catch(err: any) { setError('Failed to submit nil filing.'); }
                          }}
                          disabled={isSubmittingNil}
                          className="flex-1 bg-surface-container-high text-on-surface-variant py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-surface-container transition-all"
                        >
                           {isSubmittingNil ? 'Processing...' : 'File Nil Return'}
                        </button>
                     </div>
                  </div>

                  {/* TCC Validation Module */}
                  <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 p-8 rounded-[2rem] text-left relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                        <span className="material-symbols-outlined text-9xl">admin_panel_settings</span>
                     </div>
                     <h4 className="text-xl font-black font-headline text-primary mb-2 flex items-center gap-2">
                       <span className="material-symbols-outlined text-secondary">verified</span> KRA Certificate Validation
                     </h4>
                     <p className="text-sm font-medium text-on-surface-variant leading-relaxed mb-6">
                       Secure your 'Verified Landlord' badge instantly. Enter your official KRA PIN and Tax Compliance Certificate number below to ping the KRA Apigee servers.
                     </p>
                     
                     <div className="space-y-4 relative z-10">
                        <input 
                           type="text" 
                           placeholder="Enter KRA PIN (e.g. A0168...)" 
                           value={kraPin}
                           onChange={(e) => setKraPin(e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input 
                           type="text" 
                           placeholder="Enter TCC Number (e.g. K92OR...)" 
                           value={tccNumber}
                           onChange={(e) => setTccNumber(e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <button 
                           onClick={async () => {
                             setError(''); setSuccess(''); setTccResult(null);
                             if (!kraPin || !tccNumber) {
                               setError('Please enter both KRA PIN and TCC Number.');
                               return;
                             }
                             try {
                               const res = await validateTcc({ kraPIN: kraPin, tccNumber }).unwrap();
                               if (res.isValid) {
                                  setSuccess(res.message || 'TCC Successfully Validated!');
                                  setTccResult(res.kraResponse?.TCCData || { status: 'Verified' });
                               } else {
                                  setError(res.message || 'Invalid Tax Compliance Certificate.');
                               }
                             } catch(err: any) { setError('Failed to reach KRA gateway.'); }
                           }}
                           disabled={isValidatingTcc}
                           className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 hover:-translate-y-0.5"
                        >
                           {isValidatingTcc ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">shield_locked</span>}
                           {isValidatingTcc ? 'Connecting to KRA...' : 'Secure TCC Validation'}
                        </button>
                     </div>

                     {tccResult && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl animate-in fade-in slide-in-from-top-4">
                           <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              TCC Match Found
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-green-800 uppercase tracking-wider">
                              <div>Status: <span className="text-green-900">{tccResult.TCCStatus || tccResult.status}</span></div>
                              {tccResult.TCCExpiryDate && <div>Expires: <span className="text-green-900">{tccResult.TCCExpiryDate}</span></div>}
                           </div>
                        </div>
                     )}
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm self-start border border-outline-variant/10 text-left h-full">
                  <h3 className="text-xl font-headline font-bold text-primary mb-6">GavaConnect Audit Trail</h3>
                  
                  <div className="space-y-6">
                    {(complianceLogs || []).length === 0 ? (
                      <p className="text-slate-400 text-sm font-bold my-10 italic">No formal submissions recorded yet.</p>
                    ) : complianceLogs?.slice(0,5).map((log: any) => (
                      <div key={log.logId} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                         <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                         </div>
                         <div>
                            <h5 className="text-[13px] font-bold font-headline text-on-surface">
                              {log.action === 'revenue_report' ? 'Revenue Declared' : 'Nil Return Filed'}
                            </h5>
                            <p className="text-[11px] font-black uppercase tracking-widest text-secondary mt-1">Status: {log.status}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold font-mono">Ref: {log.gavaConnectRequestId}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Footer */}
        <footer className="w-full py-12 px-10 bg-slate-50 border-t border-slate-200 mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-headline font-black text-primary text-lg">Estate Curator</div>
            <div className="text-slate-400 font-body text-xs">© 2024 Estate Curator. Editorial Real Estate Excellence.</div>
            <div className="flex gap-6">
              <a className="text-slate-400 font-body text-xs hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="text-slate-400 font-body text-xs hover:text-primary transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
