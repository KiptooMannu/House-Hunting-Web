import { useNavigate } from 'react-router-dom';
import { useGetSavedHousesQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';

export default function SavedHomes() {
  const navigate = useNavigate();
  const { data: savedHomes, isLoading } = useGetSavedHousesQuery();

  if (isLoading) return <div className="h-96 flex items-center justify-center animate-pulse text-primary font-black uppercase tracking-widest">Curating Gallery...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black font-headline tracking-tighter text-primary">Your Saved Estates</h2>
          <p className="text-on-surface-variant mt-2 font-medium">A curated selection of legacy-ready properties you've earmarked for review.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-slate-100 text-slate-500 rounded-full font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
             <span className="material-symbols-outlined text-lg">filter_alt</span>
             Filter Collections
           </button>
           <button onClick={() => navigate('/houses')} className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
             Explore More
             <span className="material-symbols-outlined text-lg">add</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {savedHomes.map((house: any) => (
          <div 
            key={house.houseId} 
            className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100"
            onClick={() => navigate(`/houses/${house.houseId}`)}
          >
            <div className="h-72 relative overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                src={house.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e"} 
                alt={house.title} 
              />
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                 <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter text-primary">Premium</span>
                 <span className="bg-secondary/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter text-white">Verified</span>
              </div>
            </div>
            <div className="p-8">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="text-xl font-black font-headline text-primary group-hover:text-secondary transition-colors">{house.title}</h3>
                 <p className="text-lg font-black text-primary">{formatCurrency(house.monthlyRent)}</p>
               </div>
               <p className="text-on-surface-variant text-sm font-semibold mb-8 flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">location_on</span>
                 {house.location?.county}, Kenya
               </p>
               <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                 <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">bed</span> {house.bedrooms}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">bathtub</span> {house.bathrooms}</span>
                 </div>
                 <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                   Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {savedHomes.length === 0 && (
         <div className="py-32 flex flex-col items-center justify-center bg-surface-container-low rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-300">favorite</span>
            </div>
            <h3 className="text-2xl font-black text-primary font-headline tracking-tighter mb-2">Your collection is empty.</h3>
            <p className="text-on-surface-variant font-medium max-w-sm text-center">Start adding homes to your collection to compare and book viewings seamlessly.</p>
            <button onClick={() => navigate('/houses')} className="mt-8 px-8 py-4 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">Explore Marketplace</button>
         </div>
      )}
    </div>
  );
}
