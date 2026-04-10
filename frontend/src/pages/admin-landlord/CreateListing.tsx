import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateHouseMutation } from '../../store/apiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateListing() {
  const navigate = useNavigate();
  const [createHouse, { isLoading: creating }] = useCreateHouseMutation();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', rent: '', dailyRate: '', county: '', location_name: '', bedrooms: '1', bathrooms: '1', amenities: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const imagePreviews = useMemo(
    () => imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [imageFiles]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('rent', String(Number(form.rent || 0)));
      fd.append('dailyRate', String(Number(form.dailyRate || 0)));
      fd.append('county', form.county);
      fd.append('locationName', form.location_name); // Backend uses locationName in validator
      fd.append('bedrooms', String(Number(form.bedrooms || 1)));
      fd.append('bathrooms', String(Number(form.bathrooms || 1)));
      
      const amenities = form.amenities.split(',').map((a) => a.trim()).filter(Boolean);
      amenities.forEach((a) => fd.append('amenities[]', a));
      imageFiles.forEach((file) => fd.append('images', file));

      await createHouse(fd).unwrap();
      navigate('/landlord');
    } catch (err: any) {
        setError(err?.data?.message || err?.data?.error || 'Failed to create house listing.');
    }
  }

  return (
    <main className="bg-surface font-body text-on-surface min-h-screen flex flex-col antialiased">
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-sm h-20 flex justify-between items-center px-8">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">domain</span>
                <h1 className="text-xl font-bold tracking-tight text-primary font-headline">Estate Curator Landlord</h1>
            </div>
            <button onClick={() => navigate('/landlord')} className="text-primary font-bold hover:bg-slate-50 transition-colors px-4 py-2 rounded-full">Cancel</button>
        </header>

        <div className="flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto w-full text-left">
            <div className="mb-12">
                <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px] mb-2 block">Property Management</span>
                <h1 className="text-4xl font-extrabold text-primary tracking-tight">Curate New Estate.</h1>
                <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">Enter your property details below. Verified listings gain 40% more engagement on our network.</p>
            </div>

            {error && <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-xl font-bold text-sm tracking-tight">{error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Main Identity Segment */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] p-10 shadow-2xl shadow-primary/5 border border-slate-100 flex flex-col gap-10">
                    <div>
                        <h3 className="text-xl font-headline font-black text-primary mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">01</span>
                            Essential Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Property Title</label>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner" 
                                    placeholder="e.g. Modern Riverside Duplex" 
                                    required
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Monthly Rent (KSh)</label>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner" 
                                    placeholder="0.00" 
                                    type="number"
                                    required
                                    value={form.rent}
                                    onChange={e => setForm({...form, rent: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Daily Rate (KSh)</label>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner" 
                                    placeholder="0.00" 
                                    type="number"
                                    required
                                    value={form.dailyRate}
                                    onChange={e => setForm({...form, dailyRate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-headline font-black text-primary mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">02</span>
                            Physical Specs
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Bedrooms</label>
                                <select 
                                    className="w-full h-[64px] bg-slate-50 border-none rounded-2xl px-6 font-bold text-primary focus:ring-2 focus:ring-primary/20 shadow-inner appearance-none"
                                    value={form.bedrooms}
                                    onChange={e => setForm({...form, bedrooms: e.target.value})}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BR</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Bathrooms</label>
                                <select 
                                    className="w-full h-[64px] bg-slate-50 border-none rounded-2xl px-6 font-bold text-primary focus:ring-2 focus:ring-primary/20 shadow-inner appearance-none"
                                    value={form.bathrooms}
                                    onChange={e => setForm({...form, bathrooms: e.target.value})}
                                >
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} BA</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Amenities</label>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner" 
                                    placeholder="WiFi, Gym, Pool, Security" 
                                    value={form.amenities}
                                    onChange={e => setForm({...form, amenities: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-headline font-black text-primary mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">03</span>
                            Location Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Street / Landmark</label>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner" 
                                    placeholder="e.g. Peponi Road" 
                                    required
                                    value={form.location_name}
                                    onChange={e => setForm({...form, location_name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">County</label>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-8 px-6 font-bold text-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner" 
                                    placeholder="e.g. Nairobi" 
                                    required
                                    value={form.county}
                                    onChange={e => setForm({...form, county: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Segment */}
                <div className="lg:col-span-4 space-y-8 sticky top-32">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-primary/5 border border-slate-100">
                        <h3 className="text-lg font-headline font-black text-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">photo_camera</span>
                            Visual Assets
                        </h3>
                        <p className="text-[11px] text-on-surface-variant mb-6 uppercase tracking-widest font-black">Upload floor plans & interior photos</p>
                        
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-100 border-dashed rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className="material-symbols-outlined text-slate-300 text-4xl mb-3 group-hover:scale-110 transition-transform">cloud_upload</span>
                                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em]">Select Files</p>
                            </div>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={e => {
                                const files = Array.from(e.target.files || []);
                                setImageFiles(prev => [...prev, ...files].slice(0, 10));
                            }} />
                        </label>

                        {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-6">
                                {imagePreviews.map(p => (
                                    <div key={p.url} className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm border border-white">
                                        <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImageFiles(prev => prev.filter(f => f !== p.file))} className="absolute top-0 right-0 bg-primary text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button 
                        type="submit"
                        disabled={creating}
                        className="w-full bg-primary hover:bg-primary-container text-white py-10 rounded-full font-black text-lg shadow-2xl shadow-primary/20 transition-all border-none"
                    >
                        {creating ? 'Verifying Node...' : 'Publish Estate'}
                    </Button>
                    <p className="text-[10px] text-on-surface-variant text-center font-label italic">"By publishing, you agree to our compliance and verification protocols."</p>
                </div>
            </form>
        </div>

        <footer className="w-full py-12 px-8 bg-slate-50 border-t border-slate-200 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
                <div className="font-headline font-black text-primary text-lg">Estate Curator</div>
                <div className="text-slate-400 font-body text-xs">Editorial Excellence in Kenyan Real Estate.</div>
            </div>
        </footer>
    </main>
  );
}
