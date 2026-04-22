import { useParams, useNavigate } from 'react-router-dom';
import { useListUsersQuery, useGetHousesQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import { format } from 'date-fns';

export default function LandlordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch user details (filtered by ID)
  const { data: userData, isLoading: userLoading } = useListUsersQuery({ userId: id });
  const landlord = userData?.items?.[0];
  
  // Fetch their properties
  const { data: propertiesData, isLoading: propsLoading } = useGetHousesQuery({ landlordId: id });
  const properties = propertiesData?.items || [];

  if (userLoading) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-primary">Loading Dossier...</div>;
  if (!landlord) return <div className="p-20 text-center font-black text-error uppercase">Landlord record not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Quick Actions */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">User Details</span>
            <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">{landlord.fullName}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl bg-slate-100 text-primary font-black text-[10px] uppercase tracking-widest border-none hover:bg-slate-200 transition-all cursor-pointer">Edit</button>
          <button className="px-6 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest border-none shadow-lg hover:scale-105 transition-all cursor-pointer">Send Message</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity & Compliance */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-lg">fingerprint</span> Basic Info
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="font-bold text-primary">{landlord.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                <p className="font-bold text-primary">{landlord.phone || '+254 --- --- ---'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax ID (KRA)</p>
                <p className={`font-black tracking-widest ${landlord.kraPin ? 'text-primary' : 'text-error animate-pulse'}`}>
                  {landlord.kraPin || 'NOT ADDED YET'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined On</p>
                <p className="font-bold text-primary">{format(new Date(landlord.createdAt), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">Total Earnings</h3>
            <p className="text-4xl font-black tracking-tighter mb-2">{formatCurrency(landlord.totalRevenue || 0)}</p>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Money earned on site</p>
          </div>
        </div>

        {/* Right Column: Property Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                 <span className="material-symbols-outlined text-lg">domain</span> Portfolio Assets ({properties.length})
              </h3>
              <button onClick={() => navigate(`/admin/properties?landlordId=${id}`)} className="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline cursor-pointer">View All Search</button>
            </div>

            {propsLoading ? (
              <p className="text-center py-20 text-slate-400 font-bold italic">Scanning database for assets...</p>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem]">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">other_houses</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No properties registered to this profile</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.slice(0, 4).map((prop: any) => (
                  <div key={prop.houseId} className="group p-4 rounded-[1.5rem] bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl bg-slate-200 overflow-hidden shrink-0 shadow-inner">
                       {prop.images?.[0] && <img src={prop.images[0].imageUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-primary uppercase truncate text-sm">{prop.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold mb-2">{prop.location?.town || 'Unknown Location'}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        prop.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
