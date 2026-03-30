import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formattedRole = isAuth && user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  const initials = isAuth && user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : '';

  function handleLogout() {
    logout();
    navigate('/');
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>🏠 HouseHunt KE</Link>

        <button 
          className="navbar-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/houses" onClick={closeMobileMenu}>Houses</Link>
          <Link to="/chatbot" onClick={closeMobileMenu}>Chatbot</Link>

          {isAuth && user.role === 'user' && (
            <Link to="/my-bookings" onClick={closeMobileMenu}>My Bookings</Link>
          )}

          {isAuth && user.role === 'landlord' && (
            <Link to="/landlord" onClick={closeMobileMenu}>Dashboard</Link>
          )}

          {isAuth && user.role === 'admin' && (
            <Link to="/admin" onClick={closeMobileMenu}>Admin</Link>
          )}

          {isAuth ? (
            <div className="navbar-user">
              <span className="navbar-role">{formattedRole}</span>
              <span className="navbar-name">{initials}</span>
              <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="btn btn-outline btn-sm">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" onClick={closeMobileMenu} className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
