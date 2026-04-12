import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeout from './components/SessionTimeout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import HouseListings from './pages/HouseListings';
import HouseDetail from './pages/HouseDetail';
import Chatbot from './pages/Chatbot';
import BookingConfirmed from './pages/BookingConfirmed';
import UserDashboard from './pages/user-dashboard/UserDashboard';
import BookingForm from './pages/BookingForm';
import MarketInsights from './pages/admin-landlord/MarketInsights';
import LandlordOnboarding from './pages/admin-landlord/LandlordOnboarding';
import TermsPrivacy from './pages/TermsPrivacy';
import Messages from './pages/admin-landlord/Messages';
import BookedSuccess from './pages/BookedSuccess';

import LandlordDashboard from './pages/admin-landlord/LandlordDashboard';
import CreateListing from './pages/admin-landlord/CreateListing';
import TestEndpoints from './pages/admin-landlord/TestEndpoints';

export default function App() {
  return (
    <div className="app-shell flex flex-col min-h-screen text-left">
      <SessionTimeout />
      <Navbar />

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/houses" element={<HouseListings />} />
          <Route path="/houses/:id" element={<HouseDetail />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/insights" element={<MarketInsights />} />
          <Route path="/onboarding" element={<LandlordOnboarding />} />
          <Route path="/booking-confirmed" element={<BookingConfirmed />} />
          <Route path="/terms" element={<TermsPrivacy />} />
          <Route path="/privacy" element={<TermsPrivacy />} />

          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/user/overview" replace />} />
          <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
          <Route path="/my-bookings" element={<Navigate to="/user/bookings" replace />} />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          <Route path="/booked-success" element={<BookedSuccess />} />
          {/* Consolidated Admin/Landlord Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/landlord/overview" replace />}
          />
          <Route
            path="/landlord/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'landlord']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
             path="/messages"
             element={
               <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                 <Messages />
               </ProtectedRoute>
             }
          />
          <Route
            path="/landlord/create-listing"
            element={
              <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route path="/test-api" element={<ProtectedRoute allowedRoles={['admin']}><TestEndpoints /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}

