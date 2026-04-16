import { useMemo } from 'react';
import { useGetMarketPulseQuery, useGetNeighborhoodTrendsQuery } from '../../store/apiSlice';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function MarketInsights() {
  const { data: pulseData } = useGetMarketPulseQuery({});
  const { data: trendData } = useGetNeighborhoodTrendsQuery({});

  const chartData = useMemo(() => {
    if (!pulseData) return [
      { month: 'Jan', price: 125000 },
      { month: 'Feb', price: 128000 },
      { month: 'Mar', price: 126000 },
      { month: 'Apr', price: 130000 },
      { month: 'May', price: 135000 },
      { month: 'Jun', price: 138000 },
    ];
    return pulseData.map((p: any) => ({
      month: p.month,
      price: Math.round(p.avgRent)
    }));
  }, [pulseData]);

  const trends = trendData || [
    { neighborhood: 'Westlands', trend: '+5.2%', status: 'rising', description: 'High demand for high-rise apartments.' },
    { neighborhood: 'Kilimani', trend: '-2.1%', status: 'cooling', description: 'Increased supply of new luxury lofts.' },
    { neighborhood: 'Karen', trend: '+1.5%', status: 'stable', description: 'Consistent interest in gated communities.' },
    { neighborhood: 'Lavington', trend: '+4.8%', status: 'rising', description: 'Prime location for family villas.' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-left">
      <header>
        <h2 className="text-4xl font-black font-headline tracking-tighter text-primary">Market Intelligence</h2>
        <p className="text-on-surface-variant mt-2 font-medium">Real-time valuation analytics and regional demand trends provided by Savanna Data Labs™.</p>
      </header>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="flex justify-between items-start mb-10">
              <div>
                 <h3 className="text-xl font-black font-headline text-primary">Price Appreciation Index</h3>
                 <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">6-Month Aggregate Performance</p>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black text-secondary">+12.4%</p>
                 <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Year-to-Date</p>
              </div>
           </div>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(val) => `KSh ${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'black', padding: '15px' }}
                    labelStyle={{ color: '#1e293b', marginBottom: '5px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Regional Side Grid */}
        <div className="lg:col-span-4 space-y-6">
           {trends.map((item: any) => (
             <div key={item.neighborhood} className="bg-surface-container-low p-6 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-black font-headline text-primary">{item.neighborhood}</h4>
                   <span className={`text-xs font-black uppercase tracking-widest ${item.status === 'rising' ? 'text-secondary' : item.status === 'cooling' ? 'text-error' : 'text-slate-400'}`}>
                      {item.trend}
                   </span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{item.description}</p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.status === 'rising' ? 'bg-secondary' : item.status === 'cooling' ? 'bg-error' : 'bg-slate-300'}`} 
                        style={{ width: item.status === 'rising' ? '85%' : item.status === 'cooling' ? '35%' : '60%' }}
                      ></div>
                   </div>
                   <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-primary transition-colors">info</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Advisory Section */}
      <section className="bg-primary p-12 rounded-[3rem] text-white relative overflow-hidden">
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-black font-headline tracking-tighter mb-4">Curator's Investment Advisory</h3>
            <p className="text-lg opacity-80 leading-relaxed mb-8">
              Based on your search history for multi-bedroom houses and the current market cooling in Karen, we recommend initiating negotiations for properties in the <span className="underline decoration-secondary decoration-4 underline-offset-4">KSh 120k - 150k</span> range this quarter.
            </p>
            <div className="flex gap-4">
               <button className="bg-secondary text-primary font-black px-6 py-3 rounded-xl hover:scale-105 transition-all text-xs uppercase tracking-[0.2em]">Strategy Chat</button>
               <button className="bg-white/10 text-white border border-white/20 font-black px-6 py-3 rounded-xl hover:bg-white/20 transition-all text-xs uppercase tracking-[0.2em]">Full Report (PDF)</button>
            </div>
         </div>
         {/* Abstract Decors */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-10 rounded-full blur-[100px]"></div>
      </section>
    </div>
  );
}
