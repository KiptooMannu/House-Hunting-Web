import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complianceApi } from '../../api/compliance';

export default function ComplianceModule() {
  const navigate = useNavigate();
  const [isFiling, setIsFiling] = useState(false);
  const [filed, setFiled] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await complianceApi.listLogs();
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to fetch compliance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNilFiling = async () => {
    setIsFiling(true);
    try {
      await complianceApi.submitNilFiling({
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString()
      });
      setFiled(true);
      fetchLogs();
      setTimeout(() => setFiled(false), 5000);
    } catch (err: any) {
      console.error('Filing failed:', err);
    } finally {
      setIsFiling(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Success Notification */}
      {filed && (
        <div className="fixed top-24 right-8 z-[100] bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">Nil Filing Successfully Submitted to GavaConnect & KRA</span>
        </div>
      )}

      {/* Hero Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="max-w-2xl text-left">
          <span className="label-md uppercase tracking-[0.2em] text-secondary font-bold mb-2 block">Institutional Status</span>
          <h2 className="display-lg text-4xl md:text-5xl font-black text-primary leading-tight tracking-tighter text-left">
            Your Compliance <br /><span className="text-secondary">At A Glance.</span>
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-container-high text-primary font-bold rounded-full text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2 border-none shadow-sm">
            <span className="material-symbols-outlined text-lg">download</span>
            Download Tax Summary
          </button>
          <button 
            disabled={isFiling}
            onClick={handleNilFiling}
            className={`px-6 py-3 ${isFiling ? 'bg-slate-400' : 'bg-tertiary'} text-on-tertiary font-bold rounded-full text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 border-none`}
          >
            <span className={`material-symbols-outlined text-lg ${isFiling ? 'animate-spin' : ''}`}>
              {isFiling ? 'autorenew' : 'bolt'}
            </span>
            {isFiling ? 'Processing Filing...' : 'Initiate Nil Filing'}
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        {/* Compliance Pulse: Bento Card */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden group border border-slate-100">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-extrabold text-xl text-primary">Compliance Pulse</h3>
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
              </div>
              <div className="space-y-6">
                <div className="text-left">
                  <p className="text-on-surface-variant text-sm font-medium mb-1">KRA Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <p className="font-headline text-2xl font-bold text-primary tracking-tight">Fully Compliant</p>
                  </div>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl backdrop-blur-sm border border-white/40">
                  <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-1">Next Filing Date</p>
                  <p className="font-headline text-xl font-extrabold text-tertiary-container">Nov 20, 2023</p>
                  <p className="text-xs text-on-surface-variant mt-1 italic font-medium">VAT & Monthly Rental Income</p>
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
                  <p className="text-primary-fixed-dim text-xs font-medium uppercase tracking-widest">Confirmed M-Pesa</p>
                  <p className="font-headline text-2xl font-bold italic tracking-tighter">KES 1,240,000</p>
                </div>
                <span className="text-secondary-fixed text-xs font-bold bg-white/10 px-2 py-1 rounded-lg">+12.4%</span>
              </div>
              <div className="w-full bg-primary-container h-2 rounded-full overflow-hidden shadow-inner">
                <div className="bg-secondary-fixed w-[85%] h-full rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-xs text-primary-fixed-dim">
                <span className="italic font-medium">Unallocated Revenue</span>
                <span className="text-white font-black">KES 185,400</span>
              </div>
            </div>
            {/* Background design */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Transaction Ledger: Large Bento Card */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-slate-50 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="text-left">
              <h3 className="font-headline font-extrabold text-2xl text-primary underline underline-offset-8 decoration-secondary decoration-4">Transaction Ledger</h3>
              <p className="text-on-surface-variant text-sm mt-3 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history_edu</span>
                Real-time tax tagging for all estate income.
              </p>
            </div>
            <div className="flex gap-2 p-1 bg-surface-container rounded-xl border border-slate-100">
              <button className="px-4 py-2 bg-white text-primary text-xs font-bold rounded-lg shadow-sm border-none">Income</button>
              <button className="px-4 py-2 text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors border-none">Expenses</button>
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
            ) : logs.map((log, i) => (
              <div key={i} className="group flex flex-wrap items-center justify-between p-5 rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${log.status === 'offline_sync_pending' ? 'bg-amber-50 text-amber-600' : 'bg-secondary-container text-on-secondary-container'}`}>
                    <span className="material-symbols-outlined">
                      {log.action === 'nil_filing' ? 'zero_reporting' : 'payments'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-headline font-bold text-primary italic tracking-tight">
                      {log.action === 'revenue_report' ? `eTIMS Receipt: ${log.gavaConnectRequestId.substring(0, 12)}...` : 'NIL Filing Submission'}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-50">
                      {new Date(log.createdAt).toLocaleString()} · ID: {log.logId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 mt-4 sm:mt-0">
                  <div className="text-right">
                    <p className="font-headline font-black text-primary text-lg">
                      {Number(log.totalRevenueKes) > 0 ? `KES ${Number(log.totalRevenueKes).toLocaleString()}` : 'NIL'}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-1 
                      ${log.status === 'submitted_sandbox' ? 'bg-emerald-100 text-emerald-700' : 
                        log.status === 'offline_sync_pending' ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-200 text-slate-600'}`}>
                      {log.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination / View All */}
          <div className="mt-8 pt-6 border-t border-surface-container-high flex justify-center">
            <button className="text-primary text-sm font-black uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">View All Transactions</button>
          </div>
        </div>
      </div>

      {/* Insights Section: Editorial Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-surface-container-low rounded-[2rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-100">
          <div className="flex-1 text-left">
            <h3 className="font-headline text-3xl font-black text-primary mb-4 leading-tight italic tracking-tighter decoration-secondary decoration-4 underline underline-offset-8 mb-8">Optimizing Your <br />Tax Liability.</h3>
            <p className="text-on-surface-variant mb-8 font-medium italic leading-relaxed">Based on your portfolio of 14 properties, shifting to MRI from Corporate Tax could save you approximately <span className="font-black text-secondary">KES 420,000</span> annually.</p>
            <button className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 hover:gap-4 transition-all bg-transparent border-none cursor-pointer">
              Review Advisory Note <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="w-full md:w-64 aspect-square bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-primary/5 flex items-center justify-center relative ring-1 ring-slate-100">
            {/* Abstract Visual Graph representation */}
            <div className="w-full h-full border-[12px] border-secondary/5 rounded-full flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 border-[12px] border-secondary border-t-transparent border-l-transparent rounded-full rotate-45 animate-pulse"></div>
              <div className="text-center">
                <p className="text-4xl font-black text-primary italic tracking-tighter">24%</p>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter mt-1">Savings Potential</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Support / Chatbot Trigger */}
        <div className="bg-primary text-white rounded-[2rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 text-left">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-white text-3xl font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <h3 className="font-headline text-2xl font-black italic tracking-tighter mb-4">Gava Assistant</h3>
            <p className="text-sm text-primary-fixed-dim leading-relaxed font-medium opacity-80 italic">Ask anything about KRA regulations, filing deadlines, or property tax codes. Integrated with latest 2024 Finance Act specs.</p>
          </div>
          <div className="mt-12 relative z-10">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6 text-xs font-bold italic text-white/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">psychology</span>
              "How do I allocate unallocated M-Pesa revenue?"
            </div>
            <button 
              onClick={() => navigate('/landlord/concierge', { state: { message: "I need help with unallocated M-Pesa revenue for my tax filing." } })}
              className="w-full py-5 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:-translate-y-1 transition-all border-none flex items-center justify-center gap-2 group/btn"
            >
              Start Strategic Chat
              <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
            </button>
          </div>
          {/* Decorative design */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
}
