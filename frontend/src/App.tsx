import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeout from './components/SessionTimeout';

// Seeker / Public / User Dashboard
import Landing from './pages/seeker/Landing';
import Login from './pages/seeker/Login';
import Register from './pages/seeker/Register';
import HouseListings from './pages/seeker/HouseListings';
import HouseDetail from './pages/seeker/HouseDetail';
import Chatbot from './pages/seeker/Chatbot';
import BookingConfirmed from './pages/seeker/BookingConfirmed';
import UserDashboard from './pages/seeker/UserDashboard';
import Overview from './pages/seeker/Overview';
import DiscoveryCanvas from './pages/seeker/DiscoveryCanvas';
import SavedHomes from './pages/seeker/SavedHomes';
import BookingHistory from './pages/seeker/BookingHistory';
import UserInsights from './pages/seeker/MarketInsights';
import Settings from './pages/seeker/Settings';
import BookingForm from './pages/seeker/BookingForm';
import TermsPrivacy from './pages/seeker/TermsPrivacy';
import PaymentStatus from './pages/seeker/PaymentStatus';
import BookedSuccess from './pages/seeker/BookedSuccess';


// Landlord / Admin
import LandlordDashboard from './pages/landlord/LandlordDashboard';
import LandlordOverview from './pages/landlord/LandlordOverview';
import MyManagedBookings from './pages/landlord/MyManagedBookings';
import MyManagedProperties from './pages/landlord/MyManagedProperties';
import MpesaLedger from './pages/landlord/MpesaLedger';
import ComplianceModule from './pages/landlord/ComplianceModule';
import IntelligenceHub from './pages/landlord/IntelligenceHub';
import AIConcierge from './pages/landlord/AIConcierge';
import CreateListing from './pages/landlord/CreateListing';
import TestEndpoints from './pages/landlord/TestEndpoints';
import MarketInsights from './pages/landlord/MarketInsights';
import LandlordOnboarding from './pages/landlord/LandlordOnboarding';
import RoleBasedRedirect from './components/RoleBasedRedirect';

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

          {/* ✅ Payment status page (polling for M-Pesa & card) */}
          <Route path="/payment_status" element={<PaymentStatus />} />
          <Route path="/booked-success" element={<BookedSuccess />} />


          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="canvas" element={<DiscoveryCanvas />} />
            <Route path="saved" element={<SavedHomes />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="insights" element={<UserInsights />} />
            <Route path="profile" element={<Settings />} />
          </Route>
          <Route path="/dashboard" element={<RoleBasedRedirect userPath="/user/overview" landlordPath="/landlord/overview" />} />
          <Route path="/profile" element={<RoleBasedRedirect userPath="/user/profile" landlordPath="/landlord/settings" />} />
          <Route path="/my-bookings" element={<RoleBasedRedirect userPath="/user/bookings" landlordPath="/landlord/bookings" />} />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          {/* Keep for backward compatibility; can be removed after full migration */}


          {/* Consolidated Admin/Landlord Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/landlord/overview" replace />}
          />
          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRoles={['admin', 'landlord']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<LandlordOverview />} />
            <Route path="bookings" element={<MyManagedBookings />} />
            <Route path="properties" element={<MyManagedProperties />} />
            <Route path="revenue" element={<MpesaLedger />} />
            <Route path="compliance" element={<ComplianceModule />} />
            <Route path="intelligence" element={<IntelligenceHub />} />
            <Route path="concierge" element={<AIConcierge />} />
            <Route path="settings" element={<Settings />} />
            <Route path="create-listing" element={<CreateListing />} />
          </Route>
          <Route path="/test-api" element={<ProtectedRoute allowedRoles={['admin']}><TestEndpoints /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}