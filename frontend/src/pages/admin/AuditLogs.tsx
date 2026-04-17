import { useListAuditLogsQuery } from '../../store/apiSlice';
import { format } from 'date-fns';

export default function AuditLogs() {
  const { data: logs, isLoading } = useListAuditLogsQuery({});

  const stats = [
    { label: 'Total Actions (24h)', value: logs?.length || 0, trend: '+14% vs yesterday', color: 'primary' },
    { label: 'Security Alerts', value: '0', sub: 'Requiring immediate review', color: 'error' },
    { label: 'Auth Success Rate', value: '100%', sub: 'Standard baseline', color: 'secondary' },
    { label: 'Compliance Score', value: '100', sub: 'SOC2 Compliant', color: 'secondary' },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
        <div>
          <span className="text-secondary font-bold text-xs tracking-widest uppercase">Security & Compliance</span>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1 text-primary font-headline">System Audit Logs</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl font-body leading-relaxed">
            Real-time ledger of all administrative actions, authentication attempts, and financial transactions within the Estate Curator ecosystem.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-5 py-2.5 rounded-full bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-all border-none outline-none">
            <span className="material-symbols-outlined text-lg mr-2">filter_list</span>
            Filters
          </button>
          <button className="flex items-center px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:opacity-90 transition-all border-none outline-none shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg mr-2">ios_share</span>
            Export Ledger
          </button>
        </div>
      </div>

      {/* Stats Overview - Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-surface-container-low p-6 rounded-2xl space-y-1 border-b-4 text-left ${
            stat.color === 'primary' ? 'border-primary' : stat.color === 'error' ? 'border-error' : 'border-secondary'
          }`}>
            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color === 'error' ? 'text-error' : 'text-primary'}`}>{stat.value}</p>
            {stat.trend ? (
              <p className="text-secondary text-[10px] font-bold flex items-center">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span> {stat.trend}
              </p>
            ) : (
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Audit Ledger Table */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-primary font-headline">Activity Feed</h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-secondary mr-1.5 animate-pulse"></span> Live Feed</span>
            <span className="mx-2">|</span>
            <span>Showing last {logs?.length || 0} entries</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Actor</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Action Category</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Detailed Action</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-body">
              {logs?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"> No system activity recorded yet. </td>
                </tr>
              ) : (
                logs?.map((log: any) => (
                  <tr key={log.logId} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-primary">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{format(new Date(log.createdAt), 'HH:mm:ss')} GMT+3</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-black text-xs">
                          {log.performedBy?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-primary">{log.performedBy?.fullName || 'System'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{log.performedBy?.role || 'Automation'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        log.action === 'house_approve' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                      }`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-600 font-medium">
                        {(() => {
                           try {
                             const details = log.newValues ? JSON.parse(log.newValues) : {};
                             if (log.action === 'create') return `Listed new property ID: ${log.recordId}`;
                             if (log.action === 'house_approve') return `Authorized property listing ID: ${log.recordId}`;
                             if (log.action === 'house_revoke') return `Revoked authorization for property ID: ${log.recordId}. Reason: ${details.reason || 'None'}`;
                             if (log.action === 'house_reject') return `Rejected listing ID: ${log.recordId}. Reason: ${details.reason || 'None'}`;
                           } catch (e) {
                             return `Action performed on ${log.tableName}`;
                           }
                           return `Action performed on ${log.tableName}`;
                        })()}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center text-sm font-bold text-secondary">
                        <span className="material-symbols-outlined text-lg mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Success
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-primary hover:underline text-[10px] font-black uppercase tracking-widest border-none bg-transparent">
                        {log.tableName?.charAt(0).toUpperCase()}-{log.recordId}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Page 1 of {Math.ceil((logs?.length || 0) / 25) || 1}</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 disabled:opacity-30 border-none outline-none shadow-sm cursor-pointer" disabled>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-primary border-none outline-none shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
