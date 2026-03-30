import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

export default function HouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const houseId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const defaultBookingDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const [house, setHouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDate, setBookingDate] = useState(defaultBookingDate);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/houses/${id}`);
        if (!cancelled) setHouse(res.data?.data?.house ?? null);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load house.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function requestBooking() {
    if (!houseId) return;
    setBookingLoading(true);
    setError('');
    try {
      await api.post('/bookings', {
        house_id: houseId,
        booking_date: bookingDate,
      });
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) return <div className="loading-page">Loading...</div>;
  if (error) return <div className="container page">{error}</div>;
  if (!house) return <div className="container page">House not found.</div>;

  return (
    <div className="container page">
      <h1>House Details</h1>
      <p className="muted" style={{ marginBottom: 10 }}>{house.title}</p>

      <div className="house-detail panel">
        <div className="house-detail-media">
          {house.images && house.images.length > 0 ? (
            <img
              src={house.images[0]}
              alt={house.title}
              style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }}
            />
          ) : (
            <div className="house-card-placeholder">🏠</div>
          )}
        </div>

        <div className="house-detail-meta">
          <p>
            <strong>Location:</strong> {house.location_name || house.county || 'Kenya'}
          </p>
          <p>
            <strong>Rent:</strong> {formatCurrency(house.rent)} / month
          </p>
          <p>
            <strong>Status:</strong> {house.status}
          </p>
          <p>
            <strong>Bedrooms:</strong> {house.bedrooms} | <strong>Bathrooms:</strong> {house.bathrooms}
          </p>
          {house.amenities && house.amenities.length > 0 && (
            <p>
              <strong>Amenities:</strong> {house.amenities.join(', ')}
            </p>
          )}

          {house.landlord && (
            <div className="house-detail-landlord">
              <h3>Landlord</h3>
              <p>
                {house.landlord.name} ({house.landlord.phone || house.landlord.email || 'contact unavailable'})
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2>Request Booking</h2>
        <p>Submit your booking date. Your booking will be confirmed after payment.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestBooking();
          }}
        >
          <div className="form-group">
            <label htmlFor="bookingDate">Booking date</label>
            <input
              id="bookingDate"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
            {bookingLoading ? 'Requesting...' : 'Request Booking'}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

