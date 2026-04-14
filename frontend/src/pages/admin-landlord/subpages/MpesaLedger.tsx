import { formatCurrency } from '../../../utils/helpers';

interface MpesaLedgerProps {
  payments: any[];
  summary: {
    total_revenue: number;
    total_payments: number;
    average_payment: number;
  };
}

export default function MpesaLedger({ payments, summary }: MpesaLedgerProps) {
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingTotal = pendingPayments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const taxLiability = summary.total_revenue * 0.15;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Financial Pulse Summary Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/5 rounded-lg text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">{summary.total_payments} Payouts</span>
          </div>
          <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-1">Aggregate Revenue</p>
          <h3 className="text-3xl font-headline font-extrabold text-primary">{formatCurrency(summary.total_revenue)}</h3>
          <p className="text-xs text-on-surface-variant mt-4 font-medium italic">Net after platform fees</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary/5 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="text-xs font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-1 rounded-full">{pendingPayments.length} Scheduled</span>
          </div>
          <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-1">Pending Payouts</p>
          <h3 className="text-3xl font-headline font-extrabold text-tertiary">{formatCurrency(pendingTotal)}</h3>
          <p className="text-xs text-on-surface-variant mt-4 font-medium">Avg payout: {formatCurrency(summary.average_payment)}</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-outline-variant/20 transition-all group overflow-hidden relative">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary/5 rounded-lg text-secondary">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">GavaConnect Ready</span>
          </div>
          <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-1">Tax Liability (15%)</p>
          <h3 className="text-3xl font-headline font-extrabold text-on-secondary-container">{formatCurrency(taxLiability)}</h3>
          <p className="text-xs text-on-surface-variant mt-4 font-medium italic">Withholding tax automated</p>
        </div>
      </section>

      {/* Advanced Filtering & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 bg-surface-container-high rounded-full px-6 py-2 w-full md:w-auto overflow-hidden">
          <span className="material-symbols-outlined text-outline">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full md:w-64 placeholder:text-outline outline-none" placeholder="Search Master Ledger Node..." type="text"/>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-container-lowest text-on-surface-variant font-semibold rounded-full border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-sm shadow-sm">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Node Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-full hover:opacity-90 transition-all shadow-md text-sm">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Export Audit
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Transaction ID</th>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Intelligence Date</th>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Node Registry</th>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Settlement Agent</th>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline text-right">Yield (KES)</th>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {payments.length > 0 ? payments.map((p: any, i: number) => (
                <tr key={p.paymentId || i} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-5 text-sm font-bold text-primary">{p.transactionReference || p.mpesaReceiptNumber || `TXN-${p.paymentId}`}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-on-surface">{p.house?.title || `Property #${p.bookingId}`}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Property Registry Protocol</p>
                  </td>
                  <td className="px-6 py-5 text-xs font-medium">Tenant ID_{p.payerId || 0}</td>
                  <td className="px-6 py-5 text-sm font-bold text-primary text-right">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'completed' ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'completed' ? 'bg-secondary' : 'bg-outline'}`}></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button className="text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant font-medium">No payment records found in the ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Compliance Protocol Banner */}
      <div className="bg-gradient-to-br from-primary-container to-primary p-1 rounded-2xl flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-xl shadow-primary/20">
        <div className="p-10 flex-1 text-white">
          <h4 className="text-2xl font-headline font-bold mb-3 tracking-tight">GavaConnect Compliance Protocol</h4>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
            Your withholding tax summaries are ready for submission. Savanna Horizon has automatically partitioned {formatCurrency(taxLiability)} to the KRA-linked compliance wallet for real-time audit clearance.
          </p>
        </div>
        <div className="p-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button className="px-8 py-4 bg-white text-primary font-bold rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Audit Report</button>
          <button className="px-8 py-4 bg-secondary text-white font-bold rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-secondary/20">Initiate Payout</button>
        </div>
      </div>
    </div>
  );
}
