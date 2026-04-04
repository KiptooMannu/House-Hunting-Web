import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', rent: '', county: '', location_name: '', bedrooms: '1', bathrooms: '1', amenities: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const imagePreviews = useMemo(
    () => imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [imageFiles]
  );

  useEffect(() => {
    return () => imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [imagePreviews]);

  async function fetchBookings() {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data?.data?.bookings ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchHouses() {
    try {
      const res = await api.get('/houses', { params: { page: 1, limit: 50, status: 'available' } });
      const all = res.data?.data?.houses ?? [];
      if ((user as any)?.id) {
        setHouses(all.filter((h: any) => h.landlord_id === (user as any).id || h.landlord?.id === (user as any).id));
      } else {
        setHouses(all);
      }
    } catch (err: any) {
      console.error('Failed to load houses', err?.response?.data || err);
    }
  }

  useEffect(() => {
    fetchBookings();
    fetchHouses();
  }, []);

  async function updateBookingStatus(bookingId: number, booking_status: 'confirmed' | 'cancelled') {
    setError('');
    try {
      await api.put(`/bookings/${bookingId}/status`, { booking_status });
      await fetchBookings();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update booking.');
    }
  }

  const landlordBookings = useMemo(() => bookings, [bookings]);
  const stats = useMemo(() => {
    const total = houses.length;
    const pending = landlordBookings.filter((b) => b.booking_status === 'pending').length;
    const confirmed = landlordBookings.filter((b) => b.booking_status === 'confirmed').length;
    const active = pending + confirmed;
    const revenue = landlordBookings.reduce((sum, b) => {
      if (b?.payment?.payment_status === 'completed') return sum + Number(b?.payment?.amount || 0);
      return sum;
    }, 0);
    return { total, active, revenue };
  }, [landlordBookings, houses]);

  async function handleCreateHouse(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append('title', createForm.title);
      fd.append('description', '');
      fd.append('rent', String(Number(createForm.rent || 0)));
      if (createForm.county) fd.append('county', createForm.county);
      if (createForm.location_name) fd.append('location_name', createForm.location_name);
      fd.append('bedrooms', String(Number(createForm.bedrooms || 1)));
      fd.append('bathrooms', String(Number(createForm.bathrooms || 1)));

      const amenities = createForm.amenities.split(',').map((a) => a.trim()).filter(Boolean);
      amenities.forEach((a) => fd.append('amenities[]', a));
      imageFiles.forEach((file) => fd.append('images', file));

      await api.post('/houses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchHouses();
      setCreateForm({
        title: '', rent: '', county: '', location_name: '', bedrooms: '1', bathrooms: '1', amenities: '',
      });
      setImageFiles([]);
      setShowAddForm(false);
    } catch (err: any) {
       setError(err?.response?.data?.message || 'Failed to create house listing.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* SideNavBar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 dark:bg-slate-950 flex-col p-4 gap-2 z-50 transform transition-transform duration-300 flex ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-sky-900 dark:text-white font-headline">Estate Manager</h2>
             <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Verified Partner</p>
          </div>
        </div>
        <nav className="flex-grow space-y-1">
          <Link to="/landlord" className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-300 rounded-xl shadow-sm font-bold transition-all duration-300">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-headline text-sm">Dashboard</span>
          </Link>
          <Link to="/houses" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:pl-6 transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl">
            <span className="material-symbols-outlined">domain</span>
            <span className="font-headline text-sm">Discover Properties</span>
          </Link>
        </nav>
        <div className="mt-auto space-y-1 pt-4 border-t border-slate-200/50">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full mb-4 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">{showAddForm ? 'close' : 'add'}</span>
            {showAddForm ? 'Cancel Listing' : 'Add New Listing'}
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 flex-1">
        {/* TopNavBar */}
        <header className="sticky top-0 right-0 left-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none transition-colors">
          <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary">menu</span>
              </button>
              <Link to="/"><h1 className="text-2xl font-black text-sky-900 dark:text-sky-100 tracking-tighter font-headline">Modern Estate</h1></Link>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden border-2 border-white shadow-sm">
                   {((user as any)?.name || 'A')[0].toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="pt-12 px-6 pb-12 max-w-7xl mx-auto">
          {error && <div className="p-4 mb-6 bg-error-container text-on-error-container rounded-lg">{error}</div>}

          {showAddForm ? (
            <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-headline text-3xl font-bold text-primary">Curate New Estate</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Enter property facts below. Listings go live immediately upon creation.</p>
                  </div>
               </div>
               
               <form onSubmit={handleCreateHouse} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Listing Title</label>
                       <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" placeholder="Modern 2-Bed Apartment" required value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Listing Price (KSh)</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">KSh</span>
                         <input type="number" min="0" className="w-full bg-surface-container-high border-none rounded-lg pl-14 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" placeholder="0.00" required value={createForm.rent} onChange={e => setCreateForm({...createForm, rent: e.target.value})} />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Primary Location</label>
                       <div className="relative">
                         <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
                         <input className="w-full bg-surface-container-high border-none rounded-lg pl-12 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" placeholder="e.g. Riverside Drive, Nairobi" value={createForm.location_name} onChange={e => setCreateForm({...createForm, location_name: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">County</label>
                       <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" placeholder="Nairobi" value={createForm.county} onChange={e => setCreateForm({...createForm, county: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Bedrooms</label>
                       <input type="number" min="0" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" value={createForm.bedrooms} onChange={e => setCreateForm({...createForm, bedrooms: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Bathrooms</label>
                       <input type="number" min="0" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" value={createForm.bathrooms} onChange={e => setCreateForm({...createForm, bathrooms: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Amenities (CSV)</label>
                       <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 focus:ring-2 focus:ring-primary transition-all font-medium text-primary" placeholder="WiFi, Pool, Garage" value={createForm.amenities} onChange={e => setCreateForm({...createForm, amenities: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant flex gap-2 items-center">
                       Upload Photos 
                       <span className="lowercase font-normal text-on-surface-variant opacity-70">(up to 10 JPGs)</span>
                    </label>
                    <input 
                      type="file" multiple accept=".jpg,.jpeg,image/jpeg" 
                      className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary/90"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setImageFiles((prev) => [...prev, ...files].slice(0, 10));
                        e.currentTarget.value = '';
                      }}
                    />
                    
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-4 mt-4">
                         {imagePreviews.map(p => (
                            <div key={p.url} className="relative w-24 h-24 rounded-lg overflow-hidden group border border-outline-variant/30">
                               <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                               <button 
                                 type="button" 
                                 onClick={() => setImageFiles(prev => prev.filter(f => f !== p.file))}
                                 className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 ×
                               </button>
                            </div>
                         ))}
                      </div>
                    )}
                 </div>

                 <div className="flex items-center justify-end pt-8 border-t border-surface-container-high gap-4">
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-on-surface-variant font-bold text-sm hover:text-primary transition-colors">Cancel</button>
                    <button type="submit" disabled={creating} className="bg-tertiary text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-tertiary/20 flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                       {creating ? 'Saving to Database...' : 'Save & Publish'}
                       {!creating && <span className="material-symbols-outlined">arrow_forward</span>}
                    </button>
                 </div>
               </form>
            </div>
          ) : (
            <>
              {/* Hero Greeting */}
              <div className="mb-10">
                <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight mb-2">Welcome back, {((user as any)?.name)?.split(' ')[0] || 'Landlord'}</h2>
                <p className="text-on-surface-variant font-body">Here is what is happening with your portfolio today.</p>
              </div>

              {/* Bento Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
                    </div>
                  </div>
                  <h3 className="text-on-surface-variant font-label font-medium uppercase tracking-wider text-xs mb-1">Total Listings</h3>
                  <p className="text-4xl font-headline font-black text-primary">{stats.total}</p>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                    </div>
                  </div>
                  <h3 className="text-on-surface-variant font-label font-medium uppercase tracking-wider text-xs mb-1">Active Bookings</h3>
                  <p className="text-4xl font-headline font-black text-primary">{stats.active}</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl shadow-lg relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-9xl">payments</span>
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                    </div>
                  </div>
                  <h3 className="text-primary-fixed/70 font-label font-medium uppercase tracking-wider text-xs mb-1 relative z-10">Booking Revenue</h3>
                  <p className="text-4xl font-headline font-black text-white relative z-10">{formatCurrency(stats.revenue)}</p>
                </div>
              </div>

              {/* Property Inventory */}
              <div className="bg-surface-container-low rounded-xl p-8 mb-12 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary">Property Inventory</h3>
                    <p className="text-on-surface-variant text-sm mt-1">Manage and monitor your active real estate assets</p>
                  </div>
                </div>
                
                {houses.length === 0 ? (
                  <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                    <div className="w-16 h-16 bg-surface-container mx-auto rounded-full flex items-center justify-center text-outline-variant mb-4">
                       <span className="material-symbols-outlined text-3xl">home_work</span>
                    </div>
                    <p className="font-bold text-lg mb-2">No Properties Yet</p>
                    <p className="text-sm text-on-surface-variant mb-6">List your first property to start receiving viewing bookings.</p>
                    <button onClick={() => setShowAddForm(true)} className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm">Create Listing</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest bg-transparent">
                          <th className="px-6 py-2 font-semibold">Property</th>
                          <th className="px-6 py-2 font-semibold">Location</th>
                          <th className="px-6 py-2 font-semibold">Status</th>
                          <th className="px-6 py-2 font-semibold">Rent/Month</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {houses.map(h => (
                          <tr key={h.id} className="bg-surface-container-lowest hover:bg-white transition-colors shadow-sm">
                            <td className="px-6 py-4 rounded-l-xl">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                                  {h.images && h.images.length > 0 ? (
                                    <img className="w-full h-full object-cover" alt={h.title} src={h.images[0]} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">🏠</div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-primary font-headline">{h.title}</div>
                                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">ID: ME-{h.id.toString().padStart(4, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant font-medium text-sm">
                              {h.location_name || h.county || 'Unspecified'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                h.approval_status === 'approved' ? 'bg-secondary-container text-on-secondary-container' 
                                : h.approval_status === 'rejected' ? 'bg-error-container text-on-error-container' 
                                : 'bg-surface-container-high text-on-surface-variant'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${h.approval_status === 'approved' ? 'bg-secondary' : 'bg-outline'}`}></span>
                                {h.approval_status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-primary rounded-r-xl">{formatCurrency(h.rent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bookings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
                  <h4 className="font-headline text-lg font-bold text-primary mb-6">Recent Bookings</h4>
                  <div className="space-y-4">
                    {landlordBookings.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">No booking requests found.</p>
                    ) : (
                      landlordBookings.slice(0, 5).map(b => (
                        <div key={b.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl bg-surface-container-low transition-colors hover:bg-surface-container-high">
                           <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                              <span className="material-symbols-outlined text-sm">event</span>
                           </div>
                           <div className="flex-grow">
                              <p className="text-sm font-bold text-primary">{b.house?.title || 'Unknown Property'}</p>
                              <p className="text-xs text-on-surface-variant flex gap-3 mt-1">
                                <span>Date: {b.booking_date}</span>
                                <span className="capitalize text-secondary font-semibold">{b.booking_status}</span>
                              </p>
                           </div>
                           {b.booking_status === 'pending' && (
                             <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                               <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="flex-1 md:flex-none text-[10px] bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded font-bold uppercase tracking-widest">Confirm</button>
                               <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="flex-1 md:flex-none text-[10px] bg-error-container text-on-error-container px-3 py-1.5 rounded font-bold uppercase tracking-widest">Cancel</button>
                             </div>
                           )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}
