import { Link } from 'react-router-dom';
import { useGetHousesQuery, useGetNeighborhoodTrendsQuery } from '../../store/apiSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

const NEIGHBORHOOD_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzjFyTk-3ZE_6s_Kl9QQ9xIWMogvvxNNP9OEtHpxb9X5FA8A4FvtOaL2RG_BOHtx_Q_KaZwu4xudeE6dB6qwICxbcpmTwpcxrDsCZreDXts_0I_uhXVXat_-pQAnmKcxKC1mHxP-oLcdxYw18xP8aFmHhdGCJlR7JvC0tJgyVIpNJ1zQrpUV4dZEuO9d-mrVhsf2hWf9zcPQciL_ixxYfJQY0500Ub5qy5jreUH87aDsPymPrvF9vY8zswjZNpb7B8eo110y4qCvY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1j_kWQ5mFMPEa2vmszNpiGYMUIHh7iNGm2M79GeKxVGltq3M1krkK5S6Wm1RuJipeuS59l7ICa5PLqPNMUYihK_KmzFOm1Q8tU_n0YSHlFvtDIAj3gJiHHE2q7Gb4z0XXx05RNEBMjw5PBdgoZM3IMBWn3lkp1zSPj3vFpnCr6y4s5j0dj7P57cwjXj7ELgBEE-vzIT55tUcq2o3iIjihErQ1R3NQUClcGezNcZgN9CffWOZ-cOH9F5Y24sWtVzS0WqclRjvDe4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCzgg-nJMpHIT8SIhuw4P-X8tbnroozfj46Yxz1fHmq2G-hGomO2bjF5v1yk0MJD6GMjO3NyO-c8ZDWeMt0_C89vvql62WHOcNI7VvOhnDBoNkW3FnZXOZG6_DQiRASIiY2-i6bi5SGWmzBkaWN2OO65ARB7T1Iwk3umI8aQ3NSZz7xJZu8ntNz1O92ZWWSNHwMH1GDs0vH094EP4Z_B6P0qAZnQJPGvXzaLJThdh2zZN163VkbYXCbghUuJoVcgg9REs-bfRx-KY8',
];

const SPOTLIGHTS = [
  { name: 'Westlands', tag: 'High Growth', tagClass: 'bg-secondary-container text-on-secondary-container', desc: 'The cosmopolitan heart of Nairobi. Modern vertical living meets corporate hubs, driving high rental demand from young professionals.' },
  { name: 'Karen', tag: 'Stable Yield', tagClass: 'bg-primary-container text-white', desc: 'Old-world charm meets modern luxury. Karen remains the gold standard for long-term equity and serene residential estates.' },
  { name: 'Kilimani', tag: 'Emerging Value', tagClass: 'bg-tertiary-fixed-dim text-on-tertiary-fixed', desc: 'Dynamic and dense, Kilimani offers the highest ROI for short-term rental strategies and AirBnB investments.' },
];

export default function MarketInsights() {
  const { data: housesData } = useGetHousesQuery({});
  const { data: trendData } = useGetNeighborhoodTrendsQuery({});
  const houses: any[] = housesData?.items ?? [];

  const neighborhoodData = useMemo(() => {
    if (!trendData) return [];
    const months = Array.from(new Set(trendData.map((d: any) => d.month)));
    return months.map(month => {
      const entry: any = { month };
      trendData.filter((d: any) => d.month === month).forEach((d: any) => {
        entry[d.neighborhood] = Math.round(d.avgRent);
      });
      return entry;
    });
  }, [trendData]);

  const avgRent = houses.length
    ? Math.round(houses.reduce((s: number, h: any) => s + Number(h.monthlyRent), 0) / houses.length)
    : 35000;
  const totalActive = houses.filter((h: any) => h.status === 'active').length;

  return (
    <div className="bg-background text-on-background min-h-screen">
      <main className="max-w-screen-2xl mx-auto py-12 px-6">

        {/* Hero Editorial Header */}
        <header className="ml-[5%] mr-[5%] md:ml-[10%] md:mr-[5%] mb-24">
          <p className="text-primary font-headline font-bold tracking-widest uppercase text-xs mb-4">
            Quarterly Report • 2024
          </p>
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold text-primary tracking-tighter mb-8 leading-[0.9]">
            Market <br />
            <span className="text-outline-variant">Insights.</span>
          </h1>
          <div className="max-w-2xl text-on-surface-variant text-lg leading-relaxed">
            An editorial deep-dive into the shifting landscapes of Nairobi's premium real estate.
            We analyze the intersection of infrastructure growth and rental yield dynamics across
            the city's most coveted zip codes.
          </div>
        </header>

        {/* Bento Grid: Stats */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
          {/* Chart Card */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0px_20px_40px_rgba(25,28,29,0.04)] relative overflow-hidden">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-2xl font-headline font-bold text-primary">Rental Price Trends</h2>
                <p className="text-on-surface-variant text-sm">
                  Average monthly rent — Avg: KES {avgRent.toLocaleString('en-KE')} · Active Listings: {totalActive}
                </p>
              </div>
              <div className="flex gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-full bg-primary inline-block" /> Westlands</span>
                <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-full bg-secondary inline-block" /> Karen</span>
                <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-full bg-tertiary inline-block" /> Kilimani</span>
              </div>
            </div>
            <div className="h-64 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={neighborhoodData.length > 0 ? neighborhoodData : [
                    { month: 'Jan', Westlands: 85000, Karen: 120000, Kilimani: 65000 },
                    { month: 'Feb', Westlands: 82000, Karen: 125000, Kilimani: 68000 },
                  ]}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="Westlands" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Karen" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kilimani" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Side */}
          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="bg-primary text-white p-8 rounded-xl flex-1 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary-container text-4xl">trending_up</span>
              <div>
                <div className="text-4xl font-headline font-extrabold mb-1">+12.4%</div>
                <div className="text-sm opacity-80 uppercase tracking-widest">Yield Increase in Karen</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-xl flex-1 flex flex-col justify-between">
              <div className="text-on-surface-variant font-medium text-sm italic">
                "Westlands continues to dominate the commercial-to-residential transition, seeing a massive
                influx of expatriate demand."
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-outline-variant overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZmXAXIuouQNnRlBnYDG1OoCAw8c3O8OM8ez3LoU8j9q0EV6C9kuXdizGZlB0D3RiNdc-GoQrVmDcFnVsSC0JlM15Vn0L3V2B7nzbtRguBIotRJBFE-to4nkdpqn1SHLZp6Xl6DaD-xzll5NgRIjFHB3waVoSVm5Ao9O3xfM0b7sNplgvoYMF57ewd3k_LU8NhOqSTrMW0hKPXDazlyCkM5AVWVWNnCiRJsneDUK7mPwM8fu4bU_fJI-F3Nogd5S5AT9ltl22NZA"
                    alt="Dr. Elias Mwangi"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">Dr. Elias Mwangi</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">Chief Strategist</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Neighborhood Spotlight */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-outline-variant/10 pb-6">
            <h2 className="text-4xl font-headline font-bold text-primary">Neighborhood Spotlight</h2>
            <Link to="/houses"
              className="text-primary font-bold text-sm flex items-center gap-2 group">
              VIEW ALL DISTRICTS{' '}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {SPOTLIGHTS.map((spot, i) => (
              <div key={spot.name} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-6 relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={NEIGHBORHOOD_IMAGES[i]}
                    alt={spot.name}
                  />
                  <div className={`absolute top-4 left-4 ${spot.tagClass} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                    {spot.tag}
                  </div>
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary mb-2">{spot.name}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{spot.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Strategies */}
        <section className="bg-surface-container-low rounded-3xl p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-container/5 to-transparent" />
          <div className="max-w-4xl relative z-10">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-12">
              Investment Strategies <br />for the Modern Portfolio.
            </h2>
            <div className="space-y-12">
              {[
                { num: "01", title: "The 'Gated' Premium", desc: "Properties within gated communities in Nairobi currently command an 18% premium over standalone builds due to security centralization and shared amenity management." },
                { num: "02", title: "Mixed-Use Advantage", desc: "Focus on 'Live-Work-Play' developments. Integration with retail and office space reduces vacancy rates by an average of 4 months per cycle." },
                { num: "03", title: "Solar Equity", desc: "Energy-independent properties are seeing faster resale value growth. Investing in retrofitted solar capacity adds immediate capital appreciation." },
              ].map((tip) => (
                <div key={tip.num} className="flex gap-8 group">
                  <div className="text-tertiary font-headline font-extrabold text-3xl opacity-30 group-hover:opacity-100 transition-opacity">
                    {tip.num}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary mb-2">{tip.title}</h4>
                    <p className="text-on-surface-variant leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16">
              <Link to="/chatbot"
                className="bg-gradient-to-r from-primary to-primary-container text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all shadow-xl inline-block">
                Ask EstateBot
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant/10 py-16 px-6">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter text-blue-950 font-headline">Modern Estate</div>
          <div className="flex gap-8 text-on-surface-variant text-sm font-medium">
            {['Reports', 'Legals', 'Support', 'Contact'].map((l) => (
              <a key={l} href="#" className="hover:text-primary">{l}</a>
            ))}
          </div>
          <p className="text-xs text-slate-400">© 2024 Modern Estate Insights. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
