import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  useGetHouseByIdQuery, 
  useCreateMpesaPushMutation,
  useCreateStripeIntentMutation 
} from '../../store/apiSlice';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

// Safely load Stripe – show error if key missing
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  console.error('Stripe public key is missing! Set VITE_STRIPE_PUBLIC_KEY in .env');
}
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

// Helper to strip country code from phone for display
const stripPhonePrefix = (phone: string) => {
  if (!phone) return '';
  // Remove +254 or 254 from the beginning
  let cleaned = phone.replace(/^\+?254/, '');
  // Also remove leading 0
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return cleaned;
};

// Inner component for card payment form
const CardPaymentForm = ({ bookingId, clientSecret, onSuccess, onError }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });
    if (error) {
      onError(error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      const res = await fetch('/api/payments/card/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id, bookingId }),
      });
      const data = await res.json();
      if (data.success) onSuccess();
      else onError(data.error);
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-xl bg-white">
        <CardElement />
      </div>
      <button type="submit" disabled={!stripe || processing} className="w-full bg-primary text-white py-3 rounded-full font-bold">
        {processing ? 'Processing...' : 'Pay with Card'}
      </button>
    </form>
  );
};

export default function BookingForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const houseId = parseInt(id!);
  const { data: house, isLoading } = useGetHouseByIdQuery(houseId);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  // Remove country code from user's phone for display
  const [phone, setPhone] = useState(() => stripPhonePrefix(user?.phone || ''));
  const [occupants, setOccupants] = useState('1 Person');
  const [notes, setNotes] = useState('');
  const [moveInDate, setMoveInDate] = useState(location.state?.startDate || '');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeBookingId, setStripeBookingId] = useState<number | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (!house) return <div>Property not found</div>;

  const bookingFee = house.bookingFee ? Number(house.bookingFee) : 0;
  const canProceed = bookingFee > 0;
  const [createMpesaPush, { isLoading: mpesaLoading }] = useCreateMpesaPushMutation();
  const [createStripeIntent, { isLoading: stripeLoading }] = useCreateStripeIntentMutation();

  // M-Pesa payment initiation
  const handleMpesaPay = async () => {
    if (!phone) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }
    if (!canProceed) {
      toast.error('Booking fee not set. Please contact the landlord.');
      return;
    }
    try {
      const resp = await createMpesaPush({
        houseId,
        moveInDate,
        occupants,
        notes,
        phone,
      }).unwrap();
      
      const data = resp.data || resp;
      if (data.checkoutRequestId) {
        toast.success('Payment initiated. Check your phone for the STK push.');
        navigate(`/payment_status?checkoutId=${data.checkoutRequestId}`);
      } else {
        toast.error('Payment initiation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.error || err?.data?.message || 'Network error. Please try again.');
    }
  };

  // Card payment: create Stripe PaymentIntent
  const handleCardPay = async () => {
    if (!canProceed) {
      toast.error('Booking fee not set. Please contact the landlord.');
      return;
    }
    try {
      const resp = await createStripeIntent({
        houseId,
        moveInDate,
        occupants,
        notes,
      }).unwrap();
      
      const data = resp.data || resp;
      if (data.clientSecret) {
        toast.success('Secure payment connection established.');
        setStripeClientSecret(data.clientSecret);
        setStripeBookingId(data.bookingId);
      } else {
        toast.error('Payment intent creation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.error || err?.data?.message || 'Network error. Please try again.');
    }
  };

  const onCardSuccess = () => {
    toast.success('Payment processed successfully!');
    navigate('/payment_status?bookingId=' + stripeBookingId);
  };
  const onCardError = (msg: string) => {
    toast.error('Payment failed: ' + msg);
    setStripeClientSecret(null);
  };

  const showStripe = stripePublicKey && stripePromise;

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
      {/* Editorial Header */}
      <header className="pt-32 pb-8 px-8 md:px-16 max-w-6xl mx-auto text-left">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary mb-4 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span className="text-xs font-bold tracking-widest uppercase">Back to Listings</span>
        </button>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4 leading-tight">
          Secure Your <span className="text-primary-container bg-primary-fixed px-2">New Horizon.</span>
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Complete your reservation for <span className="font-semibold text-on-surface">{house.title}</span>.
        </p>
      </header>

      <section className="px-8 md:px-16 pb-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        <div className="lg:col-span-7 space-y-12">
          {/* Booking Details */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">01</span>
              <h2 className="text-2xl font-bold font-headline tracking-tight">Booking Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Preferred Move-in Date</label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all font-medium text-on-surface"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Number of Occupants</label>
                <select
                  value={occupants}
                  onChange={(e) => setOccupants(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all font-medium text-on-surface appearance-none"
                >
                  <option>1 Person</option>
                  <option>2 People</option>
                  <option>3-4 People</option>
                  <option>5+ People</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Special Requests / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all font-medium text-on-surface placeholder:opacity-40"
                placeholder="Mention any specific requirements or questions for the property manager..."
                rows={4}
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">02</span>
              <h2 className="text-2xl font-bold font-headline tracking-tight">Payment Verification</h2>
            </div>
            <div className="bg-secondary-container/10 p-6 rounded-2xl border-l-4 border-secondary space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-secondary text-lg">
                    Booking Fee: {bookingFee > 0 ? formatCurrency(bookingFee) : 'Not set by landlord'}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    This one-time fee filters out automated bots and verifies serious intent. The amount is fully deductible from your first month's rent.
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${paymentMethod === 'mpesa' ? 'bg-primary text-white shadow-md scale-[1.02]' : 'bg-surface-container-high text-on-surface-variant'}`}
              >
                M-Pesa
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${paymentMethod === 'card' ? 'bg-primary text-white shadow-md scale-[1.02]' : 'bg-surface-container-high text-on-surface-variant'}`}
                disabled={!showStripe}
              >
                Card (Visa/MC) {!showStripe && '(N/A)'}
              </button>
            </div>

            {/* M-Pesa form */}
            {paymentMethod === 'mpesa' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">M-Pesa Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <span className="text-on-surface-variant font-bold text-sm">+254</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-16 pr-4 focus:ring-2 focus:ring-primary transition-all font-bold text-on-surface tracking-widest"
                      placeholder="712 345 678"
                    />
                  </div>
                </div>
                <button
                  onClick={handleMpesaPay}
                  disabled={isLoading || mpesaLoading || !canProceed}
                  className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-5 rounded-full font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {mpesaLoading ? 'Initiating Push...' : 'Confirm with M-Pesa'}
                  {!mpesaLoading && <span className="material-symbols-outlined">payments</span>}
                </button>
              </div>
            )}

            {/* Card payment form */}
            {paymentMethod === 'card' && !stripeClientSecret && (
              <button
                onClick={handleCardPay}
                disabled={isLoading || stripeLoading || !showStripe || !canProceed}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-5 rounded-full font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {stripeLoading ? 'Preparing Payment...' : 'Pay with Card'}
              </button>
            )}
            {paymentMethod === 'card' && stripeClientSecret && showStripe && (
              <Elements stripe={stripePromise}>
                <CardPaymentForm
                  bookingId={stripeBookingId!}
                  clientSecret={stripeClientSecret}
                  onSuccess={onCardSuccess}
                  onError={onCardError}
                />
              </Elements>
            )}
          </div>

          {/* Trust Section */}
          <div className="pt-8 border-t border-surface-variant flex flex-col md:flex-row gap-6 items-center">
            <div className="flex -space-x-2">
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80" alt="Trust" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" alt="Trust" />
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-white flex items-center justify-center text-[10px] font-bold text-on-surface-variant">2k+</div>
            </div>
            <div className="text-xs text-on-surface-variant font-medium leading-tight text-center md:text-left">
              Joined 2,400+ Kenyans who secured their homes this month.<br />
              <span className="flex items-center justify-center md:justify-start gap-1 mt-1 text-secondary">
                <span className="material-symbols-outlined text-[14px]">shield</span> GavaConnect Protected & Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Context Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-on-surface/5 border border-slate-100">
              <div className="relative h-64">
                <img className="w-full h-full object-cover" src={house.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"} alt={house.title} />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Premium Listing</span>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black font-headline tracking-tighter text-on-surface">{house.title}</h3>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {house.location?.county}, Kenya
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Price</p>
                    <p className="text-xl font-black text-on-surface">{formatCurrency(house.monthlyRent)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-surface-variant/30 text-center">
                  <div>
                    <span className="material-symbols-outlined text-on-surface-variant">bed</span>
                    <p className="text-[10px] font-bold uppercase mt-1">{house.bedrooms} Beds</p>
                  </div>
                  <div>
                    <span className="material-symbols-outlined text-on-surface-variant">bathtub</span>
                    <p className="text-[10px] font-bold uppercase mt-1">{house.bathrooms} Baths</p>
                  </div>
                  <div>
                    <span className="material-symbols-outlined text-on-surface-variant">square_foot</span>
                    <p className="text-[10px] font-bold uppercase mt-1">{house.square_footage || '2,400'} sqft</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-tertiary">info</span>
                  <p className="text-xs font-medium text-on-surface-variant leading-tight text-left">
                    Reservation active for <span className="text-on-surface font-bold">14:58 minutes</span>. Complete payment to finalize.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-[2rem] flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl">security</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Secure Transaction</p>
                <p className="text-[11px] text-on-surface-variant mt-1">Your data is handled via the GavaConnect API ensuring total compliance with Data Protection Laws.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
