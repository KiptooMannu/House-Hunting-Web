import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  useGetBookingsQuery, 
  useGetMarketPulseQuery, 
  useGetSavedHousesQuery,
  useGetNeighborhoodTrendsQuery
} from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';

export default function Overview() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const { data: bookings } = useGetBookingsQuery({});
  const { data: realSavedHomes } = useGetSavedHousesQuery();
  const { data: marketTrends } = useGetNeighborhoodTrendsQuery({});
  useGetMarketPulseQuery({});

  const savedHomes = realSavedHomes?.slice(0, 2) ?? [];
  const activeBooking = bookings?.filter((b: any) => b.status === 'confirmed' || b.status === 'pending_payment')?.[0];

  const westlandsTrend = marketTrends?.find((t: any) => t.neighborhood === 'Westlands');
  const kilimaniTrend = marketTrends?.find((t: any) => t.neighborhood === 'Kilimani');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 lg:p-16 text-white text-left">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <img 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
            alt="Luxury Home" 
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl lg:text-5xl font-black font-headline tracking-tighter mb-6">Welcome back, {user?.fullName?.split(' ')[0]}.</h2>
          <p className="text-base lg:text-lg opacity-90 mb-10 font-medium leading-relaxed max-w-lg">
            Your curation has been updated with new matches in Westlands. Ready to find your next legacy property?
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/houses')}
              className="w-full sm:w-auto bg-white text-primary font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-black/20"
            >
              Continue Search
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button 
              onClick={() => navigate('/user/canvas')}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white font-bold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Talk to AI Concierge
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Saved Estates - Gallery (Col 1-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-black font-headline tracking-tighter text-primary">Your Saved Estates</h3>
            <button onClick={() => navigate('/user/saved')} className="text-primary font-bold text-sm hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedHomes.map((house: any) => (
              <div key={house.houseId} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 flex flex-col text-left">
                <div className="h-64 relative overflow-hidden">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    src={house.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"} 
                    alt={house.title} 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                    Hot Listing
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-primary">{house.title}</h4>
                    <span className="text-secondary font-black">{formatCurrency(house.monthlyRent)}</span>
                  </div>
                  <p className="text-on-surface-variant text-xs font-semibold mb-6 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {house.location?.town || 'Nairobi'}, Kenya
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">bed</span> {house.bedrooms} Beds</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">bathtub</span> {house.bathrooms} Baths</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">square_foot</span> {house.square_footage || '2.4k'} sqft</span>
                  </div>
                </div>
              </div>
            ))}
            {savedHomes.length === 0 && (
              <div className="md:col-span-2 py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-on-surface-variant font-medium">Your collection is empty. Start curating today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Widgets (Col 9-12) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Market Pulse Widget */}
          <div className="bg-surface-container-low p-8 rounded-3xl space-y-6 text-left border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary">trending_up</span>
              <h3 className="font-black font-headline text-primary">Market Pulse</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Westlands Avg.</p>
                  <p className="font-black text-primary">{westlandsTrend ? formatCurrency(westlandsTrend.avgRent) : 'KSh 185k'}</p>
                </div>
                <span className="text-secondary text-xs font-bold flex items-center bg-secondary/10 px-2 py-1 rounded-full">+4.2%</span>
              </div>
              <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Kilimani Avg.</p>
                  <p className="font-black text-primary">{kilimaniTrend ? formatCurrency(kilimaniTrend.avgRent) : 'KSh 160k'}</p>
                </div>
                <span className="text-error text-xs font-bold flex items-center bg-error/10 px-2 py-1 rounded-full">-1.8%</span>
              </div>
            </div>
            <button onClick={() => navigate('/Insights')} className="w-full py-3 text-xs font-bold text-primary hover:bg-white rounded-xl transition-all">
              View Detailed Insights
            </button>
          </div>

          {/* Active Bookings Card */}
          <div className="bg-secondary-container p-8 rounded-[2.5rem] relative overflow-hidden text-left shadow-xl shadow-secondary/10">
            <div className="relative z-10">
              <h3 className="font-black font-headline text-on-secondary-container flex items-center gap-2 mb-6 uppercase tracking-widest text-xs">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Booking Status
              </h3>
              {activeBooking ? (
                <>
                  <p className="text-[10px] font-black text-on-secondary-fixed-variant mb-1 uppercase tracking-widest">
                    {activeBooking.status.replace('_', ' ')}
                  </p>
                  <h4 className="font-black text-xl text-on-secondary-container mb-1 truncate">{activeBooking.house?.title || 'Cluster Node'}</h4>
                  <p className="text-sm text-on-secondary-container/70 mb-8 border-t border-on-secondary-container/10 pt-4">
                    Secure verification via GavaConnect™
                  </p>
                </>
              ) : (
                <p className="text-sm text-on-secondary-container/70 mb-8">Ready to curate your next acquisition?</p>
              )}
              <button 
                onClick={() => navigate('/user/bookings')}
                className="w-full bg-on-secondary-container text-white font-black py-4 rounded-2xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs"
              >
                Track History
              </button>
            </div>
            {/* Abstract Decors */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary opacity-20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
