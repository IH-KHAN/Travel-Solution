import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from '@/context/NotificationContext';

// ── Layouts ─────────────────────────────────────────────────────
import PublicLayout    from '@/components/client/layout/PublicLayout';
import AppLayout       from '@/components/layout/AppLayout';        // admin layout
import ProtectedRoute  from '@/components/layout/ProtectedRoute';

// ── Client pages ─────────────────────────────────────────────────
import HomePage from '@/pages/client/HomePage';
import LoginPage from '@/pages/LoginPage';
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage'));
// ── Admin pages (lazy-loaded) ────────────────────────────────────
const DashboardPage   = React.lazy(() => import('@/pages/DashboardPage'));
const PackagesPage    = React.lazy(() => import('@/pages/PackagesPage'));
const HotelsPage      = React.lazy(() => import('@/pages/HotelsPage'));
const RestaurantsPage = React.lazy(() => import('@/pages/RestaurantsPage'));
const GeographiesPage = React.lazy(() => import('@/pages/GeographiesPage'));
const UsersPage       = React.lazy(() => import('@/pages/UsersPage'));

// ── Client pages (lazy-loaded) ───────────────────────────────────
const ToursListPage      = React.lazy(() => import('@/pages/client/ToursListPage'));
const TourDetailPage     = React.lazy(() => import('@/pages/client/TourDetailPage'));
const HotelsListPage     = React.lazy(() => import('@/pages/client/HotelsListPage'));
const HotelDetailPage    = React.lazy(() => import('@/pages/client/HotelDetailPage'));
const RestaurantsListPage = React.lazy(() => import('@/pages/client/RestaurantsListPage'));
const RestaurantDetailPage = React.lazy(() => import('@/pages/client/RestaurantDetailPage'));
const UserProfilePage    = React.lazy(() => import('@/pages/client/UserProfilePage'));
const DestinationsPage   = React.lazy(() => import('@/pages/client/DestinationsPage'));
const CustomTourRequestPage = React.lazy(() => import('@/pages/client/CustomTourRequestPage'));
const PaymentPage           = React.lazy(() => import('@/pages/client/PaymentPage'));
const RefundRequestPage     = React.lazy(() => import('@/pages/client/RefundRequestPage'));

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <span className="w-8 h-8 border-2 border-t-yellow-400 border-slate-200 rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => (
  <NotificationProvider>
    <BrowserRouter>
      <React.Suspense fallback={<Spinner />}>
        <Routes>

          {/* ── Public / Client Routes ───────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"             element={<HomePage />} />
            <Route path="/tours"        element={<ToursListPage />} />
            <Route path="/tours/:id"    element={<TourDetailPage />} />
            <Route path="/hotels"       element={<HotelsListPage />} />
            <Route path="/hotels/:id"   element={<HotelDetailPage />} />
            <Route path="/restaurants"     element={<RestaurantsListPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            <Route path="/profile"         element={<UserProfilePage />} />
            <Route path="/my-bookings"     element={<Navigate to="/profile" replace />} />
            <Route path="/destinations"    element={<DestinationsPage />} />
            <Route path="/request-custom-tour" element={<CustomTourRequestPage />} />
            <Route path="/payment/:bookingType/:bookingId" element={<PaymentPage />} />
            <Route path="/request-refund/:bookingType/:bookingId" element={<RefundRequestPage />} />
          </Route>

          {/* ── Auth pages (no layout) ───────────────────────────── */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Admin Routes (protected, sidebar layout) ─────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/packages"       element={<PackagesPage />} />
            <Route path="/admin/hotels"   element={<HotelsPage />} />
            <Route path="/admin/restaurants" element={<RestaurantsPage />} />
            <Route path="/geographies"    element={<GeographiesPage />} />
            <Route path="/users"          element={<UsersPage />} />
          </Route>

          {/* ── 404 fallback ────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  </NotificationProvider>
);

export default App;
