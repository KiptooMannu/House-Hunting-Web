import { useSearchParams, Link } from 'react-router-dom';
import { useGetBookingsQuery } from '../../store/apiSlice';

export default function BookingConfirmed() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');
  const { data: bookingsData } = useGetBookingsQuery({});

  const booking = bookingsData?.items?.find((b: any) => String(b.bookingId) === bookingId)
    ?? bookingsData?.items?.[0];

  const house = booking?.house;
  const payment = booking?.payments?.[0];

  return (
    <main className="max-w-6xl mx-auto px-6 pt-12 pb-24 md:pt-20">
      <div className="flex flex-col lg:flex-row gap-12 items-start">

        {/* Left: Confirmation info */}
        <section className="w-full lg:w-7/12">
          <div className="flex flex-col items-start mb-10">
            <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tighter mb-4 font-headline">
              Booking Confirmed
            </h1>
            <p className="text-lg text-on-surface-variant max-w-md leading-relaxed">
              Your stay at{' '}
              <span className="font-bold text-primary">
                {house?.title ?? 'your selected property'}
              </span>{' '}
              is secured. We've sent the details to your email.
            </p>
          </div>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-surface-container-low p-8 rounded-xl shadow-sm">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-6">
                Payment Summary
              </h2>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">payments</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">M-Pesa Transaction ID</p>
                    <p className="font-mono font-bold text-primary">
                      {payment?.mpesaReceiptNumber ?? 'RK92L0X4P7'}
                    </p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-on-surface-variant">Total Amount Paid</p>
                  <p className="text-2xl font-extrabold text-primary">
                    KES {Number(payment?.amount ?? booking?.bookingFee ?? 45500).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <h2 className="text-xl font-bold text-primary mb-8 tracking-tight font-headline">
                What happens next
              </h2>
              <div className="space-y-8 relative">
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-outline-variant opacity-30" />
                {[
                  { title: "Reservation Review", desc: "The host will review your booking request within the next 2 hours. You'll receive a push notification once approved." },
                  { title: "Digital Key Access", desc: "Upon approval, your unique digital entry code will be activated in the 'My Bookings' section of the app." },
                  { title: "Check-in Instructions", desc: "A detailed guide with directions and house rules will be available 24 hours before your arrival." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${i === 0 ? 'bg-primary' : 'bg-outline-variant'}`}>
                      <span className="text-[10px] text-white font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">{step.title}</h3>
                      <p className="text-on-surface-variant leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link to="/my-bookings"
              className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-lg hover:opacity-90 transition-opacity text-center">
              View Booking Details
            </Link>
            <Link to="/"
              className="bg-surface-container-high text-primary px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-surface-container-highest transition-colors text-center">
              Back to Home
            </Link>
          </div>
        </section>

        {/* Right: Property Card */}
        <aside className="w-full lg:w-5/12 lg:sticky lg:top-12">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_20px_40px_rgba(25,28,29,0.06)]">
            <div className="h-64 relative">
              <img
                alt={house?.title ?? 'Property'}
                className="w-full h-full object-cover"
                src={house?.images?.[0]?.imageUrl
                  ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsV6GMqTzy2L-52n2BajJvsytG7yNlwDKJAk7IoDUPm8iobG_Ae4JkTs4woSI9eR1emZ4MVePcqyN1A-nXTAE9ZnzjNsWDR2ZVxQaSLlwociuddUyqqAg-a1XmV-en6jIL1YirKGEGLX41PWNoK4AJSAVC9s7XWYSuOLMeszxafHz-ati1eQ1fEcat-t1zWjQTIvbhpQApu1CiizE7U6h2HpwNxPhZZTPOi-zLfEgo9bpXdumPIXTLMVYzRlqPbIOQcX9Nqfttays'}
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Verified Host</span>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-primary tracking-tight mb-2 font-headline">
                {house?.title ?? 'The Azure Sky Residence'}
              </h2>
              <div className="flex items-center gap-2 text-on-surface-variant mb-6">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-sm font-medium">
                  {house?.location?.neighborhood ?? 'Riverside'},{' '}
                  {house?.location?.county ?? 'Nairobi'}, Kenya
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-surface-container-high">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Move-in Date</p>
                  <p className="font-bold text-primary">
                    {booking?.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : 'Dec 12, 2024'}
                  </p>
                  <p className="text-xs text-on-surface-variant">After 2:00 PM</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Booking Status</p>
                  <p className="font-bold text-secondary capitalize">{booking?.status ?? 'Confirmed'}</p>
                  <p className="text-xs text-on-surface-variant">Before 11:00 AM</p>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-on-surface-variant">Bedrooms</p>
                  <p className="font-bold text-primary">{house?.bedrooms ?? 2} BR</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-on-surface-variant">Booking ID</p>
                  <p className="font-bold text-primary">
                    #{String(booking?.bookingId ?? '88291').padStart(5, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-secondary-container/20 rounded-xl flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary">info</span>
            <div>
              <p className="text-sm font-bold text-on-secondary-container mb-1">Free Cancellation</p>
              <p className="text-xs text-on-secondary-container/80 leading-relaxed">
                Cancel within 48 hours for a full refund of your booking fee. Processing fees may apply.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* EstateBot Floating Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <Link to="/chatbot"
          className="bg-surface-container-highest/70 backdrop-blur-xl border border-outline-variant/20 shadow-[0px_20px_40px_rgba(25,28,29,0.06)] flex items-center gap-3 px-6 py-4 rounded-full hover:bg-surface-container-highest transition-colors group">
          <span className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
          <span className="font-bold text-primary text-sm">Need help? Ask EstateBot</span>
          <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
