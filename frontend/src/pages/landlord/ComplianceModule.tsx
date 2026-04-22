import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetProfileQuery, 
  useGetComplianceLogsQuery,
  useVerifyComplianceMutation,
  useGetRevenueQuery,
  useGetHousesQuery,
  useCalculateTaxMutation,
} from '../../store/apiSlice';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export default function ComplianceModule() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profileData } = useGetProfileQuery({});
  const profile = profileData?.user ?? user;

  // Fetch revenue summary: isolated for landlords, global for admins
  const revenueParams = profile?.role === 'landlord' ? { landlordId: profile?.userId } : {};
  const { data: revenueData } = useGetRevenueQuery(revenueParams);
  const { data: housesData } = useGetHousesQuery({ landlordId: profile?.userId });
  
  const { data: logsData, isLoading: logsLoading } = useGetComplianceLogsQuery({});
  const [verifyCompliance, { isLoading: isVerifying }] = useVerifyComplianceMutation();
  const [calculateTax, { isLoading: isTaxCalc }] = useCalculateTaxMutation();
  
  const [taxRent, setTaxRent] = useState('');
  const [taxResult, setTaxResult] = useState<any>(null);
  
  const logs = logsData || [];
  const loading = logsLoading;

  const totalRevenue = revenueData?.data?.summary?.total_revenue || 0;
  const propertyCount = housesData?.length || 0;
  const unallocatedRevenue = Number(totalRevenue) * 0.15;

  // NEW: verification states
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'valid' | 'invalid' | 'error';
    message: string;
    lastVerified?: string;
  }>({ status: 'idle', message: '' });



  // NEW: verify compliance against database & KRA
  const handleVerifyCompliance = async () => {
    setVerificationResult({ status: 'idle', message: 'Verifying with KRA database...' });

    try {
      const response = await verifyCompliance({
        kraPin: profile?.kraPin,
        userId: profile?.userId,
      }).unwrap() as any;

      if (response.valid) {
        setVerificationResult({
          status: 'valid',
          message: `✅ Compliance verified. KRA PIN ${profile?.kraPin} is active and filings are in order.`,
          lastVerified: new Date().toISOString(),
        });
      } else {
        setVerificationResult({
          status: 'invalid',
          message: response.reason || `❌ KRA PIN ${profile?.kraPin} is not valid or has missing filings. Please update your details.`,
        });
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      setVerificationResult({
        status: 'error',
        message: err?.data?.message || err?.message || 'Verification service unavailable. Please try again later.',
      });
    }
  };

  const handleQuickTax = async () => {
    if (!taxRent) { toast.error('Enter a monthly rent to calculate.'); return; }
    try {
      const res = await calculateTax({ monthlyRent: Number(taxRent), bookingFee: 1500 }).unwrap();
      setTaxResult(res);
    } catch { toast.error('Tax calculation failed.'); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Hero Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="max-w-2xl text-left">
          <span className="label-md uppercase tracking-[0.2em] text-secondary font-bold mb-2 block">
            Institutional Status
          </span>
          <h2 className="display-lg text-4xl md:text-5xl font-black text-primary leading-tight tracking-tighter text-left">
            Property Compliance <br />
            <span className="text-secondary">Hub.</span>
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-container-high text-primary font-bold rounded-full text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2 border-none shadow-sm">
            <span className="material-symbols-outlined text-lg">description</span>
            Request Gava Verification
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        {/* Compliance Pulse: Bento Card (enhanced with verify button) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden group border border-slate-100">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-extrabold text-xl text-primary">
                  Compliance Pulse
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    profile?.kraPin
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {profile?.kraPin ? 'Active' : 'Pending'}
                </span>
              </div>
              <div className="space-y-6">
                <div className="text-left">
                  <p className="text-on-surface-variant text-sm font-medium mb-1">
                    KRA Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 ${
                        profile?.kraPin && profile?.accountStatus === 'active'
                          ? 'bg-secondary'
                          : 'bg-amber-500'
                      } rounded-full`}
                    ></div>
                    <p className="font-headline text-2xl font-bold text-primary tracking-tight">
                      {profile?.kraPin && profile?.accountStatus === 'active'
                        ? 'Fully Compliant'
                        : 'Action Required'}
                    </p>
                  </div>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl backdrop-blur-sm border border-white/40">
                  <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-1">
                    Next Filing Date
                  </p>
                  <p className="font-headline text-xl font-extrabold text-tertiary-container">
                    {profile?.kraPin && profile?.accountStatus === 'active'
                      ? 'Nov 20, 2023'
                      : 'Awaiting Authorization'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 italic font-medium">
                    {profile?.kraPin && profile?.accountStatus === 'active'
                      ? 'VAT & Monthly Rental Income'
                      : 'Verification pending node approval'}
                  </p>
                </div>

                {/* NEW: Verify Compliance Button & Result */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleVerifyCompliance}
                    disabled={isVerifying || !profile?.kraPin}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      isVerifying || !profile?.kraPin
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none'
                        : 'bg-primary text-white hover:bg-slate-900 shadow-xl border-none cursor-pointer active:scale-100'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-base">
                          autorenew
                        </span>
                        Verifying with KRA...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">
                          verified_user
                        </span>
                        Verify Compliance (Database & KRA)
                      </>
                    )}
                  </button>
                  {verificationResult.status !== 'idle' && (
                    <div
                      className={`mt-3 text-xs p-3 rounded-lg ${
                        verificationResult.status === 'valid'
                          ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
                          : verificationResult.status === 'invalid'
                          ? 'bg-red-50 text-red-800 border-l-4 border-red-500'
                          : 'bg-amber-50 text-amber-800 border-l-4 border-amber-500'
                      }`}
                    >
                      <p className="font-medium">{verificationResult.message}</p>
                      {verificationResult.lastVerified && (
                        <p className="text-[10px] mt-1 opacity-70">
                          Last verified: {new Date(verificationResult.lastVerified).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-[120px]">verified_user</span>
            </div>
          </div>

          {/* Revenue Breakdown Card */}
          <div className="bg-primary text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-fixed">sync</span>
              Revenue Live Sync
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-primary-fixed-dim text-xs font-medium uppercase tracking-widest">
                    Confirmed M-Pesa
                  </p>
                  <p className="font-headline text-2xl font-bold italic tracking-tighter">
                    KES {Number(totalRevenue).toLocaleString()}
                  </p>
                </div>
                <span className="text-secondary-fixed text-xs font-bold bg-white/10 px-2 py-1 rounded-lg">
                  +12.4%
                </span>
              </div>
              <div className="w-full bg-primary-container h-2 rounded-full overflow-hidden shadow-inner">
                <div className="bg-secondary-fixed w-[85%] h-full rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-xs text-primary-fixed-dim">
                <span className="italic font-medium">Unallocated Revenue</span>
                <span className="text-white font-black">KES {unallocatedRevenue.toLocaleString()}</span>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-slate-50 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="text-left">
              <h3 className="font-headline font-extrabold text-2xl text-primary underline underline-offset-8 decoration-secondary decoration-4">
                Transaction Ledger
              </h3>
              <p className="text-on-surface-variant text-sm mt-3 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history_edu</span>
                Real-time tax tagging for all estate income.
              </p>
            </div>
            <div className="flex gap-2 p-1 bg-surface-container rounded-xl border border-slate-100">
              <button className="px-4 py-2 bg-white text-primary text-xs font-bold rounded-lg shadow-sm border-none">
                Income
              </button>
              <button className="px-4 py-2 text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors border-none">
                Expenses
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-bold animate-pulse italic">
                Synchronizing Ledger with KRA Nodes...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-bold italic">
                No compliance entries detected for this period.
              </div>
            ) : (
              logs.map((log: any, i: number) => (
                <div
                  key={i}
                  className="group flex flex-wrap items-center justify-between p-5 rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant/10 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                        log.status === 'offline_sync_pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {log.action === 'nil_filing' ? 'zero_reporting' : 'payments'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-headline font-bold text-primary italic tracking-tight">
                        {log.action === 'revenue_report'
                          ? `eTIMS Receipt: ${log.gavaConnectRequestId.substring(0, 12)}...`
                          : 'NIL Filing Submission'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-50">
                        {new Date(log.createdAt).toLocaleString()} · ID: {log.logId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 mt-4 sm:mt-0">
                    <div className="text-right">
                      <p className="font-headline font-black text-primary text-lg">
                        {Number(log.totalRevenueKes) > 0
                          ? `KES ${Number(log.totalRevenueKes).toLocaleString()}`
                          : 'NIL'}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-1 
                        ${
                          log.status === 'submitted_sandbox'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.status === 'offline_sync_pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-surface-container-high flex justify-center">
            <button className="text-primary text-sm font-black uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">
              View All Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tax Calculator Widget */}
      <div className="mt-16 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary mb-1">KRA Tax Rules Engine</p>
            <h3 className="text-2xl font-black text-primary tracking-tighter uppercase">Quick Tax Calculator</h3>
            <p className="text-sm text-slate-400 font-medium italic mt-2">MRI 7.5% · VAT 16% · WHT 10% · Tourism Levy 2%</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              placeholder="Monthly rent (KES)"
              value={taxRent}
              onChange={e => setTaxRent(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 w-52"
            />
            <button
              onClick={handleQuickTax}
              disabled={isTaxCalc}
              className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest border-none cursor-pointer hover:opacity-90 flex items-center gap-2 flex-shrink-0"
            >
              <span className={`material-symbols-outlined text-sm ${isTaxCalc ? 'animate-spin' : ''}`}>
                {isTaxCalc ? 'autorenew' : 'calculate'}
              </span>
              Calculate
            </button>
          </div>
        </div>
        {taxResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {[
              { label: 'Gross Rent',      value: `KES ${Number(taxResult.monthlyRent).toLocaleString()}`,         bg: 'bg-slate-50' },
              { label: 'Total Tax',       value: `KES ${Number(taxResult.totalMonthlyTax).toLocaleString()}`,     bg: 'bg-red-50 text-red-700' },
              { label: 'Platform Fee',    value: `KES ${Number(taxResult.platformFee).toLocaleString()}`,         bg: 'bg-orange-50 text-orange-700' },
              { label: 'Net to You',      value: `KES ${Number(taxResult.netToLandlordMonthly).toLocaleString()}`,bg: 'bg-emerald-50 text-emerald-700' },
            ].map(({ label, value, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-6`}>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
                <p className="font-black text-lg tracking-tighter">{value}</p>
              </div>
            ))}
            <p className="col-span-2 md:col-span-4 text-[10px] text-slate-400 font-medium italic">
              Effective rate: <strong>{taxResult.effectiveRatePercent}%</strong> · 
              WHT: <strong>{taxResult.isWithholdingApplicable ? 'Applicable (annual &gt; KES 144K)' : 'Exempt'}</strong> · 
              Annual tax: <strong>KES {Number(taxResult.totalAnnualTax).toLocaleString()}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="md:col-span-2 bg-surface-container-low rounded-[2rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-100">
          <div className="flex-1 text-left">
            <h3 className="font-headline text-3xl font-black text-primary mb-4 leading-tight italic tracking-tighter decoration-secondary decoration-4 underline underline-offset-8 mb-8">
              Optimizing Your <br />
              Tax Liability.
            </h3>
            <p className="text-on-surface-variant mb-8 font-medium italic leading-relaxed">
              Based on your portfolio of {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}, shifting to MRI from Corporate Tax
              could save you approximately{' '}
              <span className="font-black text-secondary">KES {(Number(totalRevenue) * 0.05).toLocaleString()}</span> annually.
            </p>
            <button className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 hover:gap-4 transition-all bg-transparent border-none cursor-pointer">
              Review Advisory Note <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="w-full md:w-64 aspect-square bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-primary/5 flex items-center justify-center relative ring-1 ring-slate-100">
            <div className="w-full h-full border-[12px] border-secondary/5 rounded-full flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 border-[12px] border-secondary border-t-transparent border-l-transparent rounded-full rotate-45 animate-pulse"></div>
              <div className="text-center">
                <p className="text-4xl font-black text-primary italic tracking-tighter">24%</p>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter mt-1">
                  Savings Potential
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary text-white rounded-[2rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 text-left">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
              <span
                className="material-symbols-outlined text-white text-3xl font-variation-fill"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <h3 className="font-headline text-2xl font-black italic tracking-tighter mb-4">
              Gava Assistant
            </h3>
            <p className="text-sm text-primary-fixed-dim leading-relaxed font-medium opacity-80 italic">
              Ask anything about KRA regulations, filing deadlines, or property tax codes.
              Integrated with latest 2024 Finance Act specs.
            </p>
          </div>
          <div className="mt-12 relative z-10">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6 text-xs font-bold italic text-white/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">psychology</span>
              "How do I allocate unallocated M-Pesa revenue?"
            </div>
            <button
              onClick={() =>
                navigate('/landlord/concierge', {
                  state: {
                    message:
                      'I need help with unallocated M-Pesa revenue for my tax filing.',
                  },
                })
              }
              className="w-full py-5 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:-translate-y-1 transition-all border-none flex items-center justify-center gap-2 group/btn"
            >
              Start Strategic Chat
              <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
}
