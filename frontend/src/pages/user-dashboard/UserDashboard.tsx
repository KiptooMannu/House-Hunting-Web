import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';
import type { RootState } from '../../store';
import { 
  useGetBookingsQuery, 
  useGetHousesQuery, 
  useGetProfileQuery 
} from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: profileData } = useGetProfileQuery(undefined);
  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery({});
  const { data: housesData, isLoading: housesLoading } = useGetHousesQuery({ page: 1, limit: 10 });

  const profile = profileData?.user ?? user;
  const bookings = bookingsData ?? [];
  const houses = housesData?.items ?? [];
  
  // Simulate "Saved" houses by taking a few from the list
  const savedHomes = houses.slice(0, 2);
  const featuredHouse = houses[2] || houses[0];

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  if (bookingsLoading || housesLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col">
          <div className="p-8">
            <div className="text-xl font-bold tracking-tight text-primary font-headline">
              Estate Curator
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary-fixed rounded-xl" to="/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors" to="/houses">
              <span className="material-symbols-outlined">favorite</span>
              Saved Homes
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors" to="/my-bookings">
              <span className="material-symbols-outlined">event_available</span>
              Booking History
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors" to="#">
              <span className="material-symbols-outlined">chat_bubble</span>
              Messages
              <span className="ml-auto bg-error text-white text-[10px] px-2 py-0.5 rounded-full">3</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors" to="/insights">
              <span className="material-symbols-outlined">trending_up</span>
              Market Insights
            </Link>
            <div className="pt-8 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferences</div>
            <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors" to="/profile">
              <span className="material-symbols-outlined">settings</span>
              Account Settings
            </Link>
          </nav>
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl">
              <Avatar className="w-10 h-10 shadow-sm">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-white font-bold">{user?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-xs font-bold text-on-surface truncate">{user?.fullName}</p>
                <p className="text-[10px] text-on-surface-variant truncate">Elite Member</p>
              </div>
              <span onClick={handleLogout} className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-error transition-colors">logout</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 ml-72">
          {/* Top Nav Shell */}
          <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
            <div className="flex justify-between items-center px-12 h-20">
              <div className="flex items-center gap-8">
                <div className="relative w-96">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
                  <input className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search saved listings..." type="text" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">notifications</span>
                </div>
                <button onClick={() => navigate('/houses')} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg active:scale-95 duration-200">
                  Book Viewing
                </button>
              </div>
            </div>
          </nav>

          <main className="py-12 px-12 max-w-7xl mx-auto text-left">
            {/* Welcome Header */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="max-w-2xl">
                <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px] mb-2 block">Welcome Back</span>
                <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Your Curated Collection, {user?.fullName?.split(' ')[0]}.</h1>
                <p className="text-on-surface-variant mt-2 text-sm">You have {bookings.filter((b:any) => b.booking_status === 'pending').length} pending viewing confirmations.</p>
              </div>
              {/* Mini Stats */}
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
              {/* Main Stream (8 cols) */}
              <div className="lg:col-span-8 space-y-12">
                {/* Saved Homes */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-extrabold text-primary font-headline">Saved Homes</h2>
                    <button onClick={() => navigate('/houses')} className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                      Browse All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedHomes.map((house: any) => (
                      <div key={house.houseId} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
                        <div className="h-56 overflow-hidden relative">
                          <img src={house.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600"} alt={house.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute top-4 right-4 bg-white/95 p-2 rounded-full shadow-md cursor-pointer">
                            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                          </div>
                          <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            Hot Listing
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-extrabold text-lg text-primary">{house.title}</h3>
                            <span className="text-secondary font-extrabold text-base">{formatCurrency(house.monthlyRent)}</span>
                          </div>
                          <div className="flex items-center gap-6 text-on-surface-variant text-xs font-semibold border-t border-slate-50 pt-4">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">bed</span> {house.bedrooms}</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">bathtub</span> {house.bathrooms || 1}</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">square_foot</span> 3,200 sqft</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Market Pulse Section */}
                <section className="bg-surface-container-low rounded-[2rem] p-10 border border-slate-200/50">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1">
                      <h2 className="text-2xl font-extrabold text-primary mb-4 font-headline">Market Pulse: Your Interest Areas</h2>
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

              {/* Side Stream (4 cols) */}
              <div className="lg:col-span-4 space-y-8">
                {/* Recent Activity Feed */}
                <section>
                  <h2 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2 font-headline">
                    Recent Activity
                    <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
                  </h2>
                  <div className="space-y-4">
                    {bookings.slice(0, 2).map((b: any) => (
                      <div key={b.bookingId} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 w-1 h-full ${b.status === 'confirmed' ? 'bg-secondary' : 'bg-tertiary'}`}></div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-on-surface truncate pr-2">{b.house?.title || 'Property Viewing'}</h4>
                          <span className={`bg-secondary-container text-on-secondary-container text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span> {b.moveInDate || 'Oct 24, 14:00 PM'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Booking Fee Verified
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-xs text-on-surface-variant italic">No recent activity found.</p>}
                  </div>
                </section>

                {/* Curated Recommendation */}
                <section className="bg-primary text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-primary/30 text-left">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-secondary-container flex items-center justify-center rounded-xl rotate-3">
                        <span className="material-symbols-outlined text-on-secondary-container">auto_awesome</span>
                      </div>
                      <h2 className="text-xl font-extrabold tracking-tight font-headline text-white">AI Curator Pick</h2>
                    </div>
                    <p className="text-primary-fixed/80 text-xs mb-8 leading-relaxed">Based on your interest in "{(profile as any)?.preferences || 'Modern living spaces'}".</p>
                    {featuredHouse && (
                      <div onClick={() => navigate(`/houses/${featuredHouse.houseId}`)} className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                            <img className="w-full h-full object-cover" src={featuredHouse.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200"} alt="Garden House" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm group-hover:text-secondary-fixed-dim transition-colors text-white">{featuredHouse.title}</h4>
                            <p className="text-[10px] text-primary-fixed-dim mt-0.5">{formatCurrency(featuredHouse.monthlyRent)} • {featuredHouse.location?.county}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => navigate('/chatbot')} className="mt-8 w-full bg-white text-primary py-4 rounded-2xl font-extrabold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                      Talk to Assistant
                    </button>
                  </div>
                  {/* Decor */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container rounded-full blur-[80px] opacity-30"></div>
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-container rounded-full blur-[80px] opacity-20"></div>
                </section>

                {/* Profile Completion */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-on-surface">Profile Identity</h3>
                    <span className="text-primary font-extrabold text-sm">85%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-4 leading-relaxed font-medium italic">"Complete your preferences to unlock hyper-accurate recommendations."</p>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
