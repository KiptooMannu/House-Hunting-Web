import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import HouseListings from './pages/HouseListings';
import HouseDetail from './pages/HouseDetail';
import Chatbot from './pages/Chatbot';
import BookingConfirmed from './pages/BookingConfirmed';
import UserProfile from './pages/user-dashboard/UserProfile';
import UserDashboard from './pages/user-dashboard/UserDashboard';
import BookingProcess from './pages/user-dashboard/BookingProcess';
import MarketInsights from './pages/admin-landlord/MarketInsights';

import MyBookings from './pages/user-dashboard/MyBookings';
import LandlordDashboard from './pages/admin-landlord/LandlordDashboard';
import CreateListing from './pages/admin-landlord/CreateListing';
import AdminDashboard from './pages/admin-landlord/AdminDashboard';
import TestEndpoints from './pages/admin-landlord/TestEndpoints';

export default function App() {
  return (
    <div className="app-shell flex flex-col min-h-screen">
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
          <Route path="/booking-confirmed" element={<BookingConfirmed />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <BookingProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['user', 'landlord', 'seeker', 'admin']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/create-listing"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/test-api" element={<ProtectedRoute allowedRoles={['admin']}><TestEndpoints /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}

