import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function Landing() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      navigate(`/houses?location=${encodeURIComponent(searchLocation)}`);
    } else {
      navigate('/houses');
    }
  };

  const featuredProperties = [
    {
      id: 1,
      title: 'Obsidian Loft',
      price: '45M',
      beds: 3,
      baths: 2,
      sqft: '2,400',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZzq_Nh5HE6QEct7qCeDpTCwYSEkTZim_nmy39rFnOcI7I7GnYdAARDk1H7oSEqEvqkShe6bA4eucLLZJnU8TXsCwdXF7okzgj3hRA3qusqfWiiYCYLCfFubAjZOuOzMXbJuwcFbwV_fx_c2qPBQuI4MHo6t7MBji_9zLNOgzS8ZaesfyxVATcPx3F5D3zXA8VDrhjOXa6TUYanFnUV0YLCPD5P8izsMMqtr_3zjEM3ahoYltEGg_wVf5HX_Cytlx3CV0mV-x6Aqc'
    },
    {
      id: 2,
      title: 'Emerald Oasis',
      price: '120M',
      beds: 5,
      baths: 4,
      sqft: '6,800',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT2IqJG6EeRgv8WWJsaowCabCEZpYL7S-Hzj4umlB2CxFOqcBqjEhXW5VRYfly2RZQFBb89xowzPo6a81JBGJOEtZc9Gp2WrcWbAp7q1W0eHIN1W5Tqd--1k33l-m6k9kH-5Ylr4JPDvHv1txjnf_Hsj8fNu9j2eQUKfWJtmqxb1sPLzmz4FhKhsQ191rYknBe-Rr036-XxGvXVMLZvReY7laKa2yWaXp9KDQwN_FlLcvgfgxqlZwd9qo8WfpFoTJdc9TpC4zQlS0'
    },
    {
      id: 3,
      title: 'Ivory Terrace',
      price: '32M',
      beds: 2,
      baths: 2,
      sqft: '1,850',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7CGSXrwyNxFtftPEXnA0akdWg-J_CEmRy8W-r4CZE8cYJcORhfLBTEZ9Lu7RtZETXOKwbHjuJjBDLPdlCuSSkWh5m2gyNp3uUxf0VgEr3ttOMMsZXP1EslqAHhTH7NoKKynhMAUwMBTdoT1PP_ICsL7l_OkQOrAkhvUfRqs7wt-lkDFwW6x5GpYy2foXRW2ihmoB92hqS7niAOdgajjZQsAhb0KLIn7i67VgmTGdtxLstDDRWXOxOHUkFgAkBW73up7VcbVTKIAU'
    }
  ];

  return (
    <main className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed pt-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center px-8 lg:px-24 bg-surface overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-12 items-center w-full max-w-screen-2xl mx-auto">
          <div className="lg:col-span-12 xl:col-span-7 z-10 text-left">
            <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-primary leading-[0.9] mb-8">
              The Future of <br/>
              <span className="text-secondary bg-secondary-container px-4 rounded-3xl inline-block mt-4 md:mt-0">Quiet Authority.</span>
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl mb-12 leading-relaxed font-medium">
              Curated real estate for the discerning visionary. We treat every listing as a masterpiece and every transaction as a partnership in growth.
            </p>

            {/* Integrated Search Bar */}
            <form onSubmit={handleSearch} className="bg-white p-3 rounded-[3rem] shadow-[0_20px_40px_rgba(25,28,29,0.06)] flex flex-col md:flex-row items-center gap-2 max-w-4xl border border-slate-100">
              <div className="flex items-center flex-1 px-8 py-4 gap-4 w-full">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-slate-400 font-bold text-lg" 
                  placeholder="Location (e.g. Karen, Westlands)" 
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
              <div className="flex items-center px-8 py-4 gap-4 w-full md:w-auto">
                <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                <select className="bg-transparent border-none focus:ring-0 text-on-surface cursor-pointer font-bold appearance-none">
                  <option>Any Price</option>
                  <option>KSh 10M - 50M</option>
                  <option>KSh 50M - 150M</option>
                  <option>KSh 150M+</option>
                </select>
              </div>
              <button type="submit" className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-full font-black text-lg hover:bg-primary-container transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transform active:scale-95 border-none">
                <span className="material-symbols-outlined font-bold">search</span> Search
              </button>
            </form>

            <div className="mt-12 flex items-center gap-4">
              <button 
                onClick={() => navigate('/register?role=landlord')}
                className="text-tertiary font-black flex items-center gap-3 group text-sm uppercase tracking-widest border-none bg-transparent"
              >
                Register as a Landlord 
                <span className="material-symbols-outlined group-hover:translate-x-3 transition-transform text-xl">arrow_right_alt</span>
              </button>
            </div>
          </div>

          <div className="xl:col-span-5 relative h-[700px] hidden xl:block">
            <div className="absolute inset-0 bg-secondary-container/20 rounded-[4rem] -rotate-3 border border-secondary/10"></div>
            <img 
              alt="Modern architectural villa" 
              className="w-full h-full object-cover rounded-[4rem] shadow-2xl relative z-10 border-8 border-white" 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
            />
            {/* Floating Info Tag */}
            <div className="absolute -left-12 bottom-20 z-20 bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">stars</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Elite Signature</p>
                <p className="text-xl font-black text-primary font-headline">Karen Estate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Residences */}
      <section className="py-32 px-8 bg-surface-container-low/50">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="text-left">
              <span className="text-secondary font-black tracking-[0.4em] uppercase text-xs mb-4 block">Curated Collection</span>
              <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter">Featured Residences.</h2>
              <div className="h-2 w-32 bg-secondary mt-6 rounded-full"></div>
            </div>
            <button 
              onClick={() => navigate('/houses')}
              className="text-primary font-black text-sm uppercase tracking-widest flex items-center gap-4 group border-none bg-transparent"
            >
              Explore All Estates 
              <span className="material-symbols-outlined group-hover:rotate-45 transition-transform text-2xl">north_east</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredProperties.map((prop) => (
              <div key={prop.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.04)] group transition-all hover:-translate-y-4 hover:shadow-2xl border border-slate-100/50">
                <div className="h-96 relative overflow-hidden">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-secondary/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-none">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified
                    </Badge>
                  </div>
                </div>
                <div className="p-10 text-left">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-headline text-3xl font-black text-primary tracking-tighter">{prop.title}</h3>
                    <p className="text-secondary font-black text-2xl font-headline tracking-tighter">KSh {prop.price}</p>
                  </div>
                  <div className="flex gap-6 mb-10 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xl">bed</span> {prop.beds}</span>
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xl">bathtub</span> {prop.baths}</span>
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xl">square_foot</span> {prop.sqft}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/houses/${prop.id}`)}
                    className="w-full py-6 rounded-full border-2 border-primary text-primary font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-3 bg-transparent"
                  >
                    View Experience <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Insight */}
      <section className="py-32 px-8 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="text-left">
            <span className="text-secondary font-black tracking-[0.4em] uppercase text-xs mb-6 block">Intelligence Driven</span>
            <h2 className="font-headline text-5xl md:text-7xl font-black text-primary mb-12 leading-[0.95] tracking-tighter">Curated Service,<br/>Powered by Intel.</h2>
            
            <div className="space-y-12 relative">
              <div className="absolute left-7 top-4 bottom-4 w-px bg-slate-200"></div>
              {[
                { step: '01', title: 'Discovery', desc: 'Our AI learns your lifestyle preferences, investment goals, and architectural tastes through intuitive conversation.', color: 'bg-primary' },
                { step: '02', title: 'Match', desc: "Real-time matching against thousands of off-market and verified listings to find your 'Impossible' home.", color: 'bg-secondary' },
                { step: '03', title: 'Acquisition', desc: 'Smart contract facilitation and concierge-led negotiation to secure the best possible terms.', color: 'bg-tertiary' }
              ].map((item, idx) => (
                <div key={idx} className="relative flex gap-10 group">
                  <div className={`z-10 w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center font-black text-lg shadow-xl shadow-slate-100 transition-transform group-hover:scale-110`}>
                    {item.step}
                  </div>
                  <div className="flex-1 border-b border-slate-100 pb-10">
                    <h4 className="text-2xl font-black text-primary font-headline mb-3 tracking-tight">{item.title}</h4>
                    <p className="text-on-surface-variant leading-relaxed text-lg font-medium opacity-80">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/50 relative z-10 text-left">
              <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">smart_toy</span>
                </div>
                <div>
                  <h5 className="font-black text-primary text-xl font-headline tracking-tighter leading-none">Savanna AI Concierge</h5>
                  <p className="text-[10px] text-secondary font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Ready to Assist
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 text-primary p-6 rounded-[2rem] rounded-bl-none max-w-[85%] font-bold text-lg leading-snug shadow-inner">
                  "I've identified a penthouse in Kilimani that exceeds your rental yield requirements by 12%. Shall I arrange a priority tour?"
                </div>
                <div className="bg-primary text-white p-6 rounded-[2rem] rounded-br-none max-w-[85%] ml-auto font-bold text-lg leading-snug shadow-2xl">
                  "Yes, please verify the GavaConnect documentation first."
                </div>
                <div className="bg-slate-50 text-secondary p-6 rounded-[2rem] rounded-bl-none max-w-[85%] font-black text-lg border border-secondary/10">
                  "Verification Complete. Title is clear. Booking link generated."
                </div>
              </div>
            </div>
            {/* Animated Glow Elements */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] delay-700 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-8 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto text-center mb-24">
          <span className="text-secondary font-black tracking-[0.4em] uppercase text-xs mb-6 block">Voices of Distinction</span>
          <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter">Trusted by Visionaries.</h2>
        </div>
        <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-12">
          {[
            { 
              name: 'Wanjiru Kamau', 
              role: 'Real Estate Investor', 
              img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
              quote: "The GavaConnect integration for title verification gave me peace of mind I've never had with other agencies. Savanna Horizon is the gold standard for luxury property.",
              source: 'GavaConnect Verified'
            },
            { 
              name: 'David Mutua', 
              role: 'Homeowner, Karen', 
              img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
              quote: "Selling my property through their AI-driven match system was seamless. I loved the instant M-Pesa alerts for every milestone. Truly modern service.",
              source: 'M-PESA Integrated'
            }
          ].map((test, idx) => (
            <div key={idx} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col items-start text-left">
              <div className="flex items-center gap-6 mb-10">
                <img src={test.img} alt={test.name} className="w-20 h-20 rounded-[2rem] object-cover shadow-2xl" />
                <div>
                  <h4 className="font-black text-primary text-2xl font-headline tracking-tighter">{test.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{test.role}</p>
                </div>
              </div>
              <p className="text-on-surface-variant italic text-xl font-medium leading-relaxed mb-10 opacity-80">"{test.quote}"</p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50 w-full opacity-40">
                <span className="text-[10px] font-black tracking-widest uppercase">Verified via {test.source}</span>
                <div className="h-4 w-px bg-slate-200"></div>
                <span className="material-symbols-outlined text-sm">verified</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-screen-2xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,52,97,0.3)]">
          <div className="relative z-10">
            <h2 className="font-headline text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">Ready to find your <br/>perfect space?</h2>
            <p className="text-primary-fixed text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-medium opacity-90">Join the exclusive network of property owners and seekers redefining the Kenyan horizon.</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <button 
                onClick={() => navigate('/houses')}
                className="px-16 py-6 bg-secondary text-white font-black rounded-full hover:scale-110 transition-all text-xl shadow-2xl shadow-secondary/20 border-none"
              >
                Get Started
              </button>
              <button 
                onClick={() => navigate('/register?role=landlord')}
                className="px-16 py-6 bg-white/10 text-white font-black rounded-full hover:bg-white/20 backdrop-blur-xl transition-all border-2 border-white/20 text-xl"
              >
                Register Property
              </button>
            </div>
          </div>
          {/* Abstract Design Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[150px]"></div>
        </div>
      </section>
    </main>
  );
}
