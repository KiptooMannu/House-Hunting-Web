import { useState } from 'react';
import { 
  useGetComplianceLogsQuery,
  useSubmitNilFilingMutation,
  useVerifyComplianceMutation,
  useGetOverviewStatsQuery,
  useListUsersQuery
} from '../../store/apiSlice';

export default function AdminCompliance() {
  const { data: overview } = useGetOverviewStatsQuery({});
  const { data: logsData, isLoading: logsLoading } = useGetComplianceLogsQuery({});
  const { data: usersData } = useListUsersQuery({ role: 'landlord' });
  
  const [submitNilFiling, { isLoading: isFiling }] = useSubmitNilFilingMutation();
  const [verifyCompliance, { isLoading: isVerifying }] = useVerifyComplianceMutation();
  
  const [filed, setFiled] = useState(false);
  const logs = logsData || [];
  
  const totalRevenue = overview?.totalRevenue || 0;
  const platformTaxLiability = Number(totalRevenue) * 0.075; // MRI 7.5%

  const [verificationTarget, setVerificationTarget] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'valid' | 'invalid' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleNilFiling = async () => {
    try {
      await submitNilFiling({
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      }).unwrap();
      setFiled(true);
      setTimeout(() => setFiled(false), 5000);
    } catch (err: any) {
      console.error('Filing failed:', err);
    }
  };

  const handleVerifyTaxnode = async () => {
    if (!verificationTarget) return;
    setVerificationResult({ status: 'idle', message: 'Querying KRA Gateway...' });
    try {
      const response = await verifyCompliance({ kraPin: verificationTarget }).unwrap() as any;
      if (response.valid) {
        setVerificationResult({ status: 'valid', message: `✅ Node Active: ${verificationTarget} is compliant.` });
      } else {
        setVerificationResult({ status: 'invalid', message: `❌ Alert: ${response.reason}` });
      }
    } catch (err: any) {
      setVerificationResult({ status: 'error', message: 'KRA Sandbox Timeout' });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-black text-[10px] tracking-[0.2em] uppercase">Compliance Authority</span>
          <h1 className="text-4xl font-black tracking-tighter mt-1 text-primary font-headline uppercase leading-none">GavaConnect Gateway</h1>
          <p className="text-on-surface-variant mt-4 max-w-2xl font-body leading-relaxed text-sm font-bold">
            Executive control interface for national tax compliance. Manage platform-wide eTIMS integration, perform bulk NIL filings, and verify institutional KRA nodes.
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleNilFiling}
             disabled={isFiling}
             className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 shadow-lg shadow-primary/20 flex items-center gap-3 border-none cursor-pointer"
           >
             <span className="material-symbols-outlined text-sm">{isFiling ? 'autorenew' : 'bolt'}</span>
             {isFiling ? 'Filing...' : 'Initiate Platform Nil Filing'}
           </button>
        </div>
      </section>

      {/* Success Notification */}
      {filed && (
        <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in zoom-in-95">
          <span className="material-symbols-outlined text-3xl">verified</span>
          <div>
            <p className="font-black uppercase tracking-widest text-xs">System Status: Compliant</p>
            <p className="text-sm font-bold opacity-90">NIL Filing broadcasted to GavaConnect and acknowledged by KRA nodes.</p>
          </div>
        </div>
      )}

      {/* Analytics & Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metric 1: Aggregate Revenue */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col justify-between h-56">
           <div className="flex justify-between items-start">
             <div className="p-4 bg-primary/5 text-primary rounded-2xl">
               <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
             </div>
             <span className="text-[10px] font-black uppercase text-secondary tracking-widest bg-secondary/10 px-3 py-1 rounded-full">Live Sync</span>
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total System Yield</p>
             <h3 className="text-4xl font-black text-primary tracking-tighter">KES {Number(totalRevenue).toLocaleString()}</h3>
             <p className="text-[10px] text-slate-400 font-bold mt-2 italic italic opacity-60 uppercase tracking-tight">Across all institutional curators</p>
           </div>
        </div>

        {/* Metric 2: Est. Liability */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col justify-between h-56">
           <div className="flex justify-between items-start">
             <div className="p-4 bg-tertiary/5 text-tertiary rounded-2xl">
               <span className="material-symbols-outlined text-2xl">pie_chart</span>
             </div>
             <span className="text-[10px] font-black uppercase text-tertiary-container tracking-widest bg-tertiary/10 px-3 py-1 rounded-full">Estimated</span>
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MRI Tax Liability (7.5%)</p>
             <h3 className="text-4xl font-black text-primary tracking-tighter">KES {platformTaxLiability.toLocaleString()}</h3>
             <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <p className="text-[10px] text-secondary font-black uppercase tracking-widest">Provisioned for GavaConnect</p>
             </div>
           </div>
        </div>

        {/* Verification Widget */}
        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-56 relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
              <h3 className="text-lg font-black tracking-tighter uppercase mb-4">Node Verification</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={verificationTarget}
                  onChange={(e) => setVerificationTarget(e.target.value)}
                  placeholder="Enter KRA PIN..."
                  className="bg-white/10 border-none rounded-xl py-3 px-4 text-xs font-bold text-white placeholder:text-white/30 outline-none w-full"
                />
                <button 
                  onClick={handleVerifyTaxnode}
                  disabled={isVerifying}
                  className="bg-white text-primary px-4 py-3 rounded-xl font-black text-[10px] uppercase border-none cursor-pointer"
                >
                  {isVerifying ? 'Wait...' : 'Verify'}
                </button>
              </div>
           </div>
           <div className="relative z-10 min-h-[40px]">
             {verificationResult.status !== 'idle' && (
               <div className={`text-[10px] font-black uppercase tracking-widest p-3 rounded-lg ${
                 verificationResult.status === 'valid' ? 'bg-secondary/20 text-secondary' : 'bg-red-500/20 text-red-200'
               }`}>
                 {verificationResult.message}
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Master Transaction Ledger */}
      <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50 overflow-hidden relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter uppercase leading-none">Global Compliance Ledger</h3>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">Platform-Wide eTIMS Audit Trail</p>
          </div>
          <button className="bg-slate-50 text-slate-400 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-slate-100 transition-colors">Export CSV</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield (KES)</th>
                <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Initiator</th>
                <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logsLoading ? (
                <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 animate-pulse">Syncing System Ledger...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No protocol entries recorded</td></tr>
              ) : (
                logs.map((log: any, i: number) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-8 font-black text-primary text-xs uppercase tracking-tight">{log.gavaConnectRequestId.substring(0, 10)}...</td>
                    <td className="py-8 text-xs font-bold text-primary italic">
                      {log.action === 'revenue_report' ? 'MRI_TAX_MANIFEST' : 'NIL_FILING_PROTOCOL'}
                    </td>
                    <td className="py-8 text-right font-black text-primary text-sm">
                      {Number(log.totalRevenueKes) > 0 ? Number(log.totalRevenueKes).toLocaleString() : '—'}
                    </td>
                    <td className="py-8">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-primary">ID</div>
                         <span className="text-xs font-bold text-slate-500">Node #{log.initiatedById}</span>
                       </div>
                    </td>
                    <td className="py-8 text-center">
                      <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${
                        log.status === 'submitted_sandbox' ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-8 text-right text-[10px] font-black text-slate-400 tracking-tighter">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
