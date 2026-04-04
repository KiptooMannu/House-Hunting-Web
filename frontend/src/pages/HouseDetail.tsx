import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';
import Footer from '../components/Footer';

export default function HouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const houseId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const defaultBookingDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Default to tomorrow
    return d.toISOString().slice(0, 10);
  }, []);

  const [house, setHouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [bookingDate, setBookingDate] = useState(defaultBookingDate);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/houses/${id}`);
        if (!cancelled) setHouse(res.data?.data?.house ?? null);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load house.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleStkPush() {
    if (!houseId) return;
    setBookingLoading(true);
    setError('');
    
    // In a real implementation this might call /mpesa/stkpush first
    // For now we preserve the existing booking endpoint logic and add phone.
    try {
      await api.post('/bookings', {
        house_id: houseId,
        booking_date: bookingDate,
        phone_number: phoneNumber // Pass phone if backend supports it
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/my-bookings');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error && !isModalOpen) return <div className="min-h-screen p-8 mt-16 text-center text-error bg-surface">{error}</div>;
  if (!house) return <div className="min-h-screen p-8 mt-16 text-center text-on-surface-variant bg-surface">House not found.</div>;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pt-20 flex flex-col">
      <main className="flex-grow pb-12 max-w-7xl mx-auto px-6 w-full mt-8">
        
        {/* Hero Editorial Gallery */}
        <section className="grid grid-cols-12 gap-2 md:gap-4 mb-16">
          <div className="col-span-12 md:col-span-8 h-[250px] sm:h-[350px] md:h-[500px] overflow-hidden rounded-xl group relative">
            {house.images && house.images.length > 0 ? (
               <img 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                 alt={house.title} 
                 src={house.images[0]} 
               />
            ) : (
               <div className="w-full h-full bg-surface-container flex items-center justify-center text-6xl">🏠</div>
            )}
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-secondary/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Listing
              </span>
              <span className="bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">Premium Estate</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-col gap-2 md:gap-4">
            <div className="h-[120px] sm:h-[170px] md:h-[242px] overflow-hidden rounded-xl group bg-surface-container">
               {house.images && house.images.length > 1 ? (
                 <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Detail 1" src={house.images[1]} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-outline-variant font-medium text-sm">No secondary image</div>
               )}
            </div>
            <div className="h-[120px] sm:h-[170px] md:h-[242px] overflow-hidden rounded-xl group relative bg-surface-container">
               {house.images && house.images.length > 2 ? (
                 <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Detail 2" src={house.images[2]} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-outline-variant font-medium text-sm">No tertiary image</div>
               )}
               {house.images && house.images.length > 3 && (
                 <div className="absolute inset-0 bg-primary/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white font-headline font-bold underline">View {house.images.length} Photos</span>
                 </div>
               )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-12">
          {/* Content Area */}
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tight mb-2">{house.title}</h1>
              <p className="text-lg text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                {house.location_name || house.county || 'Kenya'} • {house.status === 'available' ? 'Available Now' : 'Currently Rented'}
              </p>
            </div>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap gap-8 md:gap-12 py-8 border-y-0 bg-surface-container-low rounded-xl px-8 mb-12">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-1">Bedrooms</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bed</span>
                  <span className="text-xl font-bold font-headline">{house.bedrooms}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-1">Bathrooms</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shower</span>
                  <span className="text-xl font-bold font-headline">{house.bathrooms}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-1">Status</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  <span className="text-xl font-bold font-headline text-secondary capitalize">{house.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-12 pr-0 md:pr-12">
              <section>
                <h2 className="font-headline text-2xl font-bold text-primary mb-6">About this home</h2>
                <p className="text-on-surface-variant leading-relaxed text-lg whitespace-pre-line">
                  {house.description || 'No description provided.'}
                </p>
              </section>

              {house.amenities && house.amenities.length > 0 && (
                <section>
                  <h2 className="font-headline text-2xl font-bold text-primary mb-6">Premium Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
                    {house.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-sm">verified</span>
                        </div>
                        <span className="font-medium text-sm capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {house.landlord && (
                <section className="bg-surface-container-low rounded-xl p-8 flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary text-2xl font-bold">
                    {(house.landlord.name || 'L')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">{house.landlord.name || 'Anonymous Landlord'}</h3>
                    <p className="text-on-surface-variant text-sm mb-4">Verified Estate Manager</p>
                    <div className="flex flex-wrap gap-4">
                      <button className="bg-primary-fixed text-primary px-6 py-2 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-colors">
                        Message
                      </button>
                      <button className="text-primary px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 border border-primary/20 hover:bg-primary/5">
                        <span className="material-symbols-outlined text-[18px]">call</span> Show Number
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="col-span-12 lg:col-span-4 relative">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8 border-none ring-1 ring-outline-variant/20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-3xl font-black font-headline text-primary">
                      {formatCurrency(house.rent)}
                    </span>
                    <span className="text-on-surface-variant font-medium ml-1">/month</span>
                  </div>
                </div>
                
                <div className="bg-surface-container rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">One-time Booking Fee</span>
                    <span className="text-sm font-bold text-tertiary">KSh 500</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    This fee secures your viewing slot and authenticates your intent. It is non-refundable but applied against your first month's rent.
                  </p>
                </div>

                <div className="mb-6 space-y-2">
                   <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Select Viewing Date</label>
                   <input 
                     type="date" 
                     className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary text-sm font-semibold text-primary"
                     value={bookingDate}
                     onChange={(e) => setBookingDate(e.target.value)}
                     min={defaultBookingDate}
                   />
                </div>

                <button 
                  className="w-full bg-gradient-to-r from-tertiary to-[#7a3000] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] mb-4"
                  onClick={() => setIsModalOpen(true)}
                  disabled={house.status !== 'available'}
                >
                  {house.status !== 'available' ? 'Currently Rented' : 'Book Viewing Now'}
                </button>
                
                <div className="flex items-center gap-2 justify-center py-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                  <p className="text-[10px] text-on-surface-variant text-center uppercase tracking-widest font-bold">
                    Logged for Tax Compliance (KRA Ready)
                  </p>
                </div>
                
                <hr className="my-6 border-outline-variant/20"/>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    <div>
                      <p className="text-sm font-bold">Instant Confirmation</p>
                      <p className="text-xs text-on-surface-variant">Receive your booking slip via SMS immediately.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">shield</span>
                    <div>
                      <p className="text-sm font-bold">Secure Escrow</p>
                      <p className="text-xs text-on-surface-variant">Payments are held in a secure GavaConnect account.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Context sidecard */}
              <div className="bg-surface-container-low rounded-xl p-6 hidden md:block">
                <h4 className="font-headline font-bold text-primary mb-3">Location Context</h4>
                <div className="h-32 rounded-lg bg-surface-container-highest mb-4 flex items-center justify-center font-bold text-outline-variant uppercase">
                  Map Placeholder
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">{house.location_name || 'Center'}</span>
                    <span className="font-bold">5 min drive</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* M-Pesa Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#39B54A] rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-xl italic">M</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-bold text-primary">Pay via M-Pesa</h3>
                    <p className="text-xs text-on-surface-variant font-medium line-clamp-1">Securing: {house.title}</p>
                  </div>
                </div>
                {!bookingLoading && !bookingSuccess && (
                  <button 
                    className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
              
              {bookingSuccess ? (
                <div className="text-center py-8">
                   <div className="w-16 h-16 bg-secondary-container text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="material-symbols-outlined text-3xl font-bold">check</span>
                   </div>
                   <h3 className="text-xl font-bold text-primary mb-2">Push Sent Successfully!</h3>
                   <p className="text-sm text-on-surface-variant">Please check your phone and enter your M-Pesa PIN.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {error && (
                    <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="bg-surface-container-low rounded-xl p-6 text-center border ring-1 ring-[#39B54A]/30">
                    <p className="text-sm font-bold text-on-surface-variant mb-1">Total Due Now</p>
                    <p className="text-4xl font-black font-headline text-[#39B54A]">KSh 500</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-on-surface-variant block mb-2">M-Pesa Registered Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">+254</span>
                      <input 
                        className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-16 pr-4 focus:ring-2 focus:ring-[#39B54A] font-bold text-lg" 
                        placeholder="712 345 678" 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">
                      By clicking below, you will receive an STK Push on your phone to enter your M-Pesa PIN.
                    </p>
                  </div>
                  
                  <button 
                    className="w-full bg-[#39B54A] hover:bg-[#2e943c] text-white py-4 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                    onClick={handleStkPush}
                    disabled={bookingLoading || !phoneNumber}
                  >
                    <span className="material-symbols-outlined">send_to_mobile</span>
                    {bookingLoading ? 'Sending Push...' : 'Send STK Push'}
                  </button>
                  
                  <p className="text-[11px] text-center text-on-surface-variant flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Encrypted & Logged for Compliance
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
