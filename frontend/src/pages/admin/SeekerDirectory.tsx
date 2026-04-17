import { useState } from 'react';
import { useListUsersQuery, useVerifyNationalIdMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function SeekerDirectory() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useListUsersQuery({ role: 'seeker', search });
  const [verifyId, { isLoading: isVerifying }] = useVerifyNationalIdMutation();

  const handleVerifyID = async (userId: number, nationalId: string) => {
    if (!nationalId) {
      const input = window.prompt("Enter National ID from Citizen Registry:");
      if (!input) return;
      nationalId = input;
    }

    try {
      await verifyId({ userId, nationalId }).unwrap();
      toast.success('Citizen identity successfully verified & protocol activated.');
    } catch (err: any) {
      toast.error(err.data?.error || 'Registry verification timeout.');
    }
  };

  const seekers = data?.items || [];

  const handleBatchVerify = async () => {
    const unverified = seekers.filter((s: any) => s.accountStatus === 'pending_verification' && s.nationalId);
    
    if (unverified.length === 0) {
      toast.error('No unverified seekers with National IDs found to process.');
      return;
    }

    toast.loading(`Initiating batch verification for ${unverified.length} citizens...`, { id: 'batch-verify' });
    
    let successCount = 0;
    for (const seeker of unverified) {
      try {
        await verifyId({ userId: seeker.userId, nationalId: seeker.nationalId }).unwrap();
        successCount++;
      } catch (err) {
        console.error(`Failed to verify citizen ${seeker.userId}`);
      }
    }
    
    if (successCount === unverified.length) {
      toast.success(`Successfully verified ${successCount} citizens via IPRS.`, { id: 'batch-verify' });
    } else {
      toast.success(`Verified ${successCount} of ${unverified.length} citizens. Some failed.`, { id: 'batch-verify' });
    }
  };
  const metrics = {
    total: data?.total || seekers.length,
    active: seekers.filter((s: any) => s.accountStatus === 'active').length,
    pending: seekers.filter((s: any) => s.accountStatus === 'pending_verification').length,
    newThisWeek: seekers.filter((s: any) => {
      const created = new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Sector Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-black text-[10px] tracking-[0.2em] uppercase">Citizen Registry</span>
          <h1 className="text-4xl font-black tracking-tight mt-1 text-primary font-headline uppercase leading-none tracking-tighter">Seeker Directory</h1>
          <p className="text-on-surface-variant mt-4 max-w-2xl font-body leading-relaxed text-sm font-bold opacity-80">
            Monitor seeker identity verification via IPRS integration. Ensure all active participants in the Savanna Horizon ecosystem are verified citizens with secure historical booking protocols.
          </p>
        </div>
        
        <div className="relative group w-full md:w-80">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person_search</span>
          <input 
            type="text" 
            placeholder="Search citizens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
          />
        </div>
      </section>

      {/* Seeker Metrics Bento */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between h-48 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-primary/5 text-primary rounded-2xl">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Population</p>
            <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{metrics.total}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between h-48 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-secondary/5 text-secondary rounded-2xl">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">Optimal</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Verified Citizens</p>
            <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{metrics.active}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between h-48 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-500/5 text-amber-600 rounded-2xl">
              <span className="material-symbols-outlined">pending</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Awaiting IPRS Audit</p>
            <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">{metrics.pending}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between h-48 group hover:shadow-xl transition-all text-white bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/10 text-white rounded-2xl">
              <span className="material-symbols-outlined">new_releases</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">New Arrivals (7d)</p>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black font-headline tracking-tighter">+{metrics.newThisWeek}</h3>
              <p className="text-[10px] font-bold mb-2 text-white/40 italic">Migration Inflow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Ledger */}
      <section className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen Profile</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">National ID</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing IPRS Gateway...</p>
                    </div>
                  </td>
                </tr>
              ) : seekers.map((seeker: any) => (
                <tr key={seeker.userId} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary text-lg shadow-inner overflow-hidden uppercase">
                        {seeker.profileImage ? (
                          <img src={seeker.profileImage} className="w-full h-full object-cover" alt="" />
                        ) : seeker.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-primary text-base tracking-tight uppercase">{seeker.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{seeker.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <p className="text-xs font-black text-primary font-mono tracking-widest">{seeker.nationalId || 'NOT_REGISTERED'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Republic of Kenya</p>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                      seeker.accountStatus === 'active' 
                        ? 'bg-secondary/10 text-secondary' 
                        : seeker.accountStatus === 'locked' 
                        ? 'bg-error/10 text-error' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${seeker.accountStatus === 'active' ? 'animate-pulse' : ''}`}></span>
                      {seeker.accountStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <p className="text-sm font-black text-primary">{seeker.totalBookings || 0}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Bookings</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{format(new Date(seeker.createdAt), 'MMM dd, yyyy')}</p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    {seeker.accountStatus !== 'active' ? (
                      <button 
                        onClick={() => handleVerifyID(seeker.userId, seeker.nationalId)}
                        disabled={isVerifying}
                        className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 border-none cursor-pointer"
                      >
                        {isVerifying ? 'Wait...' : 'Verify ID'}
                      </button>
                    ) : (
                      <div className="p-2 text-secondary bg-secondary/5 rounded-xl inline-block">
                        <span className="material-symbols-outlined text-lg">verified</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Platform Advisory Footer */}
      <section className="bg-surface-container-low p-10 rounded-[2.5rem] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm ring-1 ring-slate-100">
             <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <div>
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">Horizon Assistant</h4>
            <p className="text-xs text-slate-500 font-medium">I've detected <span className="text-primary font-black">{metrics.pending}</span> seekers awaiting identity verification. Ensure IPRS integrity is maintained.</p>
          </div>
        </div>
        <button onClick={handleBatchVerify} className="bg-white border-none text-primary font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer">Verify Batch</button>
      </section>
    </div>
  );
}
