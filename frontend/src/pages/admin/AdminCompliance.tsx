// frontend/src/pages/admin/AdminCompliance.tsx
// Upgraded Fintech Compliance Dashboard — Tax Engine · Compliance · Audit · Offline Queue
import { useState } from 'react';
import {
  useGetComplianceLogsQuery,
  useSubmitNilFilingMutation,
  useGetOverviewStatsQuery,
  useCalculateTaxMutation,
  useGetTaxRatesQuery,
  useGetJobStatsQuery,
  useGetJobQueueQuery,
  useRetryJobMutation,
  usePurgeJobsMutation,
} from '../../store/apiSlice';
import toast from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number | string = 0) =>
  'KES ' + Number(n).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const statusColor = (s: string) => {
  if (['submitted', 'submitted_sandbox', 'completed'].includes(s))
    return 'bg-emerald-50 text-emerald-700';
  if (['failed', 'rejected'].includes(s)) return 'bg-red-50 text-red-600';
  if (['pending', 'processing'].includes(s)) return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-500';
};

// ─── stat card ───────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, accent = 'text-primary', bg = 'bg-white',
}: { icon: string; label: string; value: string | number; sub?: string; accent?: string; bg?: string }) {
  return (
    <div className={`${bg} p-8 rounded-[2.5rem] shadow-sm border border-slate-100/80 flex flex-col gap-6`}>
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl bg-slate-50 ${accent}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">{label}</p>
        <h3 className={`text-3xl font-black tracking-tighter ${accent}`}>{value}</h3>
        {sub && <p className="text-[10px] text-slate-400 font-bold mt-1 italic">{sub}</p>}
      </div>
    </div>
  );
}

// ─── section heading ─────────────────────────────────────────────────────────
function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-black text-primary tracking-tighter uppercase leading-none">{title}</h2>
      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{sub}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function AdminCompliance() {
  // ── data ──
  const { data: overview } = useGetOverviewStatsQuery({});
  const { data: logsData, isLoading: logsLoading } = useGetComplianceLogsQuery({});
  const { data: taxRates }  = useGetTaxRatesQuery();
  const { data: jobStats, refetch: refetchStats }  = useGetJobStatsQuery();
  const { data: jobQueue, refetch: refetchQueue }  = useGetJobQueueQuery();

  // ── mutations ──
  const [submitNilFiling, { isLoading: isFiling }] = useSubmitNilFilingMutation();
  const [calculateTax,    { isLoading: isTaxCalc }] = useCalculateTaxMutation();
  const [retryJob]    = useRetryJobMutation();
  const [purgeJobs]   = usePurgeJobsMutation();

  // ── local state ──
  const [activeTab, setActiveTab] = useState<'overview' | 'tax' | 'logs' | 'queue'>('overview');
  const [taxInput, setTaxInput]   = useState({ monthlyRent: '', bookingFee: '', isShortTermLodging: false });
  const [taxResult, setTaxResult] = useState<any>(null);
  const [filed, setFiled]         = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const logs         = Array.isArray(logsData) ? logsData : [];
  const totalRevenue = Number(overview?.totalRevenue || 0);
  const submitted    = logs.filter((l: any) => ['submitted', 'submitted_sandbox'].includes(l.status)).length;
  const failed       = logs.filter((l: any) => ['rejected'].includes(l.status)).length;
  const pending      = logs.filter((l: any) => l.status === 'pending').length;

  // ── handlers ──
  const handleNilFiling = async () => {
    try {
      await submitNilFiling({ periodStart: new Date().toISOString(), periodEnd: new Date().toISOString() }).unwrap();
      setFiled(true);
      toast.success('NIL Filing transmitted to GavaConnect.');
      setTimeout(() => setFiled(false), 4000);
    } catch { toast.error('NIL Filing failed.'); }
  };

  const handleTaxCalc = async () => {
    if (!taxInput.monthlyRent) { toast.error('Enter monthly rent first.'); return; }
    try {
      const result = await calculateTax({
        monthlyRent: Number(taxInput.monthlyRent),
        bookingFee:  Number(taxInput.bookingFee || 0),
        isShortTermLodging: taxInput.isShortTermLodging,
      }).unwrap();
      setTaxResult(result);
    } catch { toast.error('Tax calculation failed.'); }
  };

  const handleRetry = async (jobId: number) => {
    await retryJob(jobId).unwrap();
    toast.success(`Job #${jobId} queued for retry.`);
    refetchQueue(); refetchStats();
  };

  const handlePurge = async () => {
    const res: any = await purgeJobs().unwrap();
    toast.success(res.message || 'Completed jobs purged.');
    refetchQueue(); refetchStats();
  };

  // ── tabs ──
  const tabs = [
    { id: 'overview', label: 'Overview',       icon: 'dashboard' },
    { id: 'tax',      label: 'Tax Engine',      icon: 'calculate' },
    { id: 'logs',     label: 'Compliance Logs', icon: 'receipt_long' },
    { id: 'queue',    label: 'Offline Queue',   icon: 'cloud_sync' },
  ] as const;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">

      {/* ── Header ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-black text-[10px] tracking-[0.25em] uppercase">
            Tax & Filing Center
          </span>
          <h1 className="text-4xl font-black tracking-tighter mt-1 text-primary font-headline uppercase leading-none">
            KRA Connection
          </h1>
          <p className="text-on-surface-variant mt-3 max-w-2xl text-xs font-bold leading-relaxed opacity-70">
            Easily manage rental income tax and VAT. Everything is sent automatically to the tax office (KRA).
          </p>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
             {[
               { id: '01', title: 'Identity Audit', desc: 'Confirm new Landlords' },
               { id: '02', title: 'Asset Review', desc: 'Verify new house logs' },
               { id: '03', title: 'KRA Sync', desc: 'Monitor auto-reporting' },
               { id: '04', title: 'NIL Filing', desc: 'Monthly empty forms' }
             ].map(step => (
               <div key={step.id} className="min-w-[180px] p-4 rounded-2xl bg-white/50 border border-slate-100 shadow-sm">
                 <span className="text-[10px] font-black text-secondary block mb-1">STEP {step.id}</span>
                 <p className="text-xs font-black text-primary uppercase mb-1">{step.title}</p>
                 <p className="text-[9px] font-bold text-slate-400">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            Current Period: {new Date().toLocaleString('en-KE', { month: 'long', year: 'numeric' })}
          </p>
          <button
            onClick={handleNilFiling}
            disabled={isFiling || submitted > 0}
            className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center gap-3 border-none transition-all ${
              submitted > 0 
                ? 'bg-emerald-500 text-white cursor-not-allowed opacity-100' 
                : 'bg-primary text-white hover:opacity-90 cursor-pointer'
            }`}
          >
            <span className={`material-symbols-outlined text-sm ${isFiling ? 'animate-spin' : ''}`}>
              {isFiling ? 'autorenew' : submitted > 0 ? 'verified' : 'task_alt'}
            </span>
            {isFiling ? 'Filing now...' : submitted > 0 ? 'Tax Filed for this Period' : 'Submit Empty Tax Form (NIL)'}
          </button>
        </div>
      </section>

      {/* filed toast */}
      {filed && (
        <div className="bg-emerald-500 text-white p-6 rounded-[2rem] flex items-center gap-4 shadow-xl animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">done_all</span>
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-widest">Status: Tax Filed Successfully</p>
            <p className="text-sm font-medium opacity-90 italic">Your tax form for this month was accepted by the KRA. You are all set!</p>
          </div>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary text-white shadow-lg'
                : 'text-slate-400 hover:text-primary hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon="account_balance_wallet" label="Platform Yield (Taxable)"
              value={fmt(totalRevenue)} sub="Total rent revenue tracked for the period" accent="text-primary" />
            <StatCard icon="pie_chart" label="Aggregated Tax Liability"
              value={fmt(totalRevenue * 0.075)} sub="Projected MRI commitment (7.5%)" accent="text-tertiary" bg="bg-secondary/5" />
            <StatCard icon="verified" label="Compliance Standing"
              value={submitted} sub={`${pending} records awaiting GavaSync`} accent="text-emerald-700" bg="bg-emerald-50/30" />
          </div>

          {/* Tax rate reference */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <SectionHead title="KRA Tax Rate Reference" sub="Current Kenya tax obligations for rental income" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {taxRates ? [
                { k: 'mri',        label: taxRates.mri?.label,        rate: taxRates.mri?.rate,         color: 'bg-blue-50 text-blue-700',    icon: 'home' },
                { k: 'vat',        label: taxRates.vat?.label,        rate: taxRates.vat?.rate,         color: 'bg-purple-50 text-purple-700', icon: 'receipt' },
                { k: 'withholding',label: taxRates.withholding?.label, rate: taxRates.withholding?.rate, color: 'bg-orange-50 text-orange-700', icon: 'percent' },
                { k: 'tourismLevy',label: taxRates.tourismLevy?.label, rate: taxRates.tourismLevy?.rate, color: 'bg-teal-50 text-teal-700',    icon: 'travel_explore' },
              ].map(({ k, label, rate, color, icon }) => (
                <div key={k} className={`${color} rounded-2xl p-6`}>
                  <span className="material-symbols-outlined text-2xl mb-3 block">{icon}</span>
                  <p className="font-black text-3xl mb-1">{pct(rate)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
                </div>
              )) : (
                <p className="col-span-4 text-center text-slate-300 text-xs py-8 animate-pulse">Loading tax rates...</p>
              )}
            </div>
          </div>

          {/* Job queue summary */}
          {jobStats && (
            <div className="bg-primary text-white rounded-[2.5rem] p-10 grid grid-cols-2 sm:grid-cols-4 gap-8 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              <div className="col-span-2 sm:col-span-4 mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Offline Queue — KRA Retry Pipeline</p>
                <h3 className="text-xl font-black tracking-tighter">Job Worker Status</h3>
              </div>
              {[
                { label: 'Total Jobs',  value: jobStats.total,      icon: 'list' },
                { label: 'Pending',     value: jobStats.pending,     icon: 'schedule' },
                { label: 'Completed',   value: jobStats.completed,   icon: 'check_circle' },
                { label: 'Failed',      value: jobStats.failed,      icon: 'error' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="relative z-10">
                  <span className="material-symbols-outlined text-white/40 text-2xl mb-2 block">{icon}</span>
                  <p className="text-3xl font-black">{value ?? 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ TAX ENGINE TAB ══════════════════ */}
      {activeTab === 'tax' && (
        <div className="space-y-8">
          {/* Calculator card */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <SectionHead title="Rental Tax Calculator" sub="KRA-compliant tax breakdown — VAT · MRI · Withholding · Tourism Levy" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Monthly Rent (KES)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={taxInput.monthlyRent}
                  onChange={e => setTaxInput({ ...taxInput, monthlyRent: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Booking / Service Fee (KES)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={taxInput.bookingFee}
                  onChange={e => setTaxInput({ ...taxInput, bookingFee: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={taxInput.isShortTermLodging}
                    onChange={e => setTaxInput({ ...taxInput, isShortTermLodging: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Short-term lodging (Tourism Levy applies)</span>
                </label>
                <button
                  onClick={handleTaxCalc}
                  disabled={isTaxCalc}
                  className="bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-none cursor-pointer hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <span className={`material-symbols-outlined text-sm ${isTaxCalc ? 'animate-spin' : ''}`}>
                    {isTaxCalc ? 'autorenew' : 'calculate'}
                  </span>
                  {isTaxCalc ? 'Computing...' : 'Calculate'}
                </button>
              </div>
            </div>

            {/* Results */}
            {taxResult && (
              <div className="border-t border-slate-50 pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* headline numbers */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Gross Rent',        value: fmt(taxResult.monthlyRent),         color: 'bg-slate-50' },
                    { label: 'Total Tax',          value: fmt(taxResult.totalMonthlyTax),      color: 'bg-red-50 text-red-700' },
                    { label: 'Platform Fee (3%)',  value: fmt(taxResult.platformFee),          color: 'bg-orange-50 text-orange-700' },
                    { label: 'Net to Landlord',    value: fmt(taxResult.netToLandlordMonthly), color: 'bg-emerald-50 text-emerald-700' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`${color} rounded-2xl p-6`}>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
                      <p className="text-xl font-black tracking-tighter">{value}</p>
                    </div>
                  ))}
                </div>

                {/* line-by-line breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Tax Type', 'Base Amount', 'Rate', 'Tax Amount', 'Applies', 'Regulation'].map(h => (
                          <th key={h} className="pb-5 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-8">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {taxResult.lines?.map((line: any) => (
                        <tr key={line.name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 pr-8 font-bold text-xs text-primary">{line.name}</td>
                          <td className="py-5 pr-8 text-xs font-bold text-slate-600">{fmt(line.base)}</td>
                          <td className="py-5 pr-8">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {line.rateLabel}
                            </span>
                          </td>
                          <td className="py-5 pr-8 font-black text-sm text-primary">{fmt(line.amount)}</td>
                          <td className="py-5 pr-8">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${line.applies ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                              {line.applies ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-5 text-[10px] text-slate-400 font-medium italic max-w-[200px]">{line.regulation}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-primary/10">
                        <td colSpan={3} className="pt-5 font-black text-xs uppercase tracking-widest text-primary">
                          Effective Tax Rate
                        </td>
                        <td className="pt-5 font-black text-xl text-primary" colSpan={3}>
                          {taxResult.effectiveRatePercent}%
                          <span className="ml-3 text-[10px] font-black text-slate-400 tracking-widest">
                            {taxResult.isWithholdingApplicable ? '(WHT Applicable)' : '(WHT Exempt)'}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ COMPLIANCE LOGS TAB ══════════════════ */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <SectionHead title="Global Compliance Ledger" sub="Platform-Wide eTIMS Audit Trail" />
            <div className="flex gap-3">
              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor('submitted')}`}>
                {submitted} Submitted
              </span>
              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor('rejected')}`}>
                {failed} Failed
              </span>
              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor('pending')}`}>
                {pending} Pending
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Log ID', 'Protocol', 'Revenue (KES)', 'Booking ID', 'Initiator', 'Status', 'Timestamp'].map(h => (
                    <th key={h} className="pb-6 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logsLoading ? (
                  <tr><td colSpan={7} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 animate-pulse">Syncing Ledger...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No entries recorded</td></tr>
                ) : logs.map((log: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 pr-6 font-black text-xs text-primary">#{log.logId}</td>
                    <td className="py-6 pr-6 text-xs font-bold text-primary italic">
                      {log.action === 'revenue_report' ? 'MRI_TAX_MANIFEST' : log.action === 'nil_filing' ? 'NIL_FILING' : log.action?.toUpperCase()}
                    </td>
                    <td className="py-6 pr-6 font-black text-sm">
                      {log.action === 'nil_filing' ? 'KES 0' : Number(log.totalRevenueKes) > 0 ? fmt(log.totalRevenueKes) : '—'}
                    </td>
                    <td className="py-6 pr-6 text-xs font-bold text-slate-500">
                      {log.action === 'nil_filing' ? 'General (NIL)' : log.bookingId ? `#${log.bookingId}` : '—'}
                    </td>
                    <td className="py-6 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary">ID</div>
                        <span className="text-xs font-bold text-slate-500">#{log.initiatedById ?? '—'}</span>
                      </div>
                    </td>
                    <td className="py-6 pr-6">
                      <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit ${statusColor(log.status)}`}>
                        {['pending', 'queued_locally', 'offline_sync_pending'].includes(log.status) ? (
                          <>
                            <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span>
                            Waiting for KRA
                          </>
                        ) : log.status === 'submitted_sandbox' ? (
                          'Secured (Sandbox)'
                        ) : log.status === 'submitted' ? (
                          'Filing Successful'
                        ) : (
                          log.status?.replace(/_/g, ' ')
                        )}
                      </span>
                    </td>
                    <td className="py-6 text-[10px] font-bold text-slate-400">
                      {new Date(log.createdAt).toLocaleString('en-KE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ OFFLINE QUEUE TAB ══════════════════ */}
      {activeTab === 'queue' && (
        <div className="space-y-8">
          {/* stats row */}
          {jobStats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {([
                  { label: 'Total',      value: jobStats.total,      icon: 'list',         accent: 'text-primary' },
                  { label: 'Pending',    value: jobStats.pending,    icon: 'schedule',     accent: 'text-amber-600' },
                  { label: 'Processing', value: jobStats.processing, icon: 'sync',         accent: 'text-blue-600' },
                  { label: 'Completed',  value: jobStats.completed,  icon: 'check_circle', accent: 'text-emerald-600' },
                  { label: 'Failed',     value: jobStats.failed,     icon: 'error',        accent: 'text-red-500' },
                ] as const).map(({ label, value, icon, accent }) => (
                  <StatCard key={label} icon={icon} label={label} value={value ?? 0} accent={accent} />
                ))}
              </div>

              {/* Intelligence Note */}
              <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-amber-500 text-3xl animate-pulse">sync_problem</span>
                </div>
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Strategic Automation Active</p>
                  <p className="text-[10px] font-bold text-amber-700/80 leading-relaxed italic">
                    <span className="font-black">Reason for Queue:</span> The KRA Tax Office servers are currently unreachable or rejected the sync request. 
                    The system has <span className="font-black text-amber-900">Secured your data locally</span> and is automatically retrying every 30 seconds. 
                    <span className="ml-1 text-emerald-700 font-black italic underline decoration-dotted">No manual work is required from you.</span>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* job table */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <SectionHead title="KRA Retry Pipeline" sub="Offline jobs queued for GavaConnect sync — exponential backoff" />
              <button
                onClick={handlePurge}
                className="bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border-none cursor-pointer transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Purge Completed
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Job ID', 'Type', 'Status', 'Attempts', 'Next Retry', 'Last Error', 'Action'].map(h => (
                      <th key={h} className="pb-6 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!jobQueue || jobQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        Queue is clear — all jobs processed
                      </td>
                    </tr>
                  ) : jobQueue.map((job: any) => (
                    <tr key={job.jobId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pr-6 font-black text-xs text-primary">#{job.jobId}</td>
                      <td className="py-5 pr-6 text-xs font-bold text-primary italic">
                        {job.type?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-5 pr-6">
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${statusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-5 pr-6 text-xs font-black text-slate-500">
                        {job.attempts}/{job.maxAttempts}
                      </td>
                      <td className="py-5 pr-6 text-[10px] font-bold text-slate-400">
                        {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString('en-KE') : '—'}
                      </td>
                      <td className="py-5 pr-6 max-w-[180px]">
                        <p className="text-[9px] text-red-400 font-medium truncate italic">
                          {job.lastError || '—'}
                        </p>
                      </td>
                      <td className="py-5 flex gap-2">
                        {job.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(job.jobId)}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-none cursor-pointer transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">replay</span>
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-none cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">terminal</span>
                          Monitor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outbox explainer */}
          <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-2xl text-primary/40 flex-shrink-0">info</span>
              <div>
                <p className="font-black text-xs uppercase tracking-widest text-primary mb-2">How Offline Queueing Works</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                  When the KRA API is unreachable, transactions are stored in the <strong>jobs table</strong> as <code>kra_etims_sync</code> jobs.
                  The background worker retries every 30 seconds using <strong>exponential backoff</strong> (2ⁿ × 60s).
                  After {5} failed attempts the job is marked <code>failed</code> and can be manually retried here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ MISSION CONTROL MODAL 🛡️ */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={() => setSelectedJob(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-primary p-8 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined text-emerald-400">shield_with_heart</span>
                  <h3 className="text-xl font-black tracking-tighter uppercase">Mission Control</h3>
                </div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Secure GavaConnect Data Inspection</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Status Banner */}
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <span className={`material-symbols-outlined ${selectedJob.status === 'failed' ? 'text-red-500' : 'text-amber-500 animate-spin-slow'}`}>
                     {selectedJob.status === 'failed' ? 'error' : 'settings_backup_restore'}
                   </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Intelligence</p>
                  <p className="text-sm font-black text-primary uppercase tracking-tight">
                    Job ID #{selectedJob.jobId} — {selectedJob.status === 'failed' ? 'Action Required' : 'Sync Active'}
                  </p>
                </div>
              </div>

              {/* Data Breakdown */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Financial Manifest (Payload)</h4>
                 <div className="bg-primary/5 rounded-[2rem] p-8 space-y-4">
                    {(() => {
                      const payload = typeof selectedJob.payload === 'string' 
                        ? JSON.parse(selectedJob.payload) 
                        : selectedJob.payload;
                      
                      return (
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1 pb-4 border-b border-primary/5">
                             <p className="text-[9px] font-black uppercase text-slate-400">Total Rent (MRI)</p>
                             <p className="text-lg font-black text-primary italic">KES {payload.totalRevenueKes?.toLocaleString()}</p>
                           </div>
                           <div className="space-y-1 pb-4 border-b border-primary/5">
                             <p className="text-[9px] font-black uppercase text-slate-400">Booking Fee (VAT)</p>
                             <p className="text-lg font-black text-primary italic">KES {payload.totalBookingFees?.toLocaleString()}</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-slate-400">Target Period</p>
                             <p className="text-xs font-black text-primary italic">{new Date(payload.periodStart).toLocaleDateString()} - Now</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-slate-400">Associated Node</p>
                             <p className="text-xs font-black text-primary italic">Booking #{payload.bookingId}</p>
                           </div>
                        </div>
                      );
                    })()}
                 </div>
              </div>

              {/* Logs */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Mission Log Trace</h4>
                <div className="bg-slate-900 rounded-3xl p-6 text-emerald-400 font-mono text-[10px] leading-relaxed shadow-inner">
                   <p className="opacity-40">[{new Date(selectedJob.createdAt).toISOString()}] Initializing transaction report...</p>
                   {selectedJob.attempts === 0 && selectedJob.status === 'completed' && (
                     <p className="mt-2 text-emerald-400">[{new Date().toISOString()}] Initial Broadcast: SUCCESS. Data synchronized with KRA.</p>
                   )}
                   {selectedJob.attempts > 0 && <p className="mt-2 text-amber-400 opacity-80">[{new Date().toISOString()}] Connection failed. Attempting retry ({selectedJob.attempts}/{selectedJob.maxAttempts})...</p>}
                   {selectedJob.status === 'failed' && <p className="mt-2 text-red-400 font-black uppercase">[{new Date().toISOString()}] Terminal Failure: {selectedJob.lastError || 'Unknown KRA Host Rejection'}</p>}
                   {selectedJob.status !== 'completed' && <p className="mt-2 animate-pulse text-emerald-300">_waiting_for_next_broadcast_window</p>}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
               <button 
                onClick={() => setSelectedJob(null)}
                className="px-8 py-4 bg-white text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
               >
                 Close Control
               </button>
               {selectedJob.status === 'failed' && (
                 <button 
                  onClick={() => {
                    handleRetry(selectedJob.jobId);
                    setSelectedJob(null);
                  }}
                  className="px-8 py-4 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                 >
                   Manual Override (Retry)
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
