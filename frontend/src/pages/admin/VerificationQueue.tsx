import { useGetHousesQuery, useApproveHouseMutation, useRejectHouseMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';

export default function VerificationQueue() {
  const { data, isLoading, refetch } = useGetHousesQuery({ status: 'pending_approval' });
  const [approveHouse, { isLoading: isApproving }] = useApproveHouseMutation();
  const [rejectHouse, { isLoading: isRejecting }] = useRejectHouseMutation();

  const handleApprove = async (houseId: number) => {
    try {
      await approveHouse(houseId).unwrap();
      toast.success('Listing authorized and activated.');
      refetch();
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to authorize listing.');
    }
  };

  const handleReject = async (houseId: number) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    
    try {
      await rejectHouse({ houseId, reason }).unwrap();
      toast.success('Listing rejected.');
      refetch();
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to reject listing.');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const pendingHouses = data?.items || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-secondary font-bold text-xs tracking-widest uppercase">Institutional Gatekeeper</span>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1 text-primary font-headline">Pending Approvals</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl font-body leading-relaxed">
            Verify and authorize new property listings. Ensure all documentation and asset details meet Savanna Horizon's institutional standards before publication.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-4 border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-black">In Queue</span>
              <span className="text-xl font-black text-primary">{pendingHouses.length} Assets</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary font-black">SLA Status</span>
              <span className="text-xl font-black text-secondary">Within 4h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout for Pending Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pendingHouses.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-slate-200">check_circle</span>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">All clear! No pending authorizations.</p>
          </div>
        ) : (
          pendingHouses.map((house: any) => (
            <div key={house.houseId} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-50 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src={house.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                  alt={house.title} 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Review</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-primary text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg">
                  {house.location?.town || 'Unknown Location'}
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-xl text-primary leading-tight group-hover:text-blue-700 transition-colors uppercase tracking-tight">{house.title}</h3>
                    <span className="text-xs font-bold text-slate-400 font-mono">#{house.houseId}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold line-clamp-2 leading-relaxed">{house.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Landlord</p>
                    <p className="font-black text-sm text-primary uppercase truncate">{house.landlord?.fullName || `ID-${house.landlordId}`}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rent Proposed</p>
                    <p className="font-black text-sm text-secondary tracking-tight">KSh {house.monthlyRent?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 mt-auto">
                  <button 
                    onClick={() => handleApprove(house.houseId)}
                    disabled={isApproving || isRejecting}
                    className="w-full bg-primary text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    Authorize Listing
                  </button>
                  <button 
                    onClick={() => handleReject(house.houseId)}
                    disabled={isApproving || isRejecting}
                    className="w-full bg-white text-error border-2 border-error/10 font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-error/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-solid cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                    Reject & Notify
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest pt-8 border-t border-slate-100">
        <p>© 2024 Savanna Horizon Institutional Module. Confidential.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Protocol v9.4</a>
          <a href="#" className="hover:text-primary transition-colors">Authorization Policy</a>
        </div>
      </div>
    </div>
  );
}
