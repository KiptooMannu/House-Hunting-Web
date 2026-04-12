import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetHousesQuery } from '../store/apiSlice';
import { formatCurrency, getHouseImage } from '../utils/helpers';

export default function Landing() {
  const navigate = useNavigate();
  
  // Search state
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    houseType: ''
  });

  // Fetch verified houses for the curated collections
  const { data: housesData, isLoading: housesLoading } = useGetHousesQuery({ 
    page: 1, 
    limit: 10,
    approval_status: 'approved'
  });

  const featuredListings = housesData?.items ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.houseType) params.append('houseType', filters.houseType);
    
    navigate(`/houses?${params.toString()}`);
  };

  const budgetOptions = [
    { label: 'Budget Range', min: '', max: '' },
    { label: 'KSh 5M - 15M', min: '5000000', max: '15000000' },
    { label: 'KSh 15M - 50M', min: '15000000', max: '50000000' },
    { label: 'KSh 50M+', min: '50000000', max: '' }
  ];

  const assetClasses = [
    { label: 'Asset Class', value: '' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Mansion', value: 'mansion' },
    { label: 'Penthouse', value: 'penthouse' },
    { label: 'Commercial', value: 'commercial' }
  ];

  return (
    <div className="bg-surface font-body text-on-surface text-left">
      <main className="pt-20">
        {/* Section 1: Hero with Intelligent Search */}
        <section className="relative min-h-[921px] flex flex-col justify-center px-8 lg:px-24 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              alt="Luxury Villa" 
              className="w-full h-full object-cover brightness-[0.7] transition-transform duration-[10s] hover:scale-110" 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl space-y-10">
            <h1 className="font-headline font-extrabold text-6xl lg:text-8xl text-white tracking-tight leading-[1.1] text-left">
              Curating Kenya’s<br/>
              <span className="bg-gradient-to-r from-primary-fixed to-white bg-clip-text text-transparent italic">Finest Estates.</span>
            </h1>
            <p className="text-white/90 text-xl max-w-2xl font-light leading-relaxed text-left border-l-4 border-primary-fixed pl-8">
              A multi-million dollar approach to African real estate. Precision-driven investments for the institutional eye, verified by Savanna Horizon.
            </p>

            {/* Search Banner */}
            <form onSubmit={handleSearch} className="bg-surface-container-lowest/90 backdrop-blur-2xl p-3 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-5xl mt-12 border border-white/20 text-left">
              <div className="w-full md:w-1/3 px-8 py-3 flex items-center gap-4 border-r border-outline-variant/30 text-left">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[10px] uppercase font-black text-outline tracking-widest mb-1">Estate Location</span>
                  <input 
                    className="bg-transparent border-none p-0 focus:ring-0 text-primary font-bold placeholder:text-outline/40 outline-none w-full" 
                    placeholder="Westlands, Nairobi..." 
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/4 px-8 py-3 flex items-center gap-4 border-r border-outline-variant/30 text-left">
                <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[10px] uppercase font-black text-outline tracking-widest mb-1">Budget</span>
                  <select 
                    className="bg-transparent border-none p-0 focus:ring-0 text-primary font-bold cursor-pointer outline-none appearance-none"
                    onChange={(e) => {
                      const opt = budgetOptions.find(o => o.label === e.target.value);
                      if (opt) setFilters({...filters, minPrice: opt.min, maxPrice: opt.max});
                    }}
                  >
                    {budgetOptions.map(opt => (
                      <option key={opt.label} value={opt.label}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full md:w-1/4 px-8 py-3 flex items-center gap-4 text-left">
                <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[10px] uppercase font-black text-outline tracking-widest mb-1">Asset Class</span>
                  <select 
                    className="bg-transparent border-none p-0 focus:ring-0 text-primary font-bold cursor-pointer outline-none appearance-none"
                    value={filters.houseType}
                    onChange={(e) => setFilters({...filters, houseType: e.target.value})}
                  >
                    {assetClasses.map(opt => (
                      <option key={opt.label} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full md:w-auto bg-primary text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-3 shadow-xl hover:scale-105 border-none">
                <span className="material-symbols-outlined">search</span>
                Discover
              </button>
            </form>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50 text-white animate-bounce">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Explore Portfolio</p>
             <span className="material-symbols-outlined">expand_more</span>
          </div>
        </section>

        {/* Section 4: Trust Bar (Compliance & Payments) */}
        <section className="py-16 bg-surface-container-low border-b border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-center items-center gap-16 md:gap-24 text-left">
            <div className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-secondary font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <span className="font-headline font-black text-primary text-sm uppercase tracking-widest">GavaConnect Integrated</span>
            </div>
            <div className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-primary font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              </div>
              <span className="font-headline font-black text-primary text-sm uppercase tracking-widest">KRA Tax Compliant</span>
            </div>
            <div className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity text-left">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-green-600 font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>phonelink_ring</span>
              </div>
              <span className="font-headline font-black text-primary text-sm uppercase tracking-widest text-left">M-Pesa Global Secure</span>
            </div>
          </div>
        </section>

        {/* Section 3: Curated Collections (The Gallery - Wired to DB) */}
        <section className="py-32 px-8 lg:px-24 bg-white text-left">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 text-left">
            <div className="max-w-3xl text-left">
              <span className="text-secondary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Institutional Exclusives</span>
              <h2 className="font-headline text-5xl lg:text-7xl font-extrabold text-primary leading-tight tracking-tighter text-left">Curated High-Value<br/><span className="italic">Collections.</span></h2>
            </div>
            <p className="text-on-surface-variant max-w-sm mb-4 font-medium italic opacity-60 leading-relaxed text-left">
              Each property in this anthology is vetted through a 140-point institutional-grade compliance check by Savanna Horizon.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto text-left">
            {housesLoading ? (
              <div className="col-span-12 py-32 text-center text-primary/20 text-left">
                 <span className="material-symbols-outlined text-6xl animate-spin">autorenew</span>
              </div>
            ) : (
              <>
                {/* Large Featured Card (House 0) */}
                {featuredListings[0] && (
                  <div 
                    onClick={() => navigate(`/houses/${featuredListings[0].houseId}`)}
                    className="md:col-span-8 group cursor-pointer overflow-hidden rounded-[3rem] bg-surface-container-low relative aspect-[16/9] shadow-2xl shadow-primary/10 text-left"
                  >
                    <img 
                      alt={featuredListings[0].title} 
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                      src={getHouseImage(featuredListings[0].images?.[0])}
                    />
                    <div className="absolute top-8 left-8 flex gap-3">
                      <span className="bg-secondary/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Node
                      </span>
                      <span className="bg-primary/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Institutional Grade</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent text-white text-left">
                      <div className="flex justify-between items-end text-left">
                        <div className="text-left">
                          <h3 className="font-headline text-4xl font-black mb-2 tracking-tighter italic">{featuredListings[0].title}</h3>
                          <p className="opacity-80 font-bold text-sm tracking-widest uppercase">{featuredListings[0].location?.town || 'Nairobi'} • {formatCurrency(featuredListings[0].monthlyRent)}/mo</p>
                        </div>
                        <button className="bg-white text-primary w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-primary-fixed hover:-translate-y-1 transition-all shadow-xl group/btn">
                          <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1">arrow_outward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vertical Card (House 1) */}
                {featuredListings[1] && (
                  <div 
                    onClick={() => navigate(`/houses/${featuredListings[1].houseId}`)}
                    className="md:col-span-4 group cursor-pointer overflow-hidden rounded-[3rem] bg-surface-container-low relative aspect-[3/4] shadow-2xl shadow-primary/10 text-left"
                  >
                    <img 
                      alt={featuredListings[1].title} 
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                      src={getHouseImage(featuredListings[1].images?.[0])}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-10 text-white translate-y-4 group-hover:translate-y-0 transition-transform text-left">
                      <h3 className="font-headline text-2xl font-black mb-2 italic tracking-tight">{featuredListings[1].title}</h3>
                      <p className="opacity-70 text-xs font-black uppercase tracking-[0.2em]">{featuredListings[1].location?.town || 'Metropolitan'}</p>
                    </div>
                    <div className="absolute top-8 left-8">
                       <span className="bg-secondary/20 backdrop-blur-xl border border-secondary/30 text-secondary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Asset</span>
                    </div>
                  </div>
                )}

                {/* Remaining Grid Items */}
                {featuredListings.slice(2, 5).map((house: any, idx: number) => (
                  <div 
                    key={house.houseId}
                    onClick={() => navigate(`/houses/${house.houseId}`)}
                    className={`${idx === 2 ? 'md:col-span-8' : 'md:col-span-4'} group cursor-pointer overflow-hidden rounded-[3rem] bg-surface-container-low relative aspect-video shadow-xl text-left`}
                  >
                     <img 
                        alt={house.title} 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                        src={getHouseImage(house.images?.[0])}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-primary/90 to-transparent text-white text-left">
                        <h3 className="font-headline text-xl font-bold italic">{house.title}</h3>
                        <p className="opacity-80 text-xs font-bold uppercase tracking-widest mt-1">{formatCurrency(house.monthlyRent)}</p>
                      </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          <div className="mt-20 flex justify-center">
             <button 
              onClick={() => navigate('/houses')}
              className="px-16 py-6 bg-slate-50 border border-slate-200 rounded-full font-black uppercase tracking-[0.4em] text-[10px] text-primary hover:bg-primary hover:text-white transition-all shadow-xl shadow-slate-200/20"
             >
                Explore Full Anthology
             </button>
          </div>
        </section>

        {/* Section 2: AI Concierge Integration */}
        <section className="py-32 bg-primary overflow-hidden relative text-left">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center text-left">
            <div className="space-y-10 z-10 text-left">
              <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/20">
                <span className="material-symbols-outlined text-sm font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Institutional Intelligence
              </div>
              <h2 className="font-headline text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter text-left">Your Digital<br/><span className="italic opacity-80">Asset Strategist.</span></h2>
              <p className="text-primary-fixed text-xl font-light leading-relaxed max-w-xl text-left">
                Savanna AI isn't just a chatbot—it's a sophisticated data layer that analyzes Nairobi's micro-market trends to suggest properties with the highest ROI potential.
              </p>
              <ul className="space-y-6 text-white/70 font-medium text-left">
                <li className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-secondary-fixed group-hover:scale-125 transition-transform">check_circle</span>
                  <span className="group-hover:text-white transition-colors">Automated GavaConnect documentation checks</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-secondary-fixed group-hover:scale-125 transition-transform">check_circle</span>
                  <span className="group-hover:text-white transition-colors">Real-time valuation comparison in Westlands/Kilimani</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-secondary-fixed group-hover:scale-125 transition-transform">check_circle</span>
                  <span className="group-hover:text-white transition-colors">Direct booking via secure M-Pesa institutional tunnels</span>
                </li>
              </ul>
              <button 
                onClick={() => navigate('/chatbot')}
                className="bg-tertiary hover:bg-tertiary-container text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-black/40 hover:scale-105"
              >
                Summon AI Concierge
              </button>
            </div>
            
            <div className="relative text-left">
              {/* Glassy Chat Interface */}
              <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[4rem] p-10 shadow-2xl relative z-10 space-y-8 max-w-lg mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-700 text-left">
                <div className="flex items-center gap-5 border-b border-white/10 pb-6 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary shadow-lg">
                    <span className="material-symbols-outlined text-3xl">smart_toy</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-bold font-headline italic">Savanna Assistant</h4>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">GavaConnect Integrated Node</p>
                  </div>
                </div>
                <div className="space-y-6 h-80 overflow-y-auto no-scrollbar py-2 text-left">
                  <div className="bg-white/10 p-5 rounded-[2rem] rounded-tl-none border border-white/10 text-white/90 text-sm italic font-medium max-w-[90%] text-left">
                    Greetings. I've analyzed your portfolio architecture. I've isolated 4-bedroom villas in Karen with projected 12.4% YoY capital appreciation. Would you like to review?
                  </div>
                  <div className="bg-primary-fixed p-5 rounded-[2rem] rounded-tr-none text-primary font-bold text-sm max-w-[85%] ml-auto shadow-xl text-left">
                    Yes. Priority for GavaConnect verified titles and M-Pesa enabled reservation.
                  </div>
                  <div className="bg-white/10 p-5 rounded-[2rem] rounded-tl-none border border-white/10 text-white/90 text-sm italic font-medium max-w-[90%] text-left">
                    Analysis complete. Found 2 matches within the Savanna High-Value Anthology. Documentation nodes are healthy.
                  </div>
                </div>
                <div className="bg-white/5 rounded-full px-8 py-4 border border-white/10 flex items-center justify-between group cursor-text">
                  <span className="text-white/30 text-sm italic font-medium">Analyze market capital flows...</span>
                  <span className="material-symbols-outlined text-white/60 group-hover:text-white transition-colors">send</span>
                </div>
              </div>
              {/* Decorative shapes */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary/30 blur-[120px] rounded-full animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-tertiary/20 blur-[150px] rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Section 5 & 9: Investment Pulse & Map */}
        <section className="py-32 px-8 lg:px-24 bg-surface text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-stretch text-left">
            <div className="lg:col-span-12 mb-10 text-left">
               <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] block mb-4">Regional Intelligence</span>
               <h2 className="font-headline text-5xl lg:text-7xl font-extrabold text-primary tracking-tighter text-left italic">Neighbourhood Spotlight.</h2>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-between space-y-12 text-left">
              <div className="text-left">
                <p className="text-on-surface-variant leading-relaxed text-lg font-light italic">Strategic data visualization showing the shift in capital within Nairobi's top-tier residential and commercial nodes. Click a node to view assets in that sector.</p>
              </div>
              <div className="space-y-10 text-left">
                {[
                  { region: 'Westlands (Commercial Hub)', growth: '+18.2%', width: '85%', town: 'Westlands' },
                  { region: 'Kilimani (Residential Rise)', growth: '+11.5%', width: '65%', town: 'Kilimani' },
                  { region: 'Karen (Land Valuation)', growth: '+14.9%', width: '75%', town: 'Karen' }
                ].map(item => (
                  <div 
                    key={item.region} 
                    onClick={() => navigate(`/houses?location=${item.town}`)}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all text-left"
                  >
                    <div className="flex justify-between items-center mb-4 text-left">
                      <div className="text-left">
                        <span className="font-black text-primary uppercase tracking-widest text-[10px] block mb-1">{item.region}</span>
                        <p className="text-[10px] font-bold text-slate-400">View Node Anthology</p>
                      </div>
                      <span className="text-secondary font-black text-sm">{item.growth}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: item.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 rounded-[4rem] overflow-hidden relative shadow-3xl group border-8 border-white text-left min-h-[600px] cursor-pointer" onClick={() => navigate('/houses?location=Westlands')}>
              <div className="absolute inset-0 bg-slate-900 text-left">
                <img 
                  alt="Nairobi Growth Map" 
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[3s]" 
                  src="https://images.unsplash.com/photo-1541339902099-13d4429e5a7b?auto=format&fit=crop&q=80"
                />
              </div>
              <div className="absolute top-12 left-12 bg-primary/95 backdrop-blur-xl p-8 rounded-[2.5rem] text-white max-w-xs border border-white/10 shadow-2xl text-left">
                <h4 className="font-headline font-black text-xl mb-4 flex items-center gap-3 text-left">
                  <span className="w-4 h-4 bg-secondary rounded-full animate-ping"></span>
                  Node: Westlands
                </h4>
                <p className="text-xs text-white/70 leading-relaxed font-medium italic text-left">Projected 2025 boom due to global multinational HQ migrations and infrastructure expansion. Capital flows currently weighting +14.2% higher than Q2.</p>
              </div>
              <div className="absolute bottom-12 right-12 text-left">
                <button 
                  onClick={() => navigate('/insights')}
                  className="bg-white text-primary px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-3 hover:translate-x-2 transition-all border-none"
                >
                  <span className="material-symbols-outlined">map</span>
                  Enter Interactive Pulse
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: The 'Legacy' Journey */}
        <section className="py-32 bg-white text-left">
          <div className="max-w-5xl mx-auto px-8 text-center space-y-24 text-left">
            <h2 className="font-headline text-5xl font-extrabold text-primary italic tracking-tighter text-left">The Legacy Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative text-left">
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              
              <div className="relative flex flex-col items-center gap-8 group text-left">
                <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl">travel_explore</span>
                </div>
                <div className="text-left">
                  <h4 className="font-headline font-black text-xl mb-3 text-primary text-left italic">Guided Discovery</h4>
                  <p className="text-on-surface-variant text-sm px-4 font-medium opacity-60 leading-relaxed text-left italic">AI-powered property sourcing matched to your high-value institutional criteria by Savanna Horizon.</p>
                </div>
              </div>
              
              <div className="relative flex flex-col items-center gap-8 group text-left">
                <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center text-white shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl font-variation-fill">history_edu</span>
                </div>
                <div className="text-left">
                  <h4 className="font-headline font-black text-xl mb-3 text-primary text-left italic">Legal Fortification</h4>
                  <p className="text-on-surface-variant text-sm px-4 font-medium opacity-60 leading-relaxed text-left italic">Seamless verification through official GavaConnect protocols and local land registry integration.</p>
                </div>
              </div>
              
              <div className="relative flex flex-col items-center gap-8 group text-left">
                <div className="w-24 h-24 rounded-[2rem] bg-tertiary flex items-center justify-center text-white shadow-2xl relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl">currency_exchange</span>
                </div>
                <div className="text-left">
                  <h4 className="font-headline font-black text-xl mb-3 text-primary text-left italic">M-Pesa Booking</h4>
                  <p className="text-on-surface-variant text-sm px-4 font-medium opacity-60 leading-relaxed text-left italic">Secure institutional escrow payments handled via Safaricom's verified GavaPay portal.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Testimonials */}
        <section className="py-32 px-8 lg:px-24 bg-surface-container-low border-y border-outline-variant/10 text-left">
          <div className="max-w-[1440px] mx-auto text-left">
            <h2 className="font-headline text-5xl lg:text-7xl font-extrabold text-primary text-center mb-32 tracking-tighter italic">Voice of the Investors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
              {[
                { 
                  quote: "Savanna Horizon transformed our approach to Nairobi's high-end residential market. Their compliance-first model is truly world-class.", 
                  author: "Dr. Alistair M.", 
                  role: "Heritage Equity Fund", 
                  style: "bg-white",
                  img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80"
                },
                { 
                  quote: "The integration with GavaConnect and the AI Concierge saved our legal team weeks of due diligence. Frictionless acquisition at its best.", 
                  author: "Sarah Wanjiru", 
                  role: "Institutional Landlord", 
                  style: "bg-primary text-white transform -translate-y-8 shadow-2xl shadow-primary/30",
                  img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"
                },
                { 
                  quote: "Unparalleled insights. Their Investment Pulse module predicted the Westlands surge before it hit the mainstream headlines.", 
                  author: "Kevin O.", 
                  role: "Horizon Private Office", 
                  style: "bg-white",
                  img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
                }
              ].map((t, idx) => (
                <div key={idx} className={`${t.style} p-12 rounded-[3.5rem] shadow-sm border border-outline-variant/10 flex flex-col justify-between gap-12 text-left`}>
                  <div className="text-left">
                    <span className={`material-symbols-outlined text-6xl opacity-10 ${t.style.includes('primary') ? 'text-white' : 'text-primary'}`}>format_quote</span>
                    <p className={`text-xl italic font-medium leading-relaxed mt-6 ${t.style.includes('primary') ? 'text-white/90' : 'text-on-surface-variant'}`}>"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-5 text-left">
                    <img alt={t.author} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white/20" src={t.img} />
                    <div className="text-left">
                      <h5 className={`font-black font-headline ${t.style.includes('primary') ? 'text-white' : 'text-primary'}`}>{t.author}</h5>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${t.style.includes('primary') ? 'text-white/40' : 'text-outline'}`}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: Institutional Partners */}
        <section className="py-24 bg-white text-left">
          <div className="max-w-7xl mx-auto px-8 text-center text-left">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-outline mb-16 italic">Consolidated Ecosystem</p>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
              <span className="font-headline font-black text-3xl tracking-tighter text-primary">GAVACONNECT</span>
              <span className="font-headline font-black text-3xl tracking-tighter text-primary">SAFARICOM</span>
              <span className="font-headline font-black text-3xl tracking-tighter text-primary">K.R.A</span>
              <span className="font-headline font-black text-3xl tracking-tighter text-primary">MPESA GLOBAL</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
