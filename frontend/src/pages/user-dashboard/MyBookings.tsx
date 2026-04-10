import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetBookingsQuery, useCreateMpesaPushMutation, useGetHousesQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MyBookings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: bookingsData, isLoading: bookingsLoading, refetch } = useGetBookingsQuery({});
  const { data: housesData } = useGetHousesQuery({ page: 1, limit: 4 });
  const [createMpesaPush] = useCreateMpesaPushMutation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);

  const bookings = bookingsData ?? [];
  const savedHomes = housesData?.items?.slice(0, 2) ?? [];

  async function handleMpesaPay(bookingId: number) {
    if (!phoneNumber) {
      setError('Please enter a phone number.');
      return;
    }
    setPayingBookingId(bookingId);
    setError('');
    try {
      await createMpesaPush({ bookingId, phone_number: phoneNumber }).unwrap();
      alert('STK Push sent! Please check your phone.');
      refetch();
    } catch (err: any) {
      setError(err?.data?.message || 'Payment initiation failed.');
    } finally {
      setPayingBookingId(null);
    }
  }

  if (bookingsLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col hide-scrollbar overflow-y-auto">
        <div className="p-8">
          <div className="text-xl font-bold tracking-tight text-primary font-headline">
            Estate Curator
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary-fixed rounded-xl">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link to="/houses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors">
            <span className="material-symbols-outlined">favorite</span>
            Saved Homes
          </Link>
          <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors">
            <span className="material-symbols-outlined">event_available</span>
            Booking History
          </Link>
          <Link to="/insights" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors">
            <span className="material-symbols-outlined">trending_up</span>
            Market Insights
          </Link>
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl">
            <Avatar className="w-10 h-10 shadow-sm">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-white font-bold">{user?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{user?.fullName}</p>
              <p className="text-[10px] text-on-surface-variant truncate">Elite Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        <main className="py-12 px-12 max-w-7xl mx-auto text-left">
          {/* Welcome Header */}
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px] mb-2 block">Welcome Back</span>
              <h1 className="text-4xl font-extrabold text-primary tracking-tight">Your Curated Collection, {user?.fullName?.split(' ')[0]}.</h1>
              <p className="text-on-surface-variant mt-2 text-sm">You have {bookings.filter((b:any) => b.booking_status === 'confirmed').length} viewing confirmations.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Saved</span>
                <span className="text-xl font-extrabold text-primary">12</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Viewings</span>
                <span className="text-xl font-extrabold text-secondary">{bookings.length}</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Stream */}
            <div className="lg:col-span-8 space-y-12">
              {/* Saved Homes */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold text-primary">Saved Homes</h2>
                  <Link to="/houses" className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                    Browse All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedHomes.map((house: any) => (
                    <div key={house.houseId} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
                      <div className="h-56 overflow-hidden relative">
                        <img src={house.images?.[0]?.imageUrl} alt={house.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute top-4 right-4 bg-white/95 p-2 rounded-full shadow-md cursor-pointer">
                          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-extrabold text-lg text-primary">{house.title}</h3>
                          <span className="text-secondary font-extrabold text-base">{formatCurrency(house.monthlyRent)}</span>
                        </div>
                        <div className="flex items-center gap-6 text-on-surface-variant text-xs font-semibold border-t border-slate-50 pt-4">
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">bed</span> {house.bedrooms}</span>
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">square_foot</span> {house.square_footage || '2,400'} sqft</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Market Pulse */}
              <section className="bg-surface-container-low rounded-[2rem] p-10 border border-slate-200/50">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-primary mb-4">Market Pulse: Regional Context</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-8">We've noticed a 12% price correction in Nairobi prime areas. Optimal window for negotiation starts this week.</p>
                    <div className="flex gap-4">
                      <div className="bg-white p-5 rounded-2xl flex-1 shadow-sm border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Avg. Price/Sqft</span>
                        <p className="text-lg font-extrabold text-primary">KSh 12,400</p>
                        <p className="text-[10px] text-error font-bold mt-1">-1.2% this mo.</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl flex-1 shadow-sm border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Demand Trend</span>
                        <p className="text-lg font-extrabold text-secondary">+4.2%</p>
                        <p className="text-[10px] text-secondary font-bold mt-1">Increasing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-4 space-y-8">
              <section>
                <h2 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2">
                  Recent Activity
                  <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
                </h2>
                <div className="space-y-4">
                  {bookings.map((b: any) => (
                    <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 w-1 h-full ${b.booking_status === 'confirmed' ? 'bg-secondary' : 'bg-tertiary'}`}></div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-on-surface truncate pr-2">{b.house?.title}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${b.booking_status === 'confirmed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                          {b.booking_status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span> {b.booking_date}
                      </p>
                      {b.payment?.payment_status !== 'completed' && (
                        <div className="space-y-3 pt-2">
                           <div className="flex gap-2">
                              <span className="bg-slate-100 px-2 flex items-center rounded-lg text-[10px] font-bold">+254</span>
                              <Input 
                                className="h-8 text-xs border-none bg-slate-50 rounded-lg" 
                                placeholder="7xx xxx xxx" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                           </div>
                           <Button 
                            onClick={() => handleMpesaPay(b.id)}
                            disabled={payingBookingId === b.id}
                            className="w-full h-8 text-[10px] font-bold bg-[#39B54A] hover:bg-[#2e943c] text-white rounded-lg border-none"
                           >
                            {payingBookingId === b.id ? 'Processing...' : 'Pay with M-Pesa'}
                           </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-sm text-on-surface-variant text-center py-8">No recent activity.</p>
                  )}
                </div>
              </section>

              {/* Profile Completeness */}
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-on-surface">Profile Identity</h3>
                  <span className="text-primary font-extrabold text-sm">85%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: '85%' }}></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-4 leading-relaxed font-medium italic text-left">"Complete your preferences to unlock hyper-accurate recommendations."</p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
