import { useGetHousesQuery, useRevokeHouseMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Toggle } from "@/components/ui/toggle";
import { useState } from 'react';

export default function AdminManagedProperties() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { data, isLoading, refetch } = useGetHousesQuery({ status: 'active' });
  const [revokeHouse, { isLoading: isRevoking }] = useRevokeHouseMutation();

  const handleRevoke = async (houseId: number) => {
    const reason = window.prompt('Provide a reason for revoking approval (this will move the house back to pending status):');
    if (reason === null) return;
    
    try {
      await revokeHouse({ houseId, reason }).unwrap();
      toast.success('Listing authorization revoked. Asset moved to pending queue.');
      refetch();
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to revoke authorization.');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const houses = data?.items || [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">Institutional Inventory</span>
          <h2 className="text-4xl font-black tracking-tight text-primary font-headline uppercase tracking-tighter">Managed Properties</h2>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed text-sm font-bold">
            Comprehensive oversight of all active property assets across the network. Manage visibility and institutional compliance.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low px-6 py-4 rounded-3xl flex items-center gap-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-slate-400">Total Portfolio</span>
              <span className="text-2xl font-black text-primary">{houses.length} Units</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-secondary">Health Status</span>
              <span className="text-2xl font-black text-secondary">Optimal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table View for Detailed Data */}
      <section className="bg-white rounded-[2rem] p-10 overflow-hidden border border-slate-50 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-black tracking-tighter text-primary uppercase">Granular Performance Index</h3>
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
              <Toggle 
                pressed={viewMode === 'table'} 
                onPressedChange={() => setViewMode('table')}
                size="sm"
                className="data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm rounded-xl border-none h-10 w-10 p-0 flex items-center justify-center transition-all bg-transparent"
              >
                <span className="material-symbols-outlined text-xl">table_rows</span>
              </Toggle>
              <Toggle 
                pressed={viewMode === 'cards'} 
                onPressedChange={() => setViewMode('cards')}
                size="sm"
                className="data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm rounded-xl border-none h-10 w-10 p-0 flex items-center justify-center transition-all bg-transparent"
              >
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </Toggle>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-3 rounded-2xl bg-surface-container-low text-slate-600 hover:text-primary transition-all border-none cursor-pointer">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="p-3 rounded-2xl bg-surface-container-low text-slate-600 hover:text-primary transition-all border-none cursor-pointer">
              <span className="material-symbols-outlined">print</span>
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-6 py-2">Property Identity</th>
                  <th className="px-6 py-2">Location</th>
                  <th className="px-6 py-2">Landlord ID</th>
                  <th className="px-6 py-2 text-center">Status</th>
                  <th className="px-6 py-2 text-right">Revenue (KSh)</th>
                  <th className="px-6 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {houses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs"> No active properties found in the registry. </td>
                  </tr>
                ) : (
                  houses.map((house: any) => (
                    <tr key={house.houseId} className="bg-slate-50/50 rounded-2xl group hover:shadow-lg hover:bg-white transition-all duration-300">
                      <td className="px-6 py-5 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner">
                            <img 
                              className="w-full h-full object-cover" 
                              src={house.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
                              alt={house.title} 
                            />
                          </div>
                          <div>
                            <p className="font-black text-primary text-base tracking-tight uppercase">{house.title}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{house.houseType} • ID-{house.houseId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-600 border-y border-transparent group-hover:border-slate-100">{house.location?.town || 'Unknown'}</td>
                      <td className="px-6 py-5 text-sm font-black text-primary border-y border-transparent group-hover:border-slate-100 uppercase">{house.landlord?.fullName || `LL-${house.landlordId}`}</td>
                      <td className="px-6 py-5 text-center border-y border-transparent group-hover:border-slate-100">
                        <span className="bg-secondary/10 text-secondary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Active</span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-base text-primary tracking-tighter border-y border-transparent group-hover:border-slate-100">
                        {Number(house.monthlyRent).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center last:rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                              onClick={() => navigate(`/houses/${house.houseId}`)}
                              className="p-2 text-slate-400 hover:text-primary transition-colors border-none bg-transparent cursor-pointer"
                           >
                             <span className="material-symbols-outlined text-xl">visibility</span>
                           </button>
                           <button 
                             onClick={() => handleRevoke(house.houseId)}
                             disabled={isRevoking}
                             className="p-2 text-slate-400 hover:text-error transition-colors border-none bg-transparent cursor-pointer group/btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             <span className="material-symbols-outlined text-xl">{isRevoking ? 'sync' : 'block'}</span>
                             <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/btn:block">
                               {isRevoking ? 'Revoking...' : 'Revoke'}
                             </span>
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses.map((house: any) => (
              <div key={house.houseId} className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 shadow-sm">
                   <img 
                    src={house.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="" 
                   />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
                      <p className="text-xs font-black text-primary tracking-tighter uppercase">KSh {Number(house.monthlyRent).toLocaleString()}</p>
                   </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-primary uppercase tracking-tight">{house.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{house.location?.town} • {house.houseType}</p>
                  </div>
                  <div className="flex justify-between items-center py-4 border-y border-slate-100">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">{house.landlord?.fullName?.charAt(0)}</div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{house.landlord?.fullName}</span>
                     </div>
                     <span className="bg-secondary/10 text-secondary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Verified Active</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/houses/${house.houseId}`)}
                      className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      View Node
                    </button>
                    <button 
                      onClick={() => handleRevoke(house.houseId)}
                      disabled={isRevoking}
                      className="w-14 h-14 bg-error/5 text-error rounded-2xl flex items-center justify-center hover:bg-error hover:text-white transition-all border-none cursor-pointer disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined ${isRevoking ? 'animate-spin' : ''}`}>
                        {isRevoking ? 'sync' : 'block'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing 1-{houses.length} of {houses.length} Units</p>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary text-white font-black text-xs shadow-lg shadow-primary/20 border-none cursor-pointer">1</button>
            <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
