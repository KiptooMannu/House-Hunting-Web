import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { useGetProfileQuery, useGetBookingsQuery, useGetHousesQuery } from '../../store/apiSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserProfile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: profileData } = useGetProfileQuery(undefined);
  const { data: bookingsData } = useGetBookingsQuery({});
  const { data: housesData } = useGetHousesQuery({});

  const profile = profileData?.user ?? user;
  const bookings: any[] = bookingsData?.items ?? [];
  const houses: any[] = housesData?.items?.slice(0, 3) ?? [];

  // Display beautiful status badges
  const statusColors: Record<string, string> = {
    confirmed: 'bg-secondary-container/30 text-secondary',
    pending_payment: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    cancelled: 'bg-error-container text-on-error-container',
    expired: 'bg-surface-container text-on-surface-variant',
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-0">
      <main className="max-w-screen-2xl mx-auto px-6 py-12 md:py-16">

        {/* Profile Hero */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <span className="text-secondary font-semibold tracking-widest uppercase text-xs mb-4 block">
              Personal Curator
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter text-primary leading-none mb-6">
              Welcome back,<br />
              {(profile as any)?.fullName ?? (profile as any)?.fullname ?? 'User'}
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
              Managing your real estate journey from Kenya. Review your bookings and saved properties below.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <div className="relative group">
              <div className="absolute -inset-4 bg-secondary-container opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity" />
              <Avatar className="relative w-32 h-32 md:w-48 md:h-48 border-4 border-white shadow-xl">
                <AvatarImage src={(profile as any)?.profileImage} />
                <AvatarFallback className="text-4xl font-bold bg-primary text-white">
                  {((profile as any)?.fullName ?? (profile as any)?.fullname ?? 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-surface-container-low rounded-3xl p-8">
              <h3 className="font-headline font-bold text-xl mb-6">Account Settings</h3>
              <nav className="space-y-2">
                {[
                  { icon: 'person', label: 'Personal Info', active: true },
                  { icon: 'security', label: 'Security', active: false },
                  { icon: 'payments', label: 'Payment Methods', active: false },
                  { icon: 'notifications_active', label: 'Notifications', active: false },
                ].map((item) => (
                  <a key={item.label}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer ${item.active
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                    href="#">
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
              <div className="mt-12 pt-8 border-t border-outline-variant/20">
                <button onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 w-full text-error font-medium">
                  <span className="material-symbols-outlined">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-20">

            {/* Saved Homes (from houses API) */}
            <section>
              <div className="flex justify-between items-baseline mb-8">
                <h2 className="text-3xl font-headline font-bold text-primary">Discover Properties</h2>
                <Link to="/houses" className="text-secondary font-semibold text-sm hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured large card */}
                {houses[0] && (
                  <Link to={`/houses/${houses[0].houseId}`}
                    className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[21/9] overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        src={houses[0].images?.[0]?.imageUrl ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf64eskp_FZj36QQXcqBMUzMP1U9Qr4S7Qb5zmKaBMPoElEnH8mAF248JADxYTVF_KVAHEjYLUIiQ3PCAGy2aOERsXv4-VkpRkE3GCzdH-iBvfbbVUTOEaFb-0b_AIC46lNFPVwizMVEGtMIBXWiDCFbAjS-pYpe22wIxv-i0SKegmYKWmVqGnS74nCzwdcDKK-1RQqbxyXM5F2Uk6xZ02pWjr1RYvTZgFrCDCZzbwjlky-7Z4DcrlD3WeELNno0nERzxr5NBZrrU'}
                        alt={houses[0].title}
                      />
                    </div>
                    <div className="p-8 flex justify-between items-end">
                      <div>
                        <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full mb-3 uppercase tracking-widest">
                          Featured
                        </span>
                        <h4 className="text-2xl font-headline font-bold text-primary">{houses[0].title}</h4>
                        <p className="text-on-surface-variant">
                          {houses[0].location?.neighborhood ?? ''}{houses[0].location ? ', ' : ''}{houses[0].location?.county ?? ''} • {houses[0].bedrooms} Bedrooms
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          KES {Number(houses[0].monthlyRent).toLocaleString('en-KE')}
                        </span>
                        <span className="block text-sm text-on-surface-variant">/month</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Secondary cards */}
                {houses.slice(1, 3).map((h: any) => (
                  <Link key={h.houseId} to={`/houses/${h.houseId}`}
                    className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        src={h.images?.[0]?.imageUrl ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT2Ojc3KO1uGaSM9kALCb8pJy8f5-HqcM2IPXzaAy0ackhSM6hk7_vebPnZXuth3eFH_5A9HyotS63A_nLvY5NG-cjN0b1peCYQydeu49N-1-iUlp6nbocw9GFFon2frN0VcTSsZFihRnGvTyWx3iLOdIT84BgRX7QAoQ0vLwE8V6C_KjDYVXzLphD5X4PzeLxruWR0q-z8cCm4-OANpvTg14gO_d6mcsj_IH_9ErXMk_J7EDzuU-KXkxJhQZLJVf52PtWpRMOk-Y'}
                        alt={h.title}
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-headline font-bold text-primary">{h.title}</h4>
                      <p className="text-sm text-on-surface-variant mb-4">
                        {h.location?.neighborhood ?? ''}{h.location ? ', ' : ''}{h.location?.county ?? ''} • {h.bedrooms} Bedrooms
                      </p>
                      <p className="font-bold text-lg text-primary">
                        KES {Number(h.monthlyRent).toLocaleString('en-KE')}
                        <span className="text-sm text-on-surface-variant font-normal">/mo</span>
                      </p>
                    </div>
                  </Link>
                ))}

                {houses.length === 0 && (
                  <div className="md:col-span-2 py-20 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl mb-4 block">domain</span>
                    <p className="font-medium">No properties found yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Booking History */}
            <section>
              <div className="flex justify-between items-baseline mb-8">
                <h2 className="text-3xl font-headline font-bold text-primary">Booking History</h2>
                <span className="text-on-surface-variant text-sm font-medium">
                  {bookings.length} Transaction{bookings.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-4">
                {bookings.slice(0, 5).map((b: any) => (
                  <div key={b.bookingId}
                    className="bg-surface-container-low rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                        {b.house?.images?.[0]?.imageUrl ? (
                          <img className="w-full h-full object-cover"
                            src={b.house.images[0].imageUrl} alt={b.house.title} />
                        ) : (
                          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">home_work</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-primary">{b.house?.title ?? 'Property'}</h4>
                        <p className="text-sm text-on-surface-variant">
                          Booked {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end md:space-x-12">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Booking Fee</p>
                        <p className="font-mono text-sm font-bold text-primary">
                          KES {Number(b.bookingFee).toLocaleString('en-KE')}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusColors[b.status] ?? 'bg-surface-container text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-sm">
                          {b.status === 'confirmed' ? 'check_circle' : b.status === 'pending_payment' ? 'schedule' : 'cancel'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider capitalize">
                          {b.status?.replace('_', ' ') ?? 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="py-20 text-center text-on-surface-variant bg-surface-container-low rounded-3xl">
                    <span className="material-symbols-outlined text-5xl mb-4 block">calendar_today</span>
                    <p className="font-medium">No bookings yet. Start exploring properties!</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl shadow-2xl z-50 rounded-t-3xl">
        <Link to="/houses" className="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Home</span>
        </Link>
        <Link to="/insights" className="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Insights</span>
        </Link>
        <Link to="/my-bookings" className="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
          <span className="material-symbols-outlined">favorite</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Bookings</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center bg-blue-50 text-blue-950 rounded-2xl px-5 py-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
