import { FormEvent, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    rent: '',
    county: '',
    location_name: '',
    bedrooms: '1',
    bathrooms: '1',
    amenities: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const imagePreviews = useMemo(
    () => imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [imageFiles],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
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
      const res = await api.get('/houses', {
        params: { page: 1, limit: 50, status: 'available' },
      });
      const all = res.data?.data?.houses ?? [];
      if (user?.id) {
        setHouses(all.filter((h: any) => h.landlord_id === user.id || h.landlord?.id === user.id));
      } else {
        setHouses(all);
      }
    } catch (err: any) {
      console.error('Failed to load houses for landlord dashboard', err?.response?.data || err);
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
    const total = landlordBookings.length;
    const pending = landlordBookings.filter((b) => b.booking_status === 'pending').length;
    const confirmed = landlordBookings.filter((b) => b.booking_status === 'confirmed').length;
    const revenue = landlordBookings.reduce((sum, b) => {
      if (b?.payment?.payment_status === 'completed') {
        return sum + Number(b?.payment?.amount || 0);
      }
      return sum;
    }, 0);
    return { total, pending, confirmed, revenue };
  }, [landlordBookings]);

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

      const amenities = createForm.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      amenities.forEach((a) => fd.append('amenities[]', a));

      imageFiles.forEach((file) => fd.append('images', file));

      await api.post('/houses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchHouses();
      setCreateForm({
        title: '',
        rent: '',
        county: '',
        location_name: '',
        bedrooms: '1',
        bathrooms: '1',
        amenities: '',
      });
      setImageFiles([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create house listing.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="loading-page">Loading...</div>;
  if (error) return <div className="container page">{error}</div>;

  return (
    <div className="container page">
      <h1>Landlord Dashboard</h1>

      <section className="dashboard-section panel" style={{ marginBottom: 16 }}>
        <h2>Add New House</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
          Create a new listing that will appear in search results and on your dashboard.
        </p>
        <form onSubmit={handleCreateHouse}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={createForm.title}
              onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              required
              placeholder="Modern 2-Bed Apartment in Nairobi"
            />
          </div>
          <div className="form-group">
            <label htmlFor="rent">Monthly Rent (Ksh)</label>
            <input
              id="rent"
              type="number"
              min={0}
              value={createForm.rent}
              onChange={(e) => setCreateForm((f) => ({ ...f, rent: e.target.value }))}
              required
              placeholder="40000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="location_name">Location / Estate</label>
            <input
              id="location_name"
              value={createForm.location_name}
              onChange={(e) => setCreateForm((f) => ({ ...f, location_name: e.target.value }))}
              placeholder="Kileleshwa, Nairobi"
            />
          </div>
          <div className="form-group">
            <label htmlFor="county">County</label>
            <input
              id="county"
              value={createForm.county}
              onChange={(e) => setCreateForm((f) => ({ ...f, county: e.target.value }))}
              placeholder="Nairobi"
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                id="bedrooms"
                type="number"
                min={0}
                value={createForm.bedrooms}
                onChange={(e) => setCreateForm((f) => ({ ...f, bedrooms: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                id="bathrooms"
                type="number"
                min={0}
                value={createForm.bathrooms}
                onChange={(e) => setCreateForm((f) => ({ ...f, bathrooms: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="amenities">Amenities (comma separated)</label>
            <input
              id="amenities"
              value={createForm.amenities}
              onChange={(e) => setCreateForm((f) => ({ ...f, amenities: e.target.value }))}
              placeholder="WiFi, Parking, Security"
            />
          </div>
          <div className="form-group">
            <label>House Images</label>
            <input
              type="file"
              accept=".jpg,.jpeg,image/jpeg"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                setImageFiles((prev) => [...prev, ...files].slice(0, 10));
                e.currentTarget.value = '';
              }}
            />

            {imagePreviews.length === 0 ? (
              <div className="empty-state" style={{ padding: 12 }}>
                No images selected yet (JPG only).
              </div>
            ) : (
              <div className="image-grid">
                {imagePreviews.map((p) => (
                  <div key={p.url} className="image-tile">
                    <img src={p.url} alt={p.file.name} />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => setImageFiles((prev) => prev.filter((f) => f !== p.file))}
                      aria-label="Remove image"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              Select JPG/JPEG images (up to 10). The first one becomes the cover image.
            </p>
          </div>
          <button type="submit" className="btn btn-primary btn-sm btn-block" disabled={creating}>
            {creating ? 'Saving...' : 'Create Listing'}
          </button>
        </form>
      </section>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-label">Bookings</span>
          <strong className="stat-value">{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <strong className="stat-value">{stats.pending}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Confirmed</span>
          <strong className="stat-value">{stats.confirmed}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <strong className="stat-value">{formatCurrency(stats.revenue)}</strong>
        </div>
      </section>

      <section className="dashboard-section panel">
        <h2>My Listings</h2>
        {houses.length === 0 ? (
          <div className="empty-state">You have no listings yet.</div>
        ) : (
          <div className="houses-grid">
            {houses.map((h) => (
              <div key={h.id} className="house-card">
                {h.images && h.images.length > 0 && (
                  <div className="house-card-img">
                    <img src={h.images[0]} alt={h.title} />
                  </div>
                )}
                <div className="house-card-body">
                  <h3>{h.title}</h3>
                  <p className="muted">
                    📍 {h.location_name || h.county || 'Kenya'}
                  </p>
                  <p>
                    <strong>Rent:</strong> {formatCurrency(h.rent)}
                  </p>
                  <p>
                    <strong>Bedrooms:</strong> {h.bedrooms} &nbsp;|&nbsp; <strong>Bathrooms:</strong>{' '}
                    {h.bathrooms}
                  </p>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span 
                      className={`status-dot status-dot--${h.approval_status || 'pending'}`} 
                      title={`${h.approval_status ? h.approval_status.charAt(0).toUpperCase() + h.approval_status.slice(1) : 'Pending'} approval`}
                    />
                    <span className="muted" style={{ fontSize: 12 }}>
                      {h.approval_status ? h.approval_status.charAt(0).toUpperCase() + h.approval_status.slice(1) : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section panel" style={{ marginTop: 16 }}>
        <h2>Booking Requests</h2>
        {landlordBookings.length === 0 ? (
          <div className="empty-state">No bookings yet.</div>
        ) : (
          <div className="bookings-list">
            {landlordBookings.map((b) => (
              <div key={b.id} className="booking-card">
                <div className="booking-card-body">
                  <h3>{b?.house?.title ?? 'House'}</h3>
                  <p>
                    <strong>Booking date:</strong> {b.booking_date}
                  </p>
                  <p>
                    <strong>Status:</strong> {b.booking_status}
                  </p>
                  <p>
                    <strong>Payment:</strong> {b?.payment?.payment_status ?? '—'}
                  </p>

                  <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => updateBookingStatus(b.id, 'confirmed')}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => updateBookingStatus(b.id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

