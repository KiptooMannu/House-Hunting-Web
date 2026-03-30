import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';
import heroImg from '../assets/hero.png';

export default function Landing() {
  const { isAuth, user } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      try {
        const res = await api.get('/houses', {
          params: { page: 1, limit: 3, status: 'available' },
        });
        const houses = res.data?.data?.houses ?? [];
        if (!cancelled) setFeatured(houses);
      } catch {
        if (!cancelled) setFeatured([]);
      }
    }
    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="container landing-container hero-grid">
          <div className="hero-copy">
            <h1>Find Your Perfect Home in Kenya</h1>
            <p>Use our chatbot to discover houses that match your budget, location, and lifestyle.</p>
            <div className="hero-actions">
              <Link to="/chatbot" className="btn btn-primary btn-lg">
                🤖 Try Chatbot
              </Link>
              <Link to="/houses" className="btn btn-outline btn-lg">
                Browse Houses
              </Link>
            </div>
          </div>

          <div className="hero-art">
            <img src={heroImg} alt="House hunting illustration" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container landing-container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Chat with Our Bot</h3>
              <p>Tell us your budget, preferred location, and house type.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Browse Listings</h3>
              <p>Explore verified house listings across Kenya.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Book & Pay via M-Pesa</h3>
              <p>Secure one-time payment to confirm serious bookings.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>For Landlords</h3>
              <p>Manage listings, bookings, and revenue in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt">
        <div className="container landing-container" style={{ textAlign: 'center' }}>
          <h2>Ready to Find Your Home?</h2>
          <p>Join thousands of Kenyans who found their perfect home through HouseHunt.</p>
          {isAuth ? (
            <Link to="/houses" className="btn btn-primary btn-lg">Browse Houses</Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg">Get Started — Free</Link>
          )}
        </div>
      </section>

      {/* Featured listings */}
      <section className="section">
        <div className="container landing-container">
          <h2 className="section-title">Featured Listings</h2>

          {featured.length === 0 ? (
            <div className="empty-state">No listings available right now.</div>
          ) : (
            <div className="featured-grid">
              {featured.map((house) => (
                <Link
                  key={house.id}
                  className="featured-card"
                  to={`/houses/${house.id}`}
                >
                  <div className="featured-card-media">
                    {house.images && house.images.length > 0 ? (
                      <img src={house.images[0]} alt={house.title} />
                    ) : (
                      <div className="featured-card-placeholder">🏠</div>
                    )}
                    <span className="featured-badge">
                      Ksh{' '}
                      {Number(house.rent || 0).toLocaleString('en-KE', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      / month
                    </span>
                  </div>

                  <div className="featured-card-body">
                    <h3>{house.title}</h3>
                    <p className="muted">📍 {house.location_name || house.county || 'Kenya'}</p>
                    <span className="btn btn-primary btn-sm">View Details</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
