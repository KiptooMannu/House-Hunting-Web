import { useGetOverviewStatsQuery, useGetAdminStatsQuery, useListAuditLogsQuery, useGetHousesQuery } from '../../store/apiSlice';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function AdminOverview() {
  const navigate = useNavigate();
  const { data: overview, isLoading: overviewLoading } = useGetOverviewStatsQuery({});
  const { data: adminStats, isLoading: statsLoading } = useGetAdminStatsQuery({});
  const { data: logs, isLoading: logsLoading } = useListAuditLogsQuery({});
  const { data: pendingHouses, isLoading: pendingLoading } = useGetHousesQuery({ status: 'pending_approval' });

  const metrics = [
    { label: 'System Transactions', value: overview?.totalRevenue?.toLocaleString() || '0', sub: 'Gross volume (Live)', icon: 'payments', color: 'primary' },
    { label: 'Active Inventory', value: overview?.activeHouses || '0', sub: 'Verified assets', icon: 'domain', color: 'secondary' },
    { label: 'Pending Approvals', value: overview?.pendingApprovals || '0', sub: 'Awaiting review', icon: 'pending_actions', color: 'error' },
    { label: 'Total Landlords', value: overview?.totalLandlords || '0', sub: 'Institutional & Private', icon: 'group', color: 'primary' },
  ];

  if (overviewLoading || statsLoading || logsLoading || pendingLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Transform revenue growth for chart
  const revenueChartData = adminStats?.revenueGrowth?.map((item: any) => ({
    month: item.month,
    revenue: item.revenue
  })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-black text-[10px] tracking-[0.2em] uppercase">Executive Intelligence</span>
          <h1 className="text-4xl font-black tracking-tighter mt-1 text-primary font-headline uppercase leading-none">Command Overview</h1>
          <p className="text-on-surface-variant mt-4 max-w-2xl font-body leading-relaxed text-sm font-bold">
            Aggregated system intelligence and high-level performance metrics for Savanna Horizon Kenya. Monitor institutional growth and compliance status in real-time.
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex -space-x-3">
             <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-xs text-primary shadow-sm overflow-hidden"><img src="https://i.pravatar.cc/150?u=1" alt="user" className="w-full h-full object-cover" /></div>
             <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-xs text-primary shadow-sm overflow-hidden"><img src="https://i.pravatar.cc/150?u=2" alt="user" className="w-full h-full object-cover" /></div>
             <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-xs text-primary shadow-sm overflow-hidden"><img src="https://i.pravatar.cc/150?u=3" alt="user" className="w-full h-full object-cover" /></div>
             <div className="w-10 h-10 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center font-black text-[10px] shadow-sm">+8</div>
           </div>
           <div className="text-right">
             <p className="text-xs font-black text-primary tracking-tight">Active Agents</p>
             <p className="text-[10px] font-black text-secondary uppercase tracking-[0.1em]">System Healthy</p>
           </div>
        </div>
      </section>

      {/* Primary Metrics Layer */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {metrics.map((stat, i) => (
          <div key={i} className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-50 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${stat.color === 'primary' ? 'bg-primary/5 text-primary' : stat.color === 'error' ? 'bg-error/5 text-error' : 'bg-secondary/5 text-secondary'} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors cursor-pointer">north_east</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary tracking-tighter">{stat.value}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.label === 'Pending Approvals' && overview?.pendingApprovals > 0 ? 'text-error animate-pulse' : 'text-secondary'}`}>
                  {stat.sub}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Behavioral Intelligence (Charts) View */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-8">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="text-2xl font-black text-primary tracking-tighter uppercase">Platform Scalability</h3>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Revenue Growth (Last 6 Months)</p>
             </div>
           </div>
           
           <div className="h-[300px] w-full">
             {revenueChartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueChartData}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#003461" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#003461" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="month" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                     dy={10} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                   />
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', padding: '12px' }} 
                     labelStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#003461" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <span className="material-symbols-outlined text-4xl italic">analytics</span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting consistent transaction data...</p>
                </div>
             )}
           </div>
        </div>

        {/* Action Ledger (Mini Audit) */}
        <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-xl flex flex-col space-y-8 relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">System Ledger</h3>
               <span className="material-symbols-outlined text-2xl animate-spin-slow">history</span>
             </div>
             <div className="space-y-6">
                {logs?.slice(0, 5).map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-px bg-white/20 relative">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(27,109,36,0.8)]"></div>
                    </div>
                    <div className="pb-6">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{format(new Date(log.createdAt), 'HH:mm')}</p>
                       <p className="text-xs font-bold leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                          {log.performedBy?.fullName} performed {log.action.replace('_', ' ')} on {log.tableName}
                       </p>
                    </div>
                  </div>
                ))}
                {logs?.length === 0 && <p className="text-[10px] uppercase font-black tracking-widest text-white/40">No activity recorded</p>}
             </div>
             <button onClick={() => navigate('/admin/audit')} className="w-full py-4 mt-6 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-none text-white cursor-pointer">
               Launch Full Ledger
             </button>
           </div>
        </div>
      </section>

      {/* Featured Insight Section */}
      <section className="bg-surface-container-low p-2 rounded-[3rem] overflow-hidden">
        <div className="bg-white p-10 rounded-[2.8rem] flex flex-col md:flex-row gap-10 items-center">
           <div className="w-full md:w-1/3 h-64 rounded-3xl overflow-hidden shadow-2xl">
             <img 
               src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" 
               alt="insight" 
               className="w-full h-full object-cover" 
             />
           </div>
           <div className="flex-1 space-y-6 text-left">
             <span className="bg-primary/5 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Compliance Advisory</span>
             <h3 className="text-3xl font-black text-primary tracking-tighter uppercase leading-tight">Elevated Portfolio Verification Needed</h3>
             <p className="text-base text-slate-500 font-bold leading-relaxed max-w-2xl">
                Maintain Tier 1 data integrity. Regularly review the verification queue to onboarding institutional property portfolios within the Nairobi metropolice area.
             </p>
             <div className="flex gap-4">
                <button onClick={() => navigate('/admin/approvals')} className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 shadow-lg shadow-primary/20 border-none cursor-pointer">Launch Queue</button>
                <button className="bg-white text-primary border-2 border-primary/10 px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/5 transition-all border-none cursor-pointer">Review Policy</button>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
