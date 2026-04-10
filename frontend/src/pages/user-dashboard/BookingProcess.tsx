import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useCreateBookingMutation, useGetHouseByIdQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function BookingProcess() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const houseId = id ? parseInt(id) : null;
  const { data: house } = useGetHouseByIdQuery(houseId, { skip: !houseId });
  const [createBooking, { isLoading: bookingLoading }] = useCreateBookingMutation();

  // Booking details from navigation state
  const bookingState = location.state || {};
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    if (!bookingState.totalPrice && house) {
        // Fallback or redirect if no state
        // For now, allow it but ideally redirect
    }
  }, [user, bookingState, house, navigate]);

  const handleBooking = async () => {
    if (!houseId || !user) return;
    setError('');
    
    try {
      await createBooking({
        houseId: houseId,
        seekerId: user.userId,
        moveInDate: bookingState.startDate,
        checkoutDate: bookingState.endDate,
        totalPrice: bookingState.totalPrice,
        phone_number: phoneNumber,
        bookingFee: 2500, // Based on design
        specialRequests: specialRequests
      }).unwrap();
      
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 3000);
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.error || 'Booking failed. Please check your details.');
    }
  };

  if (!house) return <div className="p-20 text-center">Loading property context...</div>;

  return (
    <main className="md:ml-64 min-h-screen bg-surface font-body antialiased">
      {/* Side Navigation Bar (Subtle) */}
      <aside className="h-full w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col gap-2 p-4 z-40 hidden md:flex border-r border-slate-200/50">
        <div className="mb-8 px-4 py-4">
          <h2 className="text-xl font-black text-primary tracking-tighter font-headline">EstateCurator</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant opacity-60 font-black mt-1">Management Hub</p>
        </div>
        <nav className="flex flex-col gap-2">
          {['Dashboard', 'My Bookings', 'Payments', 'Saved Estates', 'Settings'].map((item) => (
             <a key={item} className={`px-4 py-3 rounded-xl transition-all font-manrope text-sm font-bold flex items-center gap-4 ${item === 'My Bookings' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm'}`} href="#">
                <span className="material-symbols-outlined text-[20px]">{item === 'Dashboard' ? 'dashboard' : item === 'My Bookings' ? 'event_available' : item === 'Payments' ? 'account_balance_wallet' : item === 'Saved Estates' ? 'villa' : 'settings'}</span> 
                {item}
             </a>
          ))}
        </nav>
      </aside>

      {/* Editorial Header */}
      <header className="pt-20 pb-8 px-8 md:px-16 max-w-6xl mx-auto text-left">
        <div className="flex items-center gap-3 text-primary mb-6 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Return to Estate</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface mb-6 leading-[0.9]">
          Secure Your <span className="text-primary bg-primary-fixed px-4 rounded-2xl block md:inline-block mt-2 md:mt-0">New Horizon.</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-xl leading-relaxed font-medium">
          Complete your reservation for <span className="font-black text-primary underline decoration-primary/20">{house.title}</span>. This action initiates the verified booking process via GavaConnect.
        </p>
      </header>

      <section className="px-8 md:px-16 pb-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 text-left">
        {/* Left Column: The Form Journey */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-16">
          
          {error && (
             <Badge variant="destructive" className="w-full p-6 rounded-2xl border-none shadow-xl shadow-error/10 text-lg font-bold">
               {error}
             </Badge>
          )}

          {success && (
             <Badge className="w-full p-8 rounded-2xl border-none shadow-xl shadow-secondary/10 bg-secondary text-white text-2xl font-black flex flex-col gap-4">
               <span className="material-symbols-outlined text-5xl">check_circle</span>
               Booking Confirmed! Redirecting...
             </Badge>
          )}

          {/* Section 1: Booking Details */}
          <div className="space-y-10">
            <div className="flex items-center gap-6">
              <span className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-xl shadow-primary/20">01</span>
              <h2 className="text-3xl font-black font-headline tracking-tighter text-primary">Living Arrangements</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-1 opacity-60">Move-in Period</label>
                <div className="p-6 bg-surface-container-low rounded-2xl border border-slate-100 shadow-inner">
                    <p className="font-black text-primary text-lg">{bookingState.startDate} — {bookingState.endDate}</p>
                    <p className="text-[11px] font-bold text-on-surface-variant mt-1 uppercase tracking-widest">{bookingState.stayDuration} Nights Total</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-1 opacity-60">Number of Occupants</label>
                <select className="w-full bg-surface-container-low border-none rounded-2xl p-6 focus:ring-4 focus:ring-primary/10 transition-all font-black text-primary shadow-inner appearance-none">
                  <option>1 Resident</option>
                  <option>2 Residents</option>
                  <option>3-4 Residents</option>
                  <option>Executive Suite (5+)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-1 opacity-60">Bespoke Requests</label>
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-3xl p-8 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary placeholder:opacity-40 shadow-inner" 
                placeholder="Mention any specific requirements or questions for the property manager..." 
                rows={5}
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Section 2: Payment Verification */}
          <div className="space-y-10 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-xl shadow-primary/20">02</span>
                <h2 className="text-3xl font-black font-headline tracking-tighter text-primary">Payment Ecosystem</h2>
              </div>
              <Badge className="bg-secondary/10 text-secondary rounded-full px-4 py-2 flex items-center gap-2 border-none">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-[10px] font-black uppercase tracking-widest">PCI-DSS SECURE</span>
              </Badge>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden ring-8 ring-slate-50">
              <div className="bg-[#3BB234] p-10 flex flex-col md:flex-row justify-between items-center text-white gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-2xl">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fill="#3BB234" fontFamily="Arial" fontSize="60" fontWeight="black">M</text>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-3xl font-headline leading-none tracking-tighter">M-Pesa Express</h3>
                    <p className="text-[10px] opacity-80 uppercase tracking-[0.3em] font-black mt-2">Instant STK Protocol</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black opacity-70 tracking-widest mb-1">Deductible Booking Fee</p>
                  <p className="text-5xl font-black tracking-tighter">KSh 2,500</p>
                </div>
              </div>

              <div className="p-12 space-y-10">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-3xl">info</span>
                    <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                      This is a <span className="font-black text-primary underline decoration-secondary/30">verified reservation fee</span>. The amount is <span className="font-black text-secondary">fully deductible</span> from your final collection and ensures the property is locked exclusively for you.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-1 opacity-60">Verified M-Pesa Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                        <span className="text-primary font-black text-lg">+254</span>
                      </div>
                      <input 
                        className="w-full bg-slate-50 border-none rounded-[2rem] py-10 pl-24 pr-8 focus:ring-4 focus:ring-secondary/10 transition-all font-black text-2xl text-primary tracking-[0.2em] shadow-inner" 
                        placeholder="712 345 678" 
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full bg-[#3BB234] hover:bg-green-700 text-white py-10 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-green-200 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-2 group border-none"
                  >
                    <div className="flex items-center gap-4">
                      <span>{bookingLoading ? 'Initializing Protocol...' : 'Initiate Secure Payment'}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">send_to_mobile</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.4em] opacity-80 font-black">Authorized GavaConnect Signature</span>
                  </button>
                  
                  <div className="flex items-center justify-center gap-6 pt-4 opacity-40">
                    <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">AES-256 Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Context Sidebar */}
        <div className="lg:col-span-12 xl:col-span-5">
          <div className="sticky top-28 space-y-8">
            <Card className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none ring-8 ring-slate-50">
              <div className="relative h-72">
                <img 
                    className="w-full h-full object-cover" 
                    src={house.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600121848594-d864.jpg"} 
                    alt={house.title}
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl border border-white">
                    <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Estate Signature</span>
                </div>
              </div>
              <div className="p-10 space-y-8 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black font-headline tracking-tighter text-primary leading-none">{house.title}</h3>
                    <p className="text-sm font-bold text-on-surface-variant flex items-center gap-2 mt-3 opacity-60">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {house.location?.county || 'Nairobi'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary/40 text-2xl">bed</span>
                    <p className="text-[10px] font-black uppercase mt-2 text-primary">{house.bedrooms} Beds</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary/40 text-2xl">bathtub</span>
                    <p className="text-[10px] font-black uppercase mt-2 text-primary">{house.bathrooms} Baths</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary/40 text-2xl">square_foot</span>
                    <p className="text-[10px] font-black uppercase mt-2 text-primary">{house.square_footage || '2,400'}ft²</p>
                  </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest opacity-60">
                        <span>Stay Duration</span>
                        <span>{bookingState.stayDuration} Nights</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest opacity-60">
                        <span>Daily Curation</span>
                        <span>{formatCurrency(bookingState.dailyRate)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-sm font-black uppercase tracking-widest text-primary/60">Final Valuation</span>
                        <span className="text-3xl font-black text-primary font-headline tracking-tighter">{formatCurrency(bookingState.totalPrice)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-tertiary animate-pulse">info</span>
                  <p className="text-[11px] font-bold text-on-surface-variant leading-tight uppercase tracking-wide">
                    Reservation active for <span className="text-primary font-black">15:00 minutes</span>.
                  </p>
                </div>
              </div>
            </Card>

            <div className="bg-primary/5 p-8 rounded-[2rem] flex items-center gap-6 border border-primary/10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-4xl">security</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-primary">GavaConnect Integrity</p>
                <p className="text-[11px] font-bold text-on-surface-variant mt-1 leading-relaxed">Your data is handled via dedicated encrypted nodes ensuring total regulatory compliance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
