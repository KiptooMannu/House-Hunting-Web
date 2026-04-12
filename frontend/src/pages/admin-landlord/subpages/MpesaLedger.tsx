import { formatCurrency } from '../../../utils/helpers';

export default function MpesaLedger({ payments }: { payments: any[] }) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Financial Pulse Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-full tracking-widest uppercase">+12.5%</span>
            </div>
            <p className="text-on-surface-variant font-label text-[10px] font-black uppercase tracking-[0.2em] mb-2">Aggregate Revenue</p>
            <h3 className="text-3xl font-black text-primary font-headline tracking-tighter">KES 4,280,000</h3>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-tertiary/5 rounded-2xl text-tertiary">
                <span className="material-symbols-outlined text-2xl">event_upcoming</span>
              </div>
              <span className="text-[10px] font-black text-tertiary bg-tertiary/10 px-3 py-1.5 rounded-full tracking-widest uppercase">3 Scheduled</span>
            </div>
            <p className="text-on-surface-variant font-label text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pending Payouts</p>
            <h3 className="text-3xl font-black text-tertiary font-headline tracking-tighter uppercase whitespace-nowrap">KES 142,500</h3>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-secondary/5 rounded-2xl text-secondary">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-full tracking-widest uppercase">Compliance Ready</span>
            </div>
            <p className="text-on-surface-variant font-label text-[10px] font-black uppercase tracking-[0.2em] mb-2">Tax Liability (15%)</p>
            <h3 className="text-3xl font-black text-on-secondary-container font-headline tracking-tighter">KES 642,000</h3>
          </div>
        </div>
      </section>

      {/* Advanced Ledger Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-4 bg-slate-50 rounded-full px-6 py-3 border border-slate-100">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input className="bg-transparent border-none focus:ring-0 text-xs font-bold w-64 placeholder:text-slate-300" placeholder="Search Master Ledger..." />
             </div>
             <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-full border border-slate-100 hover:bg-white transition-all">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                    Filter By Node
                </button>
                <button className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                    Export Statement
                </button>
             </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-headline">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-headline">Intelligence Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-headline">Node Registry</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-headline">Settlement Agent</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-headline text-right">Yield (KSh)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-headline">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-body">
              {payments.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6 text-sm font-black text-primary tracking-tighter">{p.transactionId}</td>
                  <td className="px-8 py-6 text-xs text-on-surface-variant font-medium">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-on-surface tracking-tighter">{p.house?.title || 'System Node 402B'}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Savanna Ridge Cor.</p>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-on-surface-variant">Auth User_{p.paymentId}</td>
                  <td className="px-8 py-6 text-base font-black text-right text-primary tracking-tighter">{formatCurrency(p.amount)}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'completed' ? 'bg-secondary' : 'bg-slate-400'}`}></span>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Compliance Protocol Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-primary p-[1px] rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-20 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-8 relative z-10">
          <div className="flex-1 text-white text-center lg:text-left">
            <h4 className="text-2xl font-black font-headline tracking-tighter mb-3">GavaConnect Compliance Protocol</h4>
            <p className="text-primary-fixed/70 text-sm leading-relaxed max-w-2xl font-body">
              Your withholding tax summaries for May 2024 are ready for submission. Savanna Horizon has automatically partitioned KES 642,000 to the KRA-linked compliance wallet for real-time audit clearance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button className="px-10 py-4 bg-white text-primary font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl">Audit Report</button>
            <button className="px-10 py-4 bg-secondary text-white font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl shadow-secondary/20">Initiate Payout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
