import { useSelector } from 'react-redux';
import { useGetBookingsQuery } from '../../store/apiSlice';
import type { RootState } from '../../store';
import { formatCurrency } from '../../utils/helpers';

export default function BookingHistory() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: bookings, isLoading } = useGetBookingsQuery({ seekerId: user?.userId });

  const statusMap: Record<string, { label: string, color: string, bg: string, ring: string }> = {
    pending_payment: { label: 'Pending Verification', color: 'text-tertiary', bg: 'bg-tertiary/10', ring: 'ring-tertiary/20' },
    confirmed: { label: 'Active Schedule', color: 'text-secondary', bg: 'bg-secondary/10', ring: 'ring-secondary/20' },
    cancelled: { label: 'Terminated', color: 'text-error', bg: 'bg-red-50', ring: 'ring-red-100' },
    completed: { label: 'Viewing Finalized', color: 'text-primary', bg: 'bg-primary/5', ring: 'ring-primary/10' },
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Vault...</p>
    </div>
  );

  const upcomingCount = bookings?.filter((b: any) => b.status === 'confirmed').length || 0;

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-left">
      {/* Editorial Header Section */}
      <header>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Historical Perspective</span>
            <h1 className="text-5xl font-black text-primary tracking-tighter leading-tight mb-4 font-headline italic">
              My Booking <span className="text-secondary">Timeline.</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed font-medium italic opacity-80">
              A curated overview of your property journey. Track verification status, view transaction records, and coordinate your upcoming visits.
            </p>
          </div>
          
          {/* Summary Widgets */}
          <div className="flex gap-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-w-[200px] group hover:shadow-xl transition-all duration-500">
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Total Nodes</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-black text-primary font-headline tracking-tighter">{bookings?.length || 0}</p>
                <span className="material-symbols-outlined text-primary mb-1 opacity-20 group-hover:opacity-100 transition-opacity">layers</span>
              </div>
            </div>
            <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 min-w-[200px] border border-white/10 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-primary-fixed-dim text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Upcoming Viewings</p>
                <p className="text-5xl font-black font-headline tracking-tighter italic">{upcomingCount.toString().padStart(2, '0')}</p>
              </div>
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-5 group-hover:scale-125 transition-transform duration-700">calendar_month</span>
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
              <h3 className="text-primary font-black text-xs uppercase tracking-widest mb-6 px-1">Quick Filters</h3>
              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-between w-full px-6 py-4 bg-white rounded-2xl text-primary font-black shadow-sm border border-slate-50 hover:scale-[1.02] transition-all">
                  <span className="text-sm">Global Ledger</span>
                  <span className="bg-primary/5 text-primary text-[10px] px-3 py-1 rounded-full">{bookings?.length || 0}</span>
                </button>
                <button className="flex items-center justify-between w-full px-6 py-4 text-on-surface-variant hover:bg-white hover:shadow-sm transition-all rounded-2xl border border-transparent font-bold">
                  <span className="text-sm">Verified</span>
                  <span className="text-[10px] opacity-40">{bookings?.filter((b: any) => b.status === 'confirmed').length || 0}</span>
                </button>
                <button className="flex items-center justify-between w-full px-6 py-4 text-on-surface-variant hover:bg-white hover:shadow-sm transition-all rounded-2xl border border-transparent font-bold">
                  <span className="text-sm">Historical</span>
                  <span className="text-[10px] opacity-40">{bookings?.filter((b: any) => b.status === 'completed').length || 0}</span>
                </button>
              </div>
            </div>

            <div className="p-8 bg-secondary-container rounded-[2.5rem] relative overflow-hidden shadow-lg border border-white/20 group">
              <div className="relative z-10">
                <h4 className="text-on-secondary-container font-black font-headline italic text-lg mb-2">Concierge Assist</h4>
                <p className="text-on-secondary-container/80 text-xs font-medium mb-6 leading-relaxed">Need help coordinating multiple property deployments?</p>
                <button className="bg-white text-secondary font-black text-[9px] px-6 py-3 rounded-xl uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
                  Contact Deployment Officer
                </button>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-9xl">support_agent</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Booking Cards Grid */}
        <div className="lg:col-span-9 space-y-8">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => {
              const statusData = statusMap[booking.status] || { label: booking.status, color: 'text-slate-400', bg: 'bg-slate-100', ring: 'ring-gray-100' };
              const primaryImage = booking.house?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
              const payment = booking.payments?.[0];

              return (
                <div 
                  key={booking.bookingId} 
                  className="group bg-white rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 duration-500"
                >
                  {/* Image Section */}
                  <div className="md:w-80 h-56 md:h-auto overflow-hidden relative">
                    <img 
                      alt={booking.house?.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      src={primaryImage} 
                    />
                    <div className={`absolute top-6 left-6 ${statusData.bg} backdrop-blur-md ring-1 ${statusData.ring} px-4 py-2 rounded-full flex items-center gap-2`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-current ${booking.status === 'confirmed' ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-[9px] font-black ${statusData.color} uppercase tracking-[0.1em]`}>{statusData.label}</span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-left">
                          <h3 className="text-2xl font-black text-primary tracking-tighter font-headline italic">{booking.house?.title || 'Residential Core'}</h3>
                          <p className="text-on-surface-variant flex items-center gap-1.5 text-xs font-bold mt-1 opacity-60">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {booking.house?.location?.town}, {booking.house?.location?.county}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-black text-2xl font-headline tracking-tighter italic">{formatCurrency(booking.totalPrice)}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase opacity-40">Contract Price</p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 py-8 my-8 border-y border-slate-50">
                        <div className="text-left">
                          <p className="text-on-surface-variant text-[9px] uppercase font-black tracking-widest mb-2 opacity-50">Viewing Schedule</p>
                          <p className="text-primary font-black italic text-base flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary opacity-30">calendar_month</span>
                            {new Date(booking.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-on-surface-variant text-[9px] uppercase font-black tracking-widest mb-2 opacity-50">Node Type</p>
                          <p className="text-primary font-black italic text-base flex items-center gap-2 capitalize">
                            <span className="material-symbols-outlined text-lg text-primary opacity-30">home_work</span>
                            {booking.house?.houseType?.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="col-span-2 lg:col-span-1 text-left">
                          <p className="text-on-surface-variant text-[9px] uppercase font-black tracking-widest mb-2 opacity-50">Sync Reference</p>
                          <p className="text-on-surface font-mono text-xs font-black tracking-widest opacity-80 overflow-hidden text-ellipsis">
                            {payment?.mpesaReceiptNumber || 'PENDING_VOID'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                       {booking.status === 'confirmed' ? (
                         <span className="text-secondary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 italic">
                           <span className="material-symbols-outlined text-sm font-variation-fill">verified</span>
                           Schedule Active
                         </span>
                       ) : (
                         <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest italic">{booking.status.replace('_', ' ')}</span>
                       )}
                       
                       <div className="flex gap-4">
                          <button className="px-6 py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Support Desk</button>
                          <button className="bg-primary px-8 py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            Node Intel
                            <span className="material-symbols-outlined text-sm opacity-40">arrow_forward</span>
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-[3rem] py-32 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-slate-200">inventory_2</span>
              </div>
              <div className="text-center">
                <p className="text-primary font-black text-xl italic font-headline tracking-tighter">Vault is Empty.</p>
                <p className="text-on-surface-variant text-sm font-medium opacity-60">You haven't initiated any property node deployments yet.</p>
              </div>
              <button 
                onClick={() => window.location.href = '/houses'}
                className="mt-4 px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
              >
                Explore Property Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
