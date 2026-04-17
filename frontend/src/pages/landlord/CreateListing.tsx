import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateHouseMutation, useUpdateHouseMutation, useGetLocationsQuery } from '../../store/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { toast } from 'react-hot-toast';


const HOUSE_TYPES = [
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Studio Apartment', value: 'studio' },
  { label: '1 Bedroom', value: 'one_bedroom' },
  { label: '2 Bedroom', value: 'two_bedroom' },
  { label: '3 Bedroom', value: 'three_bedroom' },
  { label: '4+ Bedroom', value: 'four_bedroom_plus' },
  { label: 'Mansion', value: 'mansion' },
  { label: 'Bungalow', value: 'bungalow' }
];

// Hardcoded locations fallback if API fails
const FALLBACK_LOCATIONS = [
  'Nairobi - Westlands', 'Nairobi - Karen', 'Mombasa - Nyali'
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
  const { user } = useSelector((state: RootState) => state.auth);
  const { state } = useLocation();
  const isEdit = state?.edit;
  const houseData = state?.house;

  const [createHouse, { isLoading: creating }] = useCreateHouseMutation();
  const [updateHouse, { isLoading: updating }] = useUpdateHouseMutation();
  const { data: locationsData } = useGetLocationsQuery({});

  const isVerified = user?.accountStatus === 'active';

  const locationOptions = useMemo(() => {
    if (!locationsData || locationsData.length === 0) return FALLBACK_LOCATIONS;
    return locationsData.map((l: any) => `${l.county} - ${l.town}`);
  }, [locationsData]);

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: houseData?.title || '',
    description: houseData?.description || '',
    houseType: houseData?.houseType || '',
    location: (houseData?.location?.town ? `${houseData.location.county} - ${houseData.location.town}` : '') || (houseData?.town ? `Nairobi - ${houseData.town}` : ''),
    rent: houseData?.monthlyRent || '',
    bedrooms: houseData?.bedrooms || 1,
    bathrooms: houseData?.bathrooms || 1,
    amenities: houseData?.amenities || [],
    titleDeed: houseData?.titleDeed || '',
    kraPin: houseData?.kraPin || '',
    bookingFee: houseData?.bookingFee || '',
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
          data: {
            title: form.title,
            description: form.description,
            houseType: form.houseType,
            monthlyRent: Number(form.rent),
            bedrooms: Number(form.bedrooms),
            bathrooms: Number(form.bathrooms),
            amenities: form.amenities,
            bookingFee: Number(form.bookingFee),
            location: {
              town: form.location,
              county: form.location.split(' - ')[0] || 'Nairobi'
            }
          }
        }).unwrap();
        toast.success('Listing refined successfully!');
      } else {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('houseType', form.houseType);
        fd.append('rent', String(form.rent));
        fd.append('bedrooms', String(form.bedrooms));
        fd.append('bathrooms', String(form.bathrooms));
        fd.append('bookingFee', String(form.bookingFee));
        fd.append('county', form.location.split(' - ')[0] || 'Nairobi');
        fd.append('locationName', form.location);
        form.amenities.forEach((a: string) => fd.append('amenities[]', a));
        imageFiles.forEach((file) => fd.append('images', file));

        await createHouse(fd).unwrap();
        toast.success('Listing created successfully!');
      }
      navigate('/landlord/overview');
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.error || 'Failed to save house listing.');
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body text-left">
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
          {/* Section 1: Core Details */}
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
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">House Type</label>
                <select
                  className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-primary font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 shadow-inner"
                  value={form.houseType}
                  onChange={e => setForm({ ...form, houseType: e.target.value })}
                >
                  <option value="">Select Type</option>
                  {HOUSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Location / Suburb</label>
                <select
                  className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-primary font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 shadow-inner"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                >
                  <option value="">Select Location</option>
                  {locationOptions.map((l: string) => <option key={l} value={l}>{l}</option>)}
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
                    onChange={e => setForm({ ...form, rent: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Booking Fee (KSh)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs">KSh</span>
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-4 pl-14 text-primary font-black placeholder:text-outline-variant focus:ring-4 focus:ring-primary/5 shadow-inner"
                    placeholder="e.g., 2500"
                    type="number"
                    value={form.bookingFee}
                    onChange={e => setForm({ ...form, bookingFee: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant italic">This fee is charged to the seeker when booking. Deductible from first month's rent.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Editorial Description</label>
              <textarea
                className="w-full bg-surface-container-lowest border-none rounded-xl p-6 text-primary font-bold placeholder:text-outline-variant resize-none focus:ring-4 focus:ring-primary/5 shadow-inner"
                placeholder="Describe the narrative... Focus on materials, views, and unique character..."
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
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
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant italic font-black uppercase tracking-widest opacity-60">High-resolution JPEG/PNG only.</p>
            </div>
            <div className="bg-primary rounded-3xl p-10 text-on-primary space-y-6 flex flex-col justify-center relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="relative z-10 text-center lg:text-left">
                <span className="material-symbols-outlined text-4xl mb-6 text-secondary bg-white/10 p-4 rounded-3xl">auto_awesome</span>
                <h4 className="text-2xl font-black mb-4 font-headline tracking-tighter italic">Editorial AI Assist</h4>
                <p className="text-sm opacity-80 leading-relaxed font-body font-medium italic">Our curator AI can help refine your description.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Amenities */}
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
                  <div className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest rounded-2xl peer-checked:bg-secondary-container peer-checked:text-on-secondary-container transition-all shadow-sm border border-transparent hover:scale-105 active:scale-95">
                    <span className="material-symbols-outlined text-2xl">{amenity.icon}</span>
                    <span className="text-[10px] font-black text-center uppercase tracking-widest">{amenity.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: GavaConnect Compliance */}
          <div className="bg-white border-4 border-slate-100 rounded-3xl p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold shadow-lg">4</div>
              <div>
                <h3 className="text-xl font-black text-secondary font-headline italic tracking-tighter">GavaConnect Compliance</h3>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1 opacity-60">Verify your property against the Kenya Land Registry.</p>
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
                  onChange={e => setForm({ ...form, titleDeed: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">KRA PIN of Owner</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-primary font-mono placeholder:text-outline-variant focus:ring-4 focus:ring-secondary/5 shadow-inner font-bold"
                  placeholder="A001234567Z"
                  type="text"
                  value={form.kraPin}
                  onChange={e => setForm({ ...form, kraPin: e.target.value })}
                />
              </div>
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
              Discard Changes
            </button>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                type="submit"
                disabled={creating || updating || !isVerified}
                className={`flex-1 md:flex-none px-12 py-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-primary/20 ${!isVerified ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {creating || updating ? 'Processing...' : (!isVerified ? 'Compliance Auth Required' : 'Submit for Verification')}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Floating Helper Chatbot */}
      <div className="fixed bottom-12 right-12 z-[60] group">
        <button className="w-20 h-20 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white relative">
          <span className="material-symbols-outlined text-4xl group-hover:rotate-12 transition-transform font-variation-fill">assistant</span>
        </button>
      </div>
    </div>
  );
}
