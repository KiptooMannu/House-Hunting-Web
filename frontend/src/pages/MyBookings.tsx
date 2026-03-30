import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

export default function MyBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [phoneByBooking, setPhoneByBooking] = useState<Record<number, string>>({});
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState('');

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

  useEffect(() => {
    fetchBookings();
  }, []);

  async function pollPayment(paymentId: number) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const res = await api.get(`/payments/${paymentId}`);
      const status = res.data?.data?.payment?.payment_status;
      if (status === 'completed' || status === 'failed') return status;
      await new Promise((r) => setTimeout(r, 2000));
    }
    return 'pending';
  }

  async function payWithMpesa(bookingId: number) {
    const phone_number = phoneByBooking[bookingId];
    setPaymentError('');

    if (!phone_number) {
      setPaymentError('Please enter your phone number for M-Pesa.');
      return;
    }

    setPayingBookingId(bookingId);
    try {
      const initRes = await api.post('/payments/mpesa/stk-push', {
        booking_id: bookingId,
        phone_number,
      });

      const payment = initRes.data?.data?.payment;
      const paymentId = payment?.id;
      if (!paymentId) {
        setPaymentError('Payment was not initialized correctly.');
        return;
      }

      await pollPayment(paymentId);
      await fetchBookings();
    } catch (err: any) {
      setPaymentError(err?.response?.data?.message || 'Payment failed to start.');
    } finally {
      setPayingBookingId(null);
    }
  }

  if (loading) return <div className="loading-page">Loading...</div>;
  if (error) return <div className="container page">{error}</div>;

  return (
    <div className="container page">
      <h1>My Bookings</h1>

      {paymentError && <div className="alert alert-error">{paymentError}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">No bookings found.</div>
      ) : (
        <div className="bookings-list panel">
          {bookings.map((b) => {
            const houseTitle = b?.house?.title ?? 'House';
            const rent = b?.house?.rent;
            const bookingStatus = b?.booking_status;
            const paymentStatus = b?.payment?.payment_status;
            const paymentExists = !!b?.payment;

            const canPay = bookingStatus !== 'confirmed' && (!paymentExists || paymentStatus !== 'completed');

            return (
              <div key={b.id} className="booking-card">
                <div className="booking-card-body">
                  <h3>{houseTitle}</h3>
                  <p>
                    <strong>Booking date:</strong> {b.booking_date}
                  </p>
                  <p>
                    <strong>Rent:</strong> {rent ? formatCurrency(rent) : '—'} / month
                  </p>
                  <p>
                    <strong>Booking status:</strong> {bookingStatus}
                  </p>
                  <p>
                    <strong>Payment status:</strong> {paymentStatus ?? '—'}
                  </p>

                  {canPay && (
                    <div className="pay-section">
                      <input
                        type="tel"
                        placeholder="Phone for M-Pesa (+254...)"
                        value={phoneByBooking[b.id] ?? ''}
                        onChange={(e) =>
                          setPhoneByBooking((prev) => ({ ...prev, [b.id]: e.target.value }))
                        }
                      />
                      <button
                        className="btn btn-primary"
                        disabled={payingBookingId === b.id}
                        type="button"
                        onClick={() => payWithMpesa(b.id)}
                      >
                        {payingBookingId === b.id ? 'Processing...' : 'Pay via M-Pesa'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

