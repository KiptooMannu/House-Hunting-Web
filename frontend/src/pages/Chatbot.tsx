import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

type ChatMsg = { role: 'user' | 'assistant'; text: string };

export default function Chatbot() {
  const navigate = useNavigate();

  const defaultBookingDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingDate] = useState(defaultBookingDate);
  const [error, setError] = useState('');

  async function sendMessage() {
    const message = input.trim();
    if (!message) return;

    setError('');
    setLoading(true);
    try {
      setMessages((prev) => [...prev, { role: 'user', text: message }]);

      const res = await api.post('/chatbot/message', {
        session_id: sessionId ?? undefined,
        message,
      });

      const data = res.data?.data;
      setSessionId(data?.session_id ?? null);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data?.reply ?? '' },
      ]);

      if (Array.isArray(data?.houses)) {
        setHouses(data.houses);
      } else {
        setHouses([]);
      }

      setInput('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setError('');
    try {
      if (sessionId) {
        await api.post('/chatbot/reset', { session_id: sessionId });
      }
    } catch {
      // Reset is best-effort; backend clears only if session exists.
    } finally {
      setSessionId(null);
      setMessages([]);
      setHouses([]);
    }
  }

  async function requestBooking(houseId: number) {
    setError('');
    try {
      await api.post('/bookings', {
        house_id: houseId,
        booking_date: bookingDate,
      });
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Booking request failed.');
    }
  }

  return (
    <div className="container page">
      <h1>Chatbot House Search</h1>

      <div className="chat-shell panel">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">Ask about your budget, location, and bedroom count.</div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={m.role === 'user' ? 'chat-bubble user' : 'chat-bubble assistant'}
              >
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{m.text}</pre>
              </div>
            ))
          )}
        </div>

        <div className="chat-compose">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your preferences..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <button className="btn btn-primary" disabled={loading} onClick={sendMessage} type="button">
            {loading ? 'Thinking...' : 'Send'}
          </button>
          <button className="btn btn-outline" onClick={reset} type="button">
            Reset
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {houses.length > 0 && (
        <div style={{ marginTop: 24 }} className="panel">
          <h2>Matching Listings</h2>
          <div className="houses-grid">
            {houses.map((house) => (
              <div key={house.id} className="house-card">
                <div className="house-card-body">
                  <h3>{house.title}</h3>
                  <p className="house-card-location">📍 {house.location_name || house.county || 'Kenya'}</p>
                  <p className="house-card-price">
                    {formatCurrency(house.rent)} <span>/month</span>
                  </p>
                  <p className="house-card-meta">
                    🛏️ {house.bedrooms} BR | 🚿 {house.bathrooms} BA
                  </p>

                  <button className="btn btn-primary" style={{ marginTop: 10 }} type="button" onClick={() => requestBooking(house.id)}>
                    Request Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

