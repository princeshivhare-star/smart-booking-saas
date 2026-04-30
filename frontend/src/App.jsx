import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Public
import LandingPage from './pages/LandingPage';
import BusinessListPage from './pages/BusinessListPage';
import BookingPage from './pages/BookingPage';

// Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminServices from './pages/admin/AdminServices';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminSettings from './pages/admin/AdminSettings';

// Staff
import StaffLayout from './components/layout/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffSchedule from './pages/staff/StaffSchedule';

// Customer
import CustomerLayout from './components/layout/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerProfile from './pages/customer/CustomerProfile';

import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin" replace />;
  if (user.role === 'staff')    return <Navigate to="/staff" replace />;
  if (user.role === 'customer') return <Navigate to="/customer" replace />;
  return <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/businesses" element={<BusinessListPage />} />
      <Route path="/book/:businessId" element={<BookingPage />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Staff */}
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffLayout /></ProtectedRoute>}>
        <Route index element={<StaffDashboard />} />
        <Route path="schedule" element={<StaffSchedule />} />
      </Route>

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<CustomerDashboard />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
