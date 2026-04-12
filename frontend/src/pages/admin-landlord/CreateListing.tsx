import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateHouseMutation, useUpdateHouseMutation } from '../../store/apiSlice';
import { logout as logoutAction } from '../../store/authSlice';
import { Button } from '@/components/ui/button';
import type { RootState } from '../../store';

const HOUSE_TYPES = [
  'Apartment', 'Penthouse', 'Villa', 'Townhouse', 'Mansion', 'Bungalow', 'Bedsitter', 'Studio'
];

const LOCATIONS = [
  'Nairobi - Westlands', 'Nairobi - Karen', 'Mombasa - Nyali', 'Nairobi - Runda', 'Mombasa - Diani', 'Nairobi - Kilimani', 'Nairobi - Lavington'
];

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'High-Speed WiFi', icon: 'wifi' },
  { id: 'security', label: '24/7 Security', icon: 'security' },
  { id: 'parking', label: 'Private Parking', icon: 'local_parking' },
  { id: 'pool', label: 'Infinity Pool', icon: 'pool' },
  { id: 'gym', label: 'Pro Gym', icon: 'fitness_center' },
  { id: 'power', label: 'Back-up Power', icon: 'bolt' },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const isEdit = state?.edit;
  const houseData = state?.house;

  const [createHouse, { isLoading: creating }] = useCreateHouseMutation();
  const [updateHouse, { isLoading: updating }] = useUpdateHouseMutation();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: houseData?.title || '',
    description: houseData?.description || '',
    houseType: houseData?.houseType || '',
    location: houseData?.location?.town || houseData?.town || '',
    rent: houseData?.monthlyRent || '',
    bedrooms: houseData?.bedrooms || 1,
    bathrooms: houseData?.bathrooms || 1,
    amenities: houseData?.amenities || [],
    titleDeed: houseData?.titleDeed || '',
    kraPin: houseData?.kraPin || '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const imagePreviews = useMemo(
    () => imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [imageFiles]
  );

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await updateHouse({
          id: houseData.houseId,
          title: form.title,
          description: form.description,
          houseType: form.houseType,
          monthlyRent: Number(form.rent),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          amenities: form.amenities,
          location: {
            town: form.location,
            county: form.location.split(' - ')[0] || 'Nairobi'
          }
        }).unwrap();
      } else {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('houseType', form.houseType);
        fd.append('rent', String(form.rent));
        fd.append('bedrooms', String(form.bedrooms));
        fd.append('bathrooms', String(form.bathrooms));
        fd.append('county', form.location.split(' - ')[0] || 'Nairobi');
        fd.append('locationName', form.location);
        
        form.amenities.forEach((a: string) => fd.append('amenities[]', a));
        imageFiles.forEach((file) => fd.append('images', file));

        await createHouse(fd).unwrap();
      }
      navigate('/landlord/overview');
    } catch (err: any) {
        setError(err?.data?.message || err?.data?.error || 'Failed to save house listing.');
    }
  }

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <div className="bg-surface text-on-surface flex min-h-screen font-body text-left">
      {/* SideNavBar Component */}
      <aside className="hidden md:flex flex-col py-6 h-screen w-64 fixed left-0 top-0 z-50 bg-slate-100 border-r border-slate-200/20">
        <div className="px-6 mb-10">
          <h1 className="text-lg font-black text-blue-900">Estate Manager</h1>
          <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest mt-1">Premium Tier</p>
        </div>
        <nav className="flex-1 space-y-1">
          <button onClick={() => navigate('/landlord/overview')} className="w-full flex items-center gap-3 px-6 py-3 text-slate-600 hover:text-blue-900 hover:translate-x-1 transition-all duration-200">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-manrope text-base">Overview</span>
          </button>
          <button onClick={() => navigate('/landlord/bookings')} className="w-full flex items-center gap-3 px-6 py-3 text-slate-600 hover:text-blue-900 hover:translate-x-1 transition-all duration-200">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-manrope text-base">Bookings</span>
          </button>
          <button onClick={() => navigate('/landlord/properties')} className="w-full flex items-center gap-3 px-6 py-3 text-blue-900 font-semibold bg-white rounded-lg mx-2 scale-95 transition-all">
            <span className="material-symbols-outlined">domain</span>
            <span className="font-manrope text-base">My Listings</span>
          </button>
          <button onClick={() => navigate('/landlord/compliance')} className="w-full flex items-center gap-3 px-6 py-3 text-slate-600 hover:text-blue-900 hover:translate-x-1 transition-all duration-200">
            <span className="material-symbols-outlined">verified_user</span>
            <span className="font-manrope text-base">Compliance</span>
          </button>
        </nav>
        <div className="px-4 mt-auto pt-6 border-t border-slate-200/10">
          <button onClick={() => navigate('/landlord/profile')} className="w-full flex items-center gap-3 px-6 py-3 text-slate-600 hover:text-blue-900 hover:translate-x-1 transition-all duration-200">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-manrope text-base">Settings</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 mt-2">
            <span className="material-symbols-outlined font-variation-fill">logout</span>
            <span className="font-manrope text-base">Term Session</span>
          </button>
          <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border border-white">
              <img 
                alt="Agent Profile" 
                className="w-full h-full object-cover" 
                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuC4eE-bEm-fsSAf8ilLjcX9QA36oV_ZBIPtQJNEZIjUtrB7ED1UocXncGZEYwtvJGHxltdMHTJ-3wB_-0tSvIzU6j85c5tJESJo2csnnVpHoRKr1IoYJhNA9Sm4QtV9qxt1u0R5r0PQvVxZxX1Jx8w6nN5_YABFwdIMs5JoGYCQrM6i7hUmkoFEC4QNzsYrR4M5lnEYK-dxsgtHt5bzBs5_UwtuWx2-w582LBVv6GAkayCOzsD_VWd8YFFkCvCCxv_O1-WGLTlCKBI"}
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.fullName || 'James Mwangi'}</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-black">Listing Agent</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 bg-surface min-h-screen pb-20">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center px-8 h-16 w-full bg-slate-50/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-blue-900">Modern Estate Curator</span>
            <div className="hidden lg:flex items-center bg-surface-container-high px-4 py-2 rounded-full w-96 border border-slate-100">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input className="bg-transparent border-none text-xs w-full focus:ring-0 placeholder:text-outline ml-2 font-bold" placeholder="Search curated properties..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-500 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button onClick={() => navigate('/landlord/profile')} className="p-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-500">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>

        <section className="max-w-5xl mx-auto px-8 py-12">
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">
               {isEdit ? 'Refine Listing' : 'Create New Listing'}
            </h2>
            <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">Showcase your property to our network of high-net-worth investors. Follow the editorial guidelines to ensure maximum engagement.</p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-2">
               <span className="material-symbols-outlined">error</span>
               <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section 1: Editorial Details */}
            <div className="bg-surface-container-low rounded-3xl p-10 space-y-8 border border-slate-50 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">1</div>
                <h3 className="text-xl font-bold text-primary font-headline">Core Property Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Property Title</label>
                  <input 
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-primary font-bold placeholder:text-outline-variant focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner" 
                    placeholder="e.g. The Sapphire Penthouse, Westlands" 
                    type="text"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">House Type</label>
                  <select 
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-primary font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 shadow-inner"
                    value={form.houseType}
                    onChange={e => setForm({...form, houseType: e.target.value})}
                  >
                    <option value="">Select Type</option>
                    {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Location / Suburb</label>
                  <select 
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-primary font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 shadow-inner"
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                  >
                    <option value="">Select Location</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Listing Price (KSh)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs">KSh</span>
                    <input 
                      className="w-full bg-surface-container-lowest border-none rounded-xl p-4 pl-14 text-primary font-black placeholder:text-outline-variant focus:ring-4 focus:ring-primary/5 shadow-inner" 
                      placeholder="0.00" 
                      type="number"
                      value={form.rent}
                      onChange={e => setForm({...form, rent: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Editorial Description</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border-none rounded-xl p-6 text-primary font-bold placeholder:text-outline-variant resize-none focus:ring-4 focus:ring-primary/5 shadow-inner" 
                  placeholder="Describe the narrative of the property. Focus on materials, views, and unique character..." 
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* Section 2: Visual Curation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-surface-container-low rounded-3xl p-10 space-y-6 border border-slate-50 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">2</div>
                  <h3 className="text-xl font-bold text-primary font-headline">Media Library</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <label className="aspect-square bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-primary-fixed/30 transition-all shadow-inner">
                    <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">add_a_photo</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Upload Cover</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setImageFiles(prev => [...prev, ...files].slice(0, 5));
                      }} 
                    />
                  </label>
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="aspect-square bg-surface-container-lowest rounded-2xl overflow-hidden group relative shadow-md">
                      <img alt="Property Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={p.url} />
                      <button 
                         type="button"
                         onClick={() => setImageFiles(prev => prev.filter(f => f !== p.file))}
                         className="absolute top-2 right-2 bg-error text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-on-surface-variant italic font-black uppercase tracking-widest opacity-60">High-resolution JPEG/PNG only. Recommended size: 2400x1600px.</p>
              </div>
              <div className="bg-primary rounded-3xl p-10 text-on-primary space-y-6 flex flex-col justify-center relative overflow-hidden group shadow-2xl">
                {/* Decorative Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10 text-center lg:text-left">
                  <span className="material-symbols-outlined text-4xl mb-6 text-secondary bg-white/10 p-4 rounded-3xl">auto_awesome</span>
                  <h4 className="text-2xl font-black mb-4 font-headline tracking-tighter italic">Editorial AI Assist</h4>
                  <p className="text-sm opacity-80 leading-relaxed font-body font-medium italic">Our curator AI can help refine your description to match the "Modern Estate" tone. Enable to auto-enhance your copy.</p>
                  <button type="button" className="mt-8 w-full bg-white text-primary font-black py-4 rounded-full hover:bg-primary-fixed hover:-translate-y-1 active:scale-95 transition-all shadow-2xl uppercase tracking-widest text-[10px]">Refine Description</button>
                </div>
              </div>
            </div>

            {/* Section 3: Amenities & Specifications */}
            <div className="bg-surface-container-low rounded-3xl p-10 space-y-8 border border-slate-50 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">3</div>
                <h3 className="text-xl font-bold text-primary font-headline">Features & Amenities</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {AMENITY_OPTIONS.map(amenity => (
                  <label key={amenity.id} className="group cursor-pointer">
                    <input 
                       type="checkbox" 
                       className="hidden peer" 
                       checked={form.amenities.includes(amenity.label)}
                       onChange={() => toggleAmenity(amenity.label)}
                    />
                    <div className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest rounded-2xl peer-checked:bg-secondary-container peer-checked:text-on-secondary-container transition-all shadow-sm border border-transparent peer-checked:border-secondary/20 hover:scale-105 active:scale-95">
                      <span className="material-symbols-outlined text-2xl">{amenity.icon}</span>
                      <span className="text-[10px] font-black text-center uppercase tracking-widest">{amenity.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 4: GavaConnect Compliance */}
            <div className="bg-white border-4 border-secondary-container/30 rounded-3xl p-10 space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8">
                <span className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  <span className="material-symbols-outlined text-[14px] font-variation-fill">verified</span>
                  Official Integration
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold shadow-lg">4</div>
                <div>
                  <h3 className="text-xl font-black text-secondary font-headline italic tracking-tighter">GavaConnect Compliance</h3>
                  <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-60">Verify your property against the Kenya Land Registry (KLR).</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Title Deed Number</label>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 text-primary font-mono placeholder:text-outline-variant focus:ring-4 focus:ring-secondary/5 shadow-inner font-bold" 
                    placeholder="LR NO. 1234/ABC/..." 
                    type="text"
                    value={form.titleDeed}
                    onChange={e => setForm({...form, titleDeed: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">KRA PIN of Owner</label>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 text-primary font-mono placeholder:text-outline-variant focus:ring-4 focus:ring-secondary/5 shadow-inner font-bold" 
                    placeholder="A001234567Z" 
                    type="text"
                    value={form.kraPin}
                    onChange={e => setForm({...form, kraPin: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-start gap-4 bg-secondary-container/10 p-6 rounded-2xl border border-secondary/20 group hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">info</span>
                <p className="text-[13px] text-secondary font-black leading-tight">Your data is transmitted via encrypted GavaConnect protocols directly to the Ministry of Lands for real-time validation.</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 pb-20">
              <button 
                 type="button" 
                 onClick={() => navigate('/landlord/overview')} 
                 className="text-primary font-black uppercase tracking-[0.3em] text-[10px] hover:translate-x-[-4px] transition-transform flex items-center gap-3 group"
              >
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                   <span className="material-symbols-outlined">arrow_back</span>
                </div>
                Save as Draft
              </button>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button type="button" className="flex-1 md:flex-none px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest text-on-surface hover:bg-surface-container-high transition-colors border-2 border-slate-100">
                   Preview Listing
                </button>
                <button 
                   type="submit" 
                   disabled={creating || updating}
                   className="flex-1 md:flex-none px-12 py-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-primary/20"
                >
                   {creating || updating ? 'Deploying Node...' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>

      {/* Floating Helper Chatbot */}
      <div className="fixed bottom-12 right-12 z-[60] group">
        <button className="w-20 h-20 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white relative">
          <span className="material-symbols-outlined text-4xl group-hover:rotate-12 transition-transform font-variation-fill">assistant</span>
          <span className="absolute top-0 right-0 w-6 h-6 bg-tertiary rounded-full border-4 border-surface animate-bounce"></span>
        </button>
        <div className="absolute bottom-24 right-0 w-80 bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] rounded-br-sm shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/40 text-xs font-black text-primary-container leading-relaxed opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all pointer-events-none text-left italic">
           "Greetings! I can help you pre-fill your compliance data using your agency ID."
        </div>
      </div>
    </div>
  );
}
