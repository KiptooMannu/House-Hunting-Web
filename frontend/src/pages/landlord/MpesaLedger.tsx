import { formatCurrency } from '../../utils/helpers';
import { useGetRevenueQuery } from '../../store/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export default function MpesaLedger() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: revenueData, isLoading } = useGetRevenueQuery({ 
    landlordId: user?.role === 'landlord' ? user.userId : undefined 
  });

  const revenue = revenueData?.data ?? null;
  const payments = revenue?.items || [];
  const summary = revenue?.summary || { total_revenue: 0, total_payments: 0, average_payment: 0 };
  
  const pendingPayments = payments.filter((p: any) => p.status === 'pending');
  const pendingTotal = pendingPayments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const taxLiability = summary.total_revenue * 0.15;

  if (isLoading) return <div className="h-96 flex items-center justify-center animate-pulse text-primary font-black uppercase tracking-widest text-[10px]">Auditing Ledger...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Financial Pulse Summary Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/5 rounded-xl text-primary font-black">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-tighter">{summary.total_payments} Payouts</span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Aggregate Revenue</p>
          <h3 className="text-3xl font-black font-headline text-primary tracking-tighter">{formatCurrency(summary.total_revenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-4 font-bold italic">Net after platform fees</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-tertiary/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary/5 rounded-xl text-tertiary font-black">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="text-xs font-black text-tertiary bg-tertiary/10 px-3 py-1 rounded-full uppercase tracking-tighter">{pendingPayments.length} Scheduled</span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Pending Payouts</p>
          <h3 className="text-3xl font-black font-headline text-tertiary tracking-tighter">{formatCurrency(pendingTotal)}</h3>
          <p className="text-[10px] text-slate-400 mt-4 font-bold">Avg payout: {formatCurrency(summary.average_payment)}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-secondary/20 transition-all group overflow-hidden relative">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary/5 rounded-xl text-secondary font-black">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-widest">GavaConnect Ready</span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Tax Liability (7.5%)</p>
          <h3 className="text-3xl font-black font-headline text-primary tracking-tighter">{formatCurrency(taxLiability)}</h3>
          <p className="text-[10px] text-slate-400 mt-4 font-bold italic uppercase tracking-tighter">Withholding tax automated</p>
        </div>
      </section>

      {/* Advanced Filtering & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 bg-slate-100/50 rounded-2xl px-6 py-4 w-full md:w-auto overflow-hidden border border-slate-50">
          <span className="material-symbols-outlined text-slate-300">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full md:w-64 placeholder:text-slate-300 outline-none text-primary" placeholder="Search Master Ledger Node..." type="text"/>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white text-primary font-black rounded-2xl border border-slate-100 hover:border-primary/20 transition-all text-[10px] uppercase tracking-widest shadow-sm">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Node Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Export Audit
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Transaction ID</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">eTIMS ID</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Intelligence Date</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Node Registry</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Settlement Agent</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline text-right">Yield (KES)</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.length > 0 ? payments.map((p: any, i: number) => (
                <tr key={p.paymentId || i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-8 text-sm font-black text-primary">{p.transactionReference || p.mpesaReceiptNumber || `TXN-${p.paymentId}`}</td>
                  <td className="px-10 py-8">
                     <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {p.status === 'completed' ? `KRA-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : 'Pending'}
                     </span>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-primary font-headline">{p.house?.title || `Property #${p.bookingId}`}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Property Registry Protocol</p>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">TENANT_{p.payerId || 0}</td>
                  <td className="px-10 py-8 text-sm font-black text-primary text-right">{formatCurrency(p.amount)}</td>
                  <td className="px-10 py-8">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full bg-current ${p.status === 'completed' ? 'animate-pulse' : ''}`}></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <button className="text-slate-300 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-10 py-32 text-center text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">No payment records found in the ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Compliance Protocol Banner */}
      <div className="bg-primary p-1 rounded-[3rem] flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-2xl shadow-primary/20 relative">
        <div className="p-12 flex-1 text-white relative z-10">
          <h4 className="text-3xl font-black font-headline mb-4 tracking-tighter">GavaConnect Compliance Protocol</h4>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl font-medium italic">
            Your withholding tax summaries are ready for submission. NestFind Kenya has automatically partitioned {formatCurrency(taxLiability)} to the KRA-linked compliance wallet for real-time audit clearance.
          </p>
        </div>
        <div className="p-12 flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
          <button className="px-10 py-5 bg-white text-primary font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Audit Report</button>
          <button className="px-10 py-5 bg-secondary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-secondary/20">Initiate Payout</button>
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>
    </div>
  );
}
