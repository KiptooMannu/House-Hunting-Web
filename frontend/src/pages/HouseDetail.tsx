import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import type { RootState } from '../store';
import { useGetHouseByIdQuery } from '../store/apiSlice';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const houseId = id ? parseInt(id) : null;
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const defaultBookingDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const { data: houseData, isLoading: loading, error: fetchError } = useGetHouseByIdQuery(houseId, { skip: !houseId });
  const { user } = useSelector((state: RootState) => state.auth);

  const house = houseData;
  const [bookingDate, setBookingDate] = useState(defaultBookingDate);
  const [checkoutDate, setCheckoutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });

  const stayDuration = useMemo(() => {
    const start = new Date(bookingDate);
    const end = new Date(checkoutDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [bookingDate, checkoutDate]);

  if (loading) return <LoadingSpinner text="Consulting the Curator..." />;
  
  if (fetchError) return <div className="min-h-screen p-16 mt-16 text-center text-error font-bold">Failed to load property details.</div>;
  if (!house) return <div className="min-h-screen p-16 mt-16 text-center text-on-surface-variant font-bold">Property not found.</div>;

  const dailyRate = house.dailyRate && Number(house.dailyRate) > 0 ? Number(house.dailyRate) : (Number(house.monthlyRent) / 30);
  const totalPrice = stayDuration * dailyRate;

  const handleProceedToBooking = () => {
    if (!user) {
        navigate('/login');
        return;
    }
    navigate(`/book/${house.houseId}`, { 
      state: { 
        startDate: bookingDate, 
        endDate: checkoutDate, 
        totalPrice, 
        stayDuration, 
        dailyRate 
      } 
    });
  };

  return (
    <main className="bg-surface text-on-surface selection:bg-primary-fixed antialiased pt-20">
      {/* Editorial Hero Section */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[716px]">
          {/* Main Hero Snap */}
          <div className="md:col-span-8 relative overflow-hidden rounded-2xl md:rounded-3xl group border border-slate-200 shadow-sm aspect-video md:aspect-auto">
            <img 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              src={house.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"} 
              alt={house.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12 text-left">
              <div className="mb-4">
                <Badge className="bg-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex w-fit items-center gap-2 border-none shadow-xl">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Listing
                </Badge>
              </div>
              <h1 className="text-white text-3xl md:text-6xl font-black font-headline tracking-tighter mb-2 leading-none">{house.title}</h1>
              <p className="text-white/90 text-sm md:text-2xl font-medium font-manrope">{house.location?.county || house.location?.town || 'Nairobi'}, Kenya</p>
            </div>
          </div>

          {/* Secondary Snaps */}
          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-4">
            <div className="flex-1 rounded-2xl md:rounded-3xl overflow-hidden group border border-slate-200 relative aspect-video md:aspect-auto">
              <img 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                src={house.images?.[1]?.imageUrl || house.images?.[0]?.imageUrl} 
                alt="Detail 1"
              />
            </div>
            <div className="flex-1 rounded-2xl md:rounded-3xl overflow-hidden relative group border border-slate-200 aspect-video md:aspect-auto">
              <img 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                src={house.images?.[2]?.imageUrl || house.images?.[0]?.imageUrl} 
                alt="Detail 2"
              />
              <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogTrigger asChild>
                  <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/90 backdrop-blur px-6 md:px-8 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 shadow-2xl hover:bg-white transition-all transform active:scale-95 z-10">
                    <span className="material-symbols-outlined text-base md:text-lg">grid_view</span>
                    View All {house.images?.length || 0}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-none p-10 rounded-[3rem] shadow-2xl font-manrope">
                  <DialogHeader className="mb-12">
                    <DialogTitle className="text-4xl font-black text-primary tracking-tighter flex items-center gap-4">
                      <span className="material-symbols-outlined text-3xl">luxury_residences</span>
                      The Complete Gallery
                    </DialogTitle>
                    <p className="text-on-surface-variant font-bold text-xs uppercase tracking-[0.3em] opacity-60">Curated by EstateCurator Premium</p>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {house.images?.map((img: any, idx: number) => (
                      <div key={idx} className="group relative aspect-square rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full">
                        <img 
                          src={img.imageUrl} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={img.caption || `House snapshot ${idx + 1}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                          <p className="text-white text-xs font-black uppercase tracking-widest">{img.caption || `Perspective ${idx + 1}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="max-w-screen-2xl mx-auto px-8 mt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Content */}
        <div className="col-span-1 lg:col-span-8 text-left">
          {/* Key Stats Bar */}
          <div className="bg-surface-container-low p-10 rounded-[2.5rem] flex flex-wrap justify-between items-center mb-16 shadow-inner border border-slate-100">
            <div className="flex flex-col mb-4 md:mb-0">
              <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Valuation</span>
              <span className="text-4xl font-black text-primary tracking-tighter font-headline">{formatCurrency(house.monthlyRent)}<span className="text-sm font-medium ml-1">/mo</span></span>
            </div>
            <div className="hidden md:block h-16 w-px bg-outline-variant/30 mx-8"></div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">bed</span>
              <div className="flex flex-col">
                <span className="font-black text-2xl font-headline leading-none">{house.bedrooms}</span>
                <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-60">Beds</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">bathtub</span>
              <div className="flex flex-col">
                <span className="font-black text-2xl font-headline leading-none">{house.bathrooms}</span>
                <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-60">Baths</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">square_foot</span>
              <div className="flex flex-col">
                <span className="font-black text-2xl font-headline leading-none">{house.square_footage || '2,400'}</span>
                <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-60">SQFT</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-8 mb-20">
            <h2 className="text-4xl font-black tracking-tight text-primary font-headline leading-tight">Modern Architecture & <br/>Premium Finishes.</h2>
            <div className="prose prose-slate max-w-none text-on-surface-variant text-lg leading-relaxed font-body">
              <p className="border-l-4 border-primary/20 pl-8 text-xl font-medium text-primary/80">
                {house.description || 'This masterclass in contemporary urban design redefines luxury through its dramatic use of dark textures and natural light.'}
              </p>
              <p className="mt-6">
                Featuring expansive double-height ceilings and bespoke industrial-chic elements, this property offers an unparalleled sense of volume and curated luxury.
              </p>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="mb-20">
            <h3 className="text-[11px] font-black mb-10 uppercase tracking-[0.3em] text-on-surface-variant opacity-60">Exceptional Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: '24/7 Elite Security', icon: 'security' },
                { name: 'Private Rooftop Garden', icon: 'eco' },
                { name: 'Integrated Smart Tech', icon: 'smart_toy' },
                { name: 'Infinity Edge Pool', icon: 'pool' }
              ].map((amenity, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] flex items-center gap-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {amenity.icon}
                    </span>
                  </div>
                  <span className="font-black text-primary font-headline text-lg">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood */}
          <div className="mb-20">
            <h3 className="text-[11px] font-black mb-10 uppercase tracking-[0.3em] text-on-surface-variant opacity-60">Neighborhood Insights: {house.location?.county || 'Riverside'}</h3>
            <div className="rounded-[3rem] overflow-hidden h-[500px] relative group shadow-2xl border-8 border-white ring-1 ring-slate-200">
              <img 
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-1000" 
                src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80" 
                alt="Map Visualization"
              />
              <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl max-w-xs border border-slate-100">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 border-b border-primary/10 pb-4">Local Highlights</p>
                <ul className="space-y-5">
                  <li className="text-sm font-bold flex items-center gap-4 text-on-surface-variant group"><span className="w-2.5 h-2.5 rounded-full bg-secondary group-hover:scale-150 transition-transform"></span> Westlands Core (5 min)</li>
                  <li className="text-sm font-bold flex items-center gap-4 text-on-surface-variant group"><span className="w-2.5 h-2.5 rounded-full bg-secondary group-hover:scale-150 transition-transform"></span> Arboretum Forest (10 min)</li>
                  <li className="text-sm font-bold flex items-center gap-4 text-on-surface-variant group"><span className="w-2.5 h-2.5 rounded-full bg-secondary group-hover:scale-150 transition-transform"></span> Diplomatic Enclave</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="col-span-1 lg:col-span-4">
          <div className="sticky top-28 bg-white p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 text-left">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h4 className="text-3xl font-black text-primary font-headline tracking-tighter leading-tight">Secure Viewing</h4>
                <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mt-2 opacity-60">Premium Reservation</p>
              </div>
              <Badge className="bg-tertiary-fixed px-4 py-2 rounded-full text-[10px] font-black text-tertiary uppercase tracking-widest border-none">Hot Property</Badge>
            </div>

            <div className="space-y-6 mb-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Check-in Period</label>
                <div className="relative group">
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-[1.5rem] py-8 px-8 font-black text-primary text-sm focus:ring-4 focus:ring-primary/5 shadow-inner transition-all"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={defaultBookingDate}
                  />
                  <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-primary/30 group-hover:text-primary transition-colors">calendar_today</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Check-out Period</label>
                <div className="relative group">
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-[1.5rem] py-8 px-8 font-black text-primary text-sm focus:ring-4 focus:ring-primary/5 shadow-inner transition-all"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    min={bookingDate}
                  />
                  <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-primary/30 group-hover:text-primary transition-colors">schedule</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] mb-10 space-y-5 shadow-inner border border-slate-100/50">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                <span>Stay Collection ({stayDuration} Nights)</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/50 pt-6">
                <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60 tracking-[0.2em]">Total</span>
                <span className="text-4xl font-black text-primary font-headline tracking-tighter">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button 
              onClick={handleProceedToBooking}
              className="w-full bg-gradient-to-br from-primary via-primary to-primary-container text-white py-10 rounded-full font-black text-xl shadow-2xl shadow-primary/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] mb-10 flex flex-col items-center justify-center gap-1 border-none relative overflow-hidden group"
            >
               <div className="flex items-center gap-4 relative z-10">
                 <span>Initiate Booking</span>
                 <span className="material-symbols-outlined relative z-10 group-hover:translate-x-2 transition-transform">send_to_mobile</span>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 relative z-10">Verified Protocol</span>
            </button>

            <div className="space-y-6 border-t border-slate-100 pt-10">
              <div className="flex items-center gap-5 text-xs font-black uppercase tracking-[0.2em] text-secondary group">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                GavaConnect Protected
              </div>
              <div className="flex items-center gap-5 text-xs font-black uppercase tracking-[0.2em] text-primary group">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                M-Pesa Secured
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
