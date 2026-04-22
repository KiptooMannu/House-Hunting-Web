import { useGetBookingsQuery } from '../../store/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatCurrency } from '../../utils/helpers';

interface Location {
  town: string;
  county: string;
}

interface HouseImage {
  imageUrl: string;
  isPrimary: boolean;
}

interface House {
  title: string;
  location?: Location;
  images?: HouseImage[];
}

interface Payment {
  mpesaReceiptNumber: string;
  status: string;
}

interface Booking {
  bookingId: number;
  status: string;
  totalPrice: string | number;
  bookingFee: string | number;
  moveInDate?: string;
  createdAt: string;
  house?: House;
  payments?: Payment[];
}

export default function MyManagedBookings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: bookings, isLoading } = useGetBookingsQuery({ 
    landlordId: user?.role === 'landlord' ? user.userId : undefined 
  });

  const statusMap: Record<string, { label: string, color: string, bg: string, badge: string }> = {
    pending_payment: { label: 'Pending', color: 'text-tertiary-fixed', bg: 'bg-tertiary-fixed/90', badge: 'bg-tertiary-fixed' },
    confirmed: { label: 'Confirmed', color: 'text-on-secondary-container', bg: 'bg-secondary-container/90', badge: 'bg-secondary' },
    cancelled: { label: 'Cancelled', color: 'text-on-error-container', bg: 'bg-error-container/90', badge: 'bg-error' },
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Filtering Clusters...</p>
    </div>
  );

  const upcomingCount = bookings?.filter((b: Booking) => b.status === 'confirmed').length || 0;

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-left">
      {/* Editorial Header Section */}
      <header>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block underline decoration-secondary decoration-2 underline-offset-4">Perspective</span>
            <h1 className="text-5xl font-black text-primary tracking-tighter leading-tight mb-4 font-headline italic">
              Managed <span className="text-secondary">Bookings.</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed font-medium italic opacity-80">
              A curated overview of your property journey. Manage viewing schedules, track transaction records, and prepare for your next move.
            </p>
          </div>
          
          {/* Summary Widgets */}
          <div className="flex gap-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0px_20px_40px_rgba(25,28,29,0.04)] min-w-[200px] border border-slate-50 relative overflow-hidden group">
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Total Nodes</p>
              <p className="text-5xl font-black text-primary font-headline tracking-tighter">{bookings?.length || 0}</p>
              <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <span className="material-symbols-outlined text-6xl">layers</span>
              </div>
            </div>
            <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 min-w-[200px] border border-white/10 relative overflow-hidden group">
              <p className="text-primary-fixed-dim text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Upcoming Viewings</p>
              <p className="text-5xl font-black font-headline tracking-tighter italic">{upcomingCount.toString().padStart(2, '0')}</p>
              <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <span className="material-symbols-outlined text-6xl">event</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-10">
          <div className="sticky top-32 space-y-10">
            <div>
              <h3 className="text-primary font-black text-xs uppercase tracking-widest mb-6 px-1 italic">Quick Filters</h3>
              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-between w-full px-6 py-4 bg-white rounded-2xl text-primary font-black shadow-sm border border-slate-50 group hover:scale-[1.03] transition-all">
                  <span className="text-sm">Global Ledger</span>
                  <span className="bg-primary-fixed-dim text-primary text-[10px] px-3 py-1 rounded-lg">{bookings?.length || 0}</span>
                </button>
                <button className="flex items-center justify-between w-full px-6 py-4 text-on-surface-variant hover:bg-white hover:shadow-sm transition-all rounded-2xl border border-transparent font-bold">
                  <span className="text-sm">Confirmed</span>
                  <span className="text-[10px] opacity-40">{upcomingCount}</span>
                </button>
                <button className="flex items-center justify-between w-full px-6 py-4 text-on-surface-variant hover:bg-white hover:shadow-sm transition-all rounded-2xl border border-transparent font-bold">
                  <span className="text-sm">Pending</span>
                  <span className="text-[10px] opacity-40">{bookings?.filter((b: Booking) => b.status === 'pending_payment').length || 0}</span>
                </button>
              </div>
            </div>

            <div className="p-8 bg-secondary-container rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-secondary/5 group">
              <div className="relative z-10 text-left">
                <h4 className="text-on-secondary-container font-black font-headline text-lg mb-2">Expert Concierge</h4>
                <p className="text-on-secondary-container/80 text-xs font-medium mb-6 leading-relaxed">Need help coordinating multiple viewings?</p>
                <button className="bg-white text-secondary font-black text-[9px] px-6 py-3 rounded-full uppercase tracking-widest shadow-xl shadow-secondary/10 hover:translate-y-[-2px] active:translate-y-0 transition-all">
                  Contact Deployment Officer
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <span className="material-symbols-outlined text-8xl">support_agent</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Booking Cards Grid */}
        <div className="lg:col-span-9 space-y-8">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking: Booking) => {
              const statusData = statusMap[booking.status] || { label: booking.status, color: 'text-slate-400', bg: 'bg-slate-100/90', badge: 'bg-slate-400' };
              const primaryImage = booking.house?.images?.find(img => img.isPrimary)?.imageUrl 
                               || booking.house?.images?.[0]?.imageUrl 
                               || "https://images.unsplash.com/photo-1600607687940-4e5a99427c5e";
              const payment = booking.payments?.find(p => p.status === 'completed') || booking.payments?.[0];

              return (
                <div 
                  key={booking.bookingId} 
                  className="group bg-white rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0px_20px_40px_rgba(25,28,29,0.03)] transition-all hover:shadow-[0px_30px_60px_rgba(25,28,29,0.06)] hover:translate-y-[-4px] duration-500 border border-slate-50"
                >
                  {/* Image Section */}
                  <div className="md:w-80 h-56 md:h-auto overflow-hidden relative">
                    <img 
                      alt={booking.house?.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      src={primaryImage} 
                    />
                    <div className={`absolute top-6 left-6 ${statusData.bg} backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 border border-white/20`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusData.badge} ${booking.status === 'confirmed' ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${statusData.color}`}>{statusData.label}</span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-left">
                          <h3 className="text-2xl font-black text-primary font-headline tracking-tighter italic">{booking.house?.title || 'Property Unit'}</h3>
                          <p className="text-on-surface-variant flex items-center gap-1.5 text-xs font-bold mt-1 opacity-60 italic">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {booking.house?.location?.town || 'Mainland'}, {booking.house?.location?.county || 'Nairobi'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-black text-2xl font-headline tracking-tighter italic">{formatCurrency(booking.totalPrice || booking.bookingFee)}</p>
                          <p className="text-[10px] text-on-surface-variant font-extrabold uppercase tracking-widest opacity-40">Contract Val.</p>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 py-8 my-8 border-y border-slate-50">
                        <div className="text-left">
                          <p className="text-on-surface-variant text-[9px] uppercase font-black tracking-widest mb-2 opacity-60 underline decoration-primary/10 decoration-2 underline-offset-4">Target Date</p>
                          <p className="text-primary font-black italic text-base flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary-container">calendar_month</span>
                            {new Date(booking.moveInDate || booking.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-on-surface-variant text-[9px] uppercase font-black tracking-widest mb-2 opacity-60 underline decoration-primary/10 decoration-2 underline-offset-4">Deployment Slot</p>
                          <p className="text-primary font-black italic text-base flex items-center gap-2 font-mono">
                            <span className="material-symbols-outlined text-lg text-primary-container">schedule</span>
                            {(() => {
                              const slots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'];
                              return slots[booking.bookingId % slots.length];
                            })()}
                          </p>
                        </div>
                        <div className="col-span-2 lg:col-span-1 text-left">
                          <p className="text-on-surface-variant text-[9px] uppercase font-black tracking-widest mb-2 opacity-60 underline decoration-primary/10 decoration-2 underline-offset-4">M-Pesa Trace</p>
                          <p className="text-on-surface font-mono text-xs font-black tracking-widest opacity-80 overflow-hidden text-ellipsis">
                            {payment?.mpesaReceiptNumber || 'PENDING_TRACE'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Financial Manifest — Transparency Layer */}
                    <div className="mt-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Financial Summary</span>
                        <span className="text-primary italic">Statement #L-{booking.bookingId}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Gross Rent Portion</p>
                          <p className="text-sm font-black text-primary italic">{formatCurrency(Number(booking.totalPrice) - Number(booking.bookingFee))}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">MRI Tax (7.5%)</p>
                          <p className="text-sm font-black text-red-500 italic">-{formatCurrency((Number(booking.totalPrice) - Number(booking.bookingFee)) * 0.075)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Platform Fee Portion</p>
                          <p className="text-sm font-black text-primary italic">{formatCurrency(booking.bookingFee)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">VAT (16%) on Fee</p>
                          <p className="text-sm font-black text-red-500 italic">-{formatCurrency(Number(booking.bookingFee) * 0.16)}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Net Payout to Landlord</span>
                        <span className="text-lg font-black text-emerald-600 italic">
                          {formatCurrency(
                            (Number(booking.totalPrice) - Number(booking.bookingFee)) * 0.925 + 
                            (Number(booking.bookingFee) * 0.84)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                      <button className="px-8 py-4 rounded-2xl text-on-surface-variant font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 cursor-pointer">
                        Reschedule
                      </button>
                      <button className="bg-primary px-10 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 cursor-pointer">
                        View Statement
                        <span className="material-symbols-outlined text-sm opacity-40">receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-50 shadow-sm flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center opacity-40">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
              </div>
              <div className="space-y-2">
                <p className="text-primary font-black text-xl italic font-headline tracking-tighter">No managed nodes active.</p>
                <p className="text-on-surface-variant text-sm font-medium opacity-60 italic">Register a new property to initiate booking tracking.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

