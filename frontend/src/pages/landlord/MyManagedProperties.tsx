import {  } from 'react';
import { useGetHousesQuery, useDeleteHouseMutation } from '../../store/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatCurrency, getHouseImage } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function MyManagedProperties() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  // 1. Fetch only MY managed assets
  const { data: ownedData, isLoading: loadingOwned, refetch } = useGetHousesQuery({ 
    landlordId: user?.userId,
    limit: 50 
  }, { skip: !user?.userId });

  // 2. Fetch global market snapshot (excluding my own if needed, but here we just take a recent sample)
  const { data: marketData, isLoading: loadingMarket } = useGetHousesQuery({ 
    limit: 8,
    status: 'active' 
  });

  const [deleteHouse] = useDeleteHouseMutation();

  const ownedListings = ownedData?.items ?? [];
  const marketListings = marketData?.items ?? [];
  
  const isLoading = loadingOwned || loadingMarket;

  const handleDelete = async (houseId: number) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await deleteHouse(houseId).unwrap();
        toast.success('Property node decommissioned successfully.');
        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to delete property. It might have active bookings.');
      }
    }
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center animate-pulse text-primary font-black uppercase tracking-widest text-[10px]">Synchronizing Assets...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* My Managed Nodes */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black font-headline tracking-tighter text-primary">My Managed Assets</h2>
            <p className="text-on-surface-variant mt-2 font-medium">Exclusive assets under your direct operational authority.</p>
          </div>
          <button 
            onClick={() => navigate('/landlord/create-listing')}
            className="px-8 py-4 bg-primary text-white font-black rounded-full text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Deploy Property Node
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {ownedListings.map((l: any) => (
            <div key={l.houseId} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:-translate-y-2 group">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={getHouseImage(l.images?.[0])} alt={l.title} />
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                  Managed Alpha
                </div>
                {/* Action Layer */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => navigate('/landlord/create-listing', { state: { edit: true, house: l } })}
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-xl" 
                    title="Edit Node"
                  >
                    <span className="material-symbols-outlined text-2xl">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(l.houseId)}
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl" title="Delete Node"
                  >
                    <span className="material-symbols-outlined text-2xl">delete</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black font-headline tracking-tighter text-primary mb-2 group-hover:text-secondary transition-colors">{l.title}</h4>
                <p className="text-on-surface-variant text-xs mb-8 font-bold uppercase tracking-widest flex items-center gap-1">
                   <span className="material-symbols-outlined text-sm">location_on</span>
                   {l.location?.town || 'Nairobi Central'} • {l.houseType}
                </p>
                <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                  <span className="text-2xl font-black text-primary font-headline tracking-tighter">{formatCurrency(l.monthlyRent)}</span>
                  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    l.status === 'active' ? 'bg-secondary/10 text-secondary' :
                    l.status === 'pending_approval' ? 'bg-amber-100 text-amber-600' :
                    l.status === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {l.status === 'active' ? 'Active Yield' : 
                     l.status === 'pending_approval' ? 'Under Review' : 
                     l.status === 'rejected' ? 'Rejected' : 
                     (l.status?.replace('_', ' ') || 'Draft')}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {ownedListings.length === 0 && (
             <div className="md:col-span-3 py-32 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-slate-300">domain</span>
                </div>
                <h3 className="text-2xl font-black text-primary font-headline tracking-tighter mb-2">No property nodes deployed.</h3>
                <p className="text-on-surface-variant font-medium max-w-sm text-center">Deploy your first property node to start generating yield and collecting market intelligence.</p>
                <button 
                  onClick={() => navigate('/landlord/create-listing')}
                  className="mt-8 px-8 py-4 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Create Your First Listing
                </button>
             </div>
          )}
        </div>
      </section>

      {/* Global Market Inventory */}
      <section className="pt-20 border-t border-slate-50">
         <div className="mb-10 text-left">
            <h2 className="text-2xl font-black font-headline tracking-tighter text-slate-400">Market Liquidity Overviews</h2>
            <p className="text-on-surface-variant text-sm font-medium italic">Read-only snapshots of the broader ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {marketListings.slice(0, 8).map((l: any) => (
                <div key={l.houseId} className="bg-white p-6 rounded-3xl border border-slate-50 hover:border-slate-200 transition-all cursor-default">
                   <div className="aspect-square rounded-2xl overflow-hidden mb-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                      <img className="w-full h-full object-cover" src={getHouseImage(l.images?.[0])} alt={l.title} />
                   </div>
                   <h5 className="text-sm font-black text-primary truncate font-headline">{l.title}</h5>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{l.location?.town || 'Nairobi'}</p>
                   <div className="mt-6 flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-100">
                      <span className="text-xs font-black text-primary">{formatCurrency(l.monthlyRent)}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Public Domain</span>
                   </div>
                </div>
             ))}
          </div>
      </section>
    </div>
  );
}
