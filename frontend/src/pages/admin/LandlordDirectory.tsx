import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListUsersQuery, useVerifyKraMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

export default function LandlordDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_verification' | 'rejected'>('all');
  
  const { data, isLoading } = useListUsersQuery({ 
    role: 'landlord', 
    search, 
    accountStatus: statusFilter === 'all' ? undefined : statusFilter 
  });
  
  const [verifyKra, { isLoading: isVerifying }] = useVerifyKraMutation();

  const handleVerifyKRA = async (userId: number, kraPin: string) => {
    let pinToVerify = kraPin;
    if (!pinToVerify) {
      const manualPin = window.prompt('No PIN on file. Please enter the Landlord\'s KRA PIN manually:');
      if (!manualPin) return;
      pinToVerify = manualPin;
    }
    
    try {
      await verifyKra({ userId, kraPin: pinToVerify }).unwrap();
      toast.success('KRA PIN verified and account activated.');
    } catch (err: any) {
      toast.error(err.data?.error || 'Verification failed.');
    }
  };

  const landlords = data?.items || [];
  
  const handleBatchVerify = async () => {
    const unverified = landlords.filter((l: any) => l.accountStatus !== 'active' && l.kraPin);
    
    if (unverified.length === 0) {
      toast.error('No unverified landlords with KRA PINs found to process.');
      return;
    }

    toast.loading(`Initiating batch verification for ${unverified.length} landlords...`, { id: 'batch-verify' });
    
    let successCount = 0;
    for (const landlord of unverified) {
      try {
        await verifyKra({ userId: landlord.userId, kraPin: landlord.kraPin }).unwrap();
        successCount++;
      } catch (err) {
        console.error(`Failed to verify user ${landlord.userId}`);
      }
    }
    
    if (successCount === unverified.length) {
      toast.success(`Successfully verified ${successCount} landlords.`, { id: 'batch-verify' });
    } else {
      toast.success(`Verified ${successCount} of ${unverified.length} landlords. Some failed.`, { id: 'batch-verify' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const metrics = {
    total: data?.total || landlords.length,
    verified: landlords.filter((l: any) => l.accountStatus === 'active').length,
    revenue: landlords.reduce((acc: number, l: any) => acc + (Number(l.totalRevenue) || 0), 0),
    newThisWeek: landlords.filter((l: any) => {
      const created = new Date(l.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-on-surface-variant font-bold text-xs tracking-[0.2em] uppercase opacity-60">System Registry</span>
          <h2 className="text-4xl font-black tracking-tight mt-1 text-primary font-headline">Landlord Directory</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-full items-center border border-slate-200/50 shadow-inner">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
            >
              All Users
            </button>
            <button 
              onClick={() => setStatusFilter('active')}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${statusFilter === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
            >
              Verified
            </button>
            <button 
              onClick={() => setStatusFilter('pending_verification')}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${statusFilter === 'pending_verification' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-amber-500'}`}
            >
              Unverified
            </button>
            <button 
              onClick={() => setStatusFilter('rejected')}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${statusFilter === 'rejected' ? 'bg-error text-white shadow-sm' : 'text-slate-400 hover:text-error'}`}
            >
              Fraud Flagged
            </button>
          </div>
          <button className="flex items-center gap-3 bg-primary text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 border-none">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Register New
          </button>
        </div>
      </div>

      {/* Search & Search Bar Wrapper */}
      <div className="relative group max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
        <input 
          className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant/30 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all font-manrope shadow-sm" 
          placeholder="Search landlords, PINs or entities..." 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <span className="text-secondary text-xs font-black flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-full">
              +12% <span className="material-symbols-outlined text-xs">trending_up</span>
            </span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Total Landlords</p>
          <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{metrics.total}</h3>
          <p className="text-[10px] text-on-surface-variant mt-3 font-bold">Active profiles across platform</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-inner">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-40">Target: 95%</span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Verified KRA</p>
          <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{metrics.verified}</h3>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden shadow-inner">
            <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${(metrics.verified/metrics.total)*100}%` }}></div>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 font-bold">{((metrics.verified/metrics.total)*100).toFixed(1)}% compliance rate</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-inner">
              <span className="material-symbols-outlined text-3xl">payments</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Annual Yield</p>
          <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{formatCurrency(metrics.revenue)}</h3>
          <p className="text-[10px] text-on-surface-variant mt-3 font-bold">Platform-wide portfolio</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-low rounded-[2rem] p-8 border-l-[6px] border-tertiary hover:bg-white hover:shadow-2xl transition-all group shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform shadow-inner">
              <span className="material-symbols-outlined text-3xl">person_add</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">New This Week</p>
          <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{metrics.newThisWeek}</h3>
          <p className="text-[10px] text-error font-black uppercase tracking-widest mt-3">8 pending approval</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
        <div className="px-10 py-8 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
          <h4 className="font-headline font-black text-xl text-primary tracking-tight">Registry Database</h4>
          <div className="flex gap-6">
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filters
            </button>
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all">
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Landlord Profile</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">KRA Protocol</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 text-center">Portfolio</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Yield (KES)</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {landlords.map((landlord: any) => (
                <tr key={landlord.userId} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4 text-left cursor-pointer group" onClick={() => navigate(`/admin/landlords/${landlord.userId}`)}>
                      {landlord.profileImage ? (
                        <img src={landlord.profileImage} className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-1 ring-slate-100 group-hover:ring-primary/40 transition-all" alt="" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center font-black text-primary text-xl shadow-inner uppercase group-hover:bg-primary group-hover:text-white transition-all">
                          {landlord.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                          landlord.accountStatus === 'active' 
                            ? 'bg-secondary/10 text-secondary' 
                            : landlord.accountStatus === 'rejected'
                            ? 'bg-error/10 text-error animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${landlord.accountStatus === 'active' ? 'bg-secondary animate-pulse' : landlord.accountStatus === 'rejected' ? 'bg-error' : 'bg-slate-400'}`}></span>
                          {landlord.accountStatus === 'rejected' ? 'Fraud Violation' : landlord.accountStatus.replace('_', ' ')}
                        </span>
                        <p className="font-black text-on-surface text-sm uppercase tracking-tight">{landlord.fullName}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold opacity-60">{landlord.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {landlord.accountStatus === 'active' ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-secondary text-[9px] font-black uppercase tracking-widest shadow-sm">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Verified
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleVerifyKRA(landlord.userId, landlord.kraPin || '')}
                        disabled={isVerifying}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[9px] font-black uppercase tracking-widest hover:bg-primary-fixed hover:text-primary transition-all disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-xs animate-pulse">history</span>
                        {isVerifying ? 'Checking...' : 'Verify KRA'}
                      </button>
                    )}
                  </td>
                  <td className="px-10 py-6 text-center font-black text-primary text-sm">{landlord.totalListings || 0} Assets</td>
                  <td className="px-10 py-6 font-headline font-black text-sm text-secondary tracking-tight">
                    {formatCurrency(landlord.totalRevenue || 0)}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button 
                         onClick={() => navigate(`/admin/landlords/${landlord.userId}`)}
                         className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm border-none bg-transparent cursor-pointer"
                         title="View Profile"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button 
                        onClick={() => toast.success(`Starting chat with ${landlord.fullName}...`, { icon: '💬' })}
                        className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all shadow-sm border-none bg-transparent cursor-pointer"
                        title="Send Message"
                      >
                        <span className="material-symbols-outlined text-lg">chat</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-10 py-8 flex justify-between items-center bg-slate-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Showing {landlords.length} entries</p>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-on-surface-variant hover:bg-slate-50 transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white text-xs font-black shadow-lg">1</button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Bubble */}
      <div className="fixed bottom-10 right-10 z-[60] flex flex-col items-end gap-6">
        {landlords.filter((l: any) => l.accountStatus !== 'active').length > 0 && (
          <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-[2rem] rounded-br-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-outline-variant/10 max-w-xs animate-in slide-in-from-bottom-5 duration-700">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary shadow-inner">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Horizon Assistant</p>
                  <p className="text-[9px] font-bold text-secondary uppercase tracking-tight">Active Analysis</p>
                </div>
             </div>
             <p className="text-sm text-on-surface leading-normal font-medium text-left">
                I've detected <span className="text-secondary font-black">{landlords.filter((l: any) => l.accountStatus !== 'active').length} unverified</span> credentials. Would you like me to initiate a batch verification protocol for those with PINs on file?
             </p>
             <div className="mt-6 flex gap-3">
                <button 
                  onClick={handleBatchVerify}
                  className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none"
                >
                  Start Protocol
                </button>
                <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant bg-slate-100 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all border-none">Dismiss</button>
             </div>
          </div>
        )}
        <button 
          onClick={() => toast('Command Overlay Active: [Mass Nudge | Export | Scan]', { icon: '⚡' })}
          className="w-16 h-16 rounded-[1.5rem] bg-primary text-white shadow-2xl flex items-center justify-center hover:rotate-12 hover:scale-110 transition-all border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </button>
      </div>
    </div>
  );
}
