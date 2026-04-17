import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeout from './components/SessionTimeout';
import MobileBottomNav from './components/MobileBottomNav';
import { Toaster } from 'react-hot-toast';

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

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import VerificationQueue from './pages/admin/VerificationQueue';
import AdminManagedProperties from './pages/admin/ManagedProperties';
import LandlordDirectory from './pages/admin/LandlordDirectory';
import AuditLogs from './pages/admin/AuditLogs';
import AdminCompliance from './pages/admin/AdminCompliance';
import SeekerDirectory from './pages/admin/SeekerDirectory';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  const { pathname } = useLocation();

  // Hide global elements on specific specialized pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandlordPage = pathname.startsWith('/landlord');
  const isAdminPage = pathname.startsWith('/admin');
  const isUserDashboard = pathname.startsWith('/user');
  const isHiddenPage = isAuthPage || isLandlordPage || isAdminPage || isUserDashboard;

  return (
    <div className="app-shell flex flex-col min-h-screen text-left">
      <Toaster position="top-right" reverseOrder={false} />
      <SessionTimeout />
      {!isHiddenPage && <Navbar />}

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
          
          <Route path="/dashboard" element={<RoleBasedRedirect userPath="/user/overview" landlordPath="/landlord/overview" adminPath="/admin/overview" />} />
          <Route path="/profile" element={<RoleBasedRedirect userPath="/user/profile" landlordPath="/landlord/settings" adminPath="/admin/settings" />} />
          <Route path="/my-bookings" element={<RoleBasedRedirect userPath="/user/bookings" landlordPath="/landlord/bookings" adminPath="/admin/overview" />} />
          
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute allowedRoles={['user', 'seeker', 'landlord', 'admin']}>
                <BookingForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="approvals" element={<VerificationQueue />} />
            <Route path="properties" element={<AdminManagedProperties />} />
            <Route path="landlords" element={<LandlordDirectory />} />
            <Route path="seekers" element={<SeekerDirectory />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="compliance" element={<AdminCompliance />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
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

      {!isHiddenPage && <Footer />}
      {!isHiddenPage && <ChatbotWidget />}
      <MobileBottomNav />
    </div>
  );
}