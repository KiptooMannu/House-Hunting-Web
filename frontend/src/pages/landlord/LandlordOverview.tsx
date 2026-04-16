import { useGetRevenueQuery, useGetBookingsQuery } from '../../store/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatCurrency } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function LandlordOverview() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const { data: revenueData } = useGetRevenueQuery({ 
    landlordId: user?.role === 'landlord' ? user.userId : undefined 
  });
  const { data: bookings } = useGetBookingsQuery({ 
    landlordId: user?.role === 'landlord' ? user.userId : undefined 
  });

  const revenue = revenueData?.data ?? null;
  const summary = revenue?.summary || { total_revenue: 0, total_payments: 0, average_payment: 0 };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Financial Pulse Summary Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/5 rounded-xl text-primary font-black">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40 italic">Live Pulse</span>
            </div>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Portfolio Revenue</p>
          <h3 className="text-3xl font-black font-headline text-primary tracking-tighter">{formatCurrency(summary.total_revenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-4 font-bold italic">Net after platform fees</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-tertiary/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary/5 rounded-xl text-tertiary font-black">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="text-xs font-black text-tertiary bg-tertiary/10 px-3 py-1 rounded-full uppercase tracking-tighter">{summary.total_payments} Payouts</span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Expected Yield</p>
          <h3 className="text-3xl font-black font-headline text-tertiary tracking-tighter font-headline">{formatCurrency(summary.total_revenue / 4)}</h3>
          <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tighter">Monthly projection active</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-secondary/20 transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary/5 rounded-xl text-secondary font-black">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-widest">GavaReady</span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Reserved Compliance</p>
          <h3 className="text-3xl font-black font-headline text-primary tracking-tighter">{formatCurrency(summary.total_revenue * 0.15)}</h3>
          <p className="text-[10px] text-slate-400 mt-4 font-bold italic uppercase tracking-tighter">Protocol automated</p>
        </div>
      </section>

      {/* Managed Bookings Intelligence */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 mb-10">
          <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black font-headline text-primary tracking-tighter">Active Managed Node Bookings</h3>
              <button 
                onClick={() => navigate('/landlord/bookings')}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                View All Clusters
              </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Property Node</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Tenant ID</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline text-right">Yield (KES)</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings && bookings.length > 0 ? (
                  bookings.slice(0, 5).map((booking: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-primary">{booking.house?.title || `Node_${booking.houseId}`}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{booking.house?.location?.town || 'Port Cluster'}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seeker_{booking.seekerId}</span>
                      </td>
                       <td className="px-10 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          booking.status === 'confirmed' ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <span className={`w-1 h-1 rounded-full bg-current ${booking.status === 'confirmed' ? 'animate-pulse' : ''}`}></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm font-black text-primary text-right">{formatCurrency(booking.totalPrice)}</td>
                      <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                      <td colSpan={5} className="px-10 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active node bookings detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
