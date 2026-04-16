import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandlordOnboarding() {
  const navigate = useNavigate();

  return (
    <main className="bg-surface font-body text-on-surface min-h-screen antialiased overflow-x-hidden">
      {/* Hero Section with Asymmetric Layout */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 lg:pr-12 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-black uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            Verified Landlord Program
          </div>
          <h1 className="text-5xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tighter font-headline">
            Grow Your Property Portfolio <br/>
            <span className="text-secondary">with Authority.</span>
          </h1>
          
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] space-y-4 max-w-2xl border border-white shadow-xl shadow-primary/5">
            <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
              To list a property, you'll need an Elite Curator account to access our management tools and <span className="text-primary font-black underline decoration-primary/20 underline-offset-8">GavaConnect</span> tax integration.
            </p>
            <p className="text-on-surface-variant/60 italic font-medium">
              "Our verified status ensures a secure ecosystem for Kenya's premium real estate market."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Button 
                onClick={() => navigate('/register?role=landlord')}
                className="px-10 py-8 bg-primary hover:bg-primary-container text-white rounded-full font-black text-lg shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 border-none transform hover:scale-105 active:scale-95"
            >
              Register as a Landlord
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
            <Button 
                variant="ghost"
                onClick={() => navigate('/login?message=landlord_required')}
                className="px-10 py-8 text-primary font-black text-lg hover:bg-surface-container-high rounded-full transition-all flex items-center justify-center gap-2"
            >
              Existing Landlord? <span className="underline decoration-2 underline-offset-4">Login here</span>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] transform rotate-2 hover:rotate-0 transition-transform duration-700 border-[12px] border-white">
            <img 
                className="w-full h-[650px] object-cover" 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
                alt="Modern luxury Kenyan villa" 
            />
          </div>
          
          {/* M-Pesa Floating Badge */}
          <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl max-w-xs hidden md:block border border-slate-50 animate-bounce-slow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined font-black">payments</span>
              </div>
              <span className="font-black text-primary uppercase tracking-widest text-xs">M-Pesa Payouts</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-bold">Instant, secure settlements directly to your business till or phone.</p>
          </div>
        </div>
      </section>

      {/* Benefits Grid (Bento Style) */}
      <section className="bg-surface-container-low py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl lg:text-6xl font-black text-primary mb-6 tracking-tighter font-headline">Why partner with us?</h2>
            <p className="text-on-surface-variant max-w-xl font-medium text-lg leading-relaxed">Join a network of over 500 premium property owners across Nairobi and the coast.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* GavaConnect Card */}
            <div className="md:col-span-8 bg-white p-12 rounded-[2.5rem] flex flex-col justify-between border-b-8 border-secondary shadow-xl shadow-primary/5 group">
              <div className="max-w-2xl">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 text-secondary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                </div>
                <h3 className="text-3xl font-black text-primary mb-6 font-headline tracking-tighter">GavaConnect Compliance</h3>
                <p className="text-on-surface-variant leading-relaxed text-lg font-medium">
                  Automated tax reporting and compliance integration. We handle the paperwork with government systems so you can focus on scaling your investments. 
                  Our digital bridge ensures every transaction is pre-validated for KRA compliance.
                </p>
              </div>
              <div className="mt-12 flex gap-4 overflow-hidden">
                <div className="h-2 bg-secondary/10 w-full rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* M-Pesa Card */}
            <div className="md:col-span-4 bg-primary p-12 rounded-[2.5rem] text-on-primary flex flex-col justify-between shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-4xl text-white">phone_iphone</span>
                </div>
                <h3 className="text-3xl font-black mb-6 font-headline tracking-tighter">M-Pesa Ecosystem</h3>
                <p className="text-white/80 leading-relaxed font-medium">
                  Integrated rent collection through Safaricom's leading mobile platform for seamless tenant transactions.
                </p>
              </div>
              <div className="mt-12 relative z-10">
                <span className="text-3xl font-black tracking-tighter opacity-30 select-none">LIPA NA M-PESA</span>
              </div>
            </div>

            {/* Management Tools */}
            <div className="md:col-span-4 bg-white p-12 rounded-[2.5rem] flex flex-col justify-between shadow-xl shadow-primary/5 border border-slate-50 border-t-8 border-tertiary">
              <div>
                <div className="w-16 h-16 bg-tertiary-fixed rounded-2xl flex items-center justify-center mb-8 text-on-tertiary-fixed">
                  <span className="material-symbols-outlined text-4xl">dashboard</span>
                </div>
                <h3 className="text-2xl font-black text-primary mb-6 font-headline tracking-tighter">Advanced Analytics</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  Full analytics dashboard, tenant screening, and maintenance tracking in one editorial interface.
                </p>
              </div>
            </div>

            {/* Concierge */}
            <div className="md:col-span-8 bg-surface-container-highest p-12 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between overflow-hidden relative shadow-inner">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent"></div>
              <div className="max-w-md relative z-10 text-left">
                <h3 className="text-3xl font-black text-primary mb-6 font-headline tracking-tighter">24/7 Concierge Support</h3>
                <p className="text-on-surface-variant leading-relaxed text-lg font-medium">
                  Dedicated account managers help you optimize listing performance, dynamic pricing strategies, and tenant retention.
                </p>
              </div>
              <div className="hidden lg:block relative z-10 mt-8 lg:mt-0">
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-xl transform hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-primary text-4xl">support_agent</span>
                  </div>
                  <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center shadow-xl transform -rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-4xl">headset_mic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="bg-primary/5 p-16 lg:p-32 rounded-[4rem] relative overflow-hidden border border-primary/10">
          <div className="absolute top-0 right-0 p-16 opacity-5">
            <span className="material-symbols-outlined text-[15rem]">domain</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-primary mb-12 max-w-4xl mx-auto leading-tight font-headline tracking-tighter">
            Ready to showcase your property to elite seekers?
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Button 
                onClick={() => navigate('/register?role=landlord')}
                className="px-16 py-10 bg-primary hover:bg-primary-container text-white rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/30 border-none"
            >
              Start Onboarding
            </Button>
            <Link to="#" className="text-primary font-black text-lg hover:underline decoration-4 underline-offset-8 flex items-center gap-2">
                Download Brochure <span className="material-symbols-outlined">download</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Onboarding Assistant (Floating) */}
      <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in zoom-in duration-500 delay-1000">
        <button className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] rounded-br-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white flex items-center gap-6 text-primary font-black hover:bg-white transition-all transform hover:-translate-y-2">
          <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 leading-none mb-1">Elite Guide</p>
            <span className="text-lg tracking-tighter">Assistant Curator</span>
          </div>
        </button>
      </div>
    </main>
  );
}
