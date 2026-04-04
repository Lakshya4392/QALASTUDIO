import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { UserAuthProvider, useUserAuth } from './contexts/UserAuthContext';
import { ContentProvider } from './contexts/ContentContext';
import ErrorBoundary from './components/ErrorBoundary';
import GoogleAnalytics from './components/GoogleAnalytics';

// Main Website Components (with Navbar/Footer) - Lazy loaded for code splitting
const MainLayout = lazy(() => import('./components/MainLayout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const StudiosPage = lazy(() => import('./pages/StudiosPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GoldenHourPage = lazy(() => import('./pages/GoldenHourPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BookPage = lazy(() => import('./pages/BookPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Admin Components - Lazy loaded
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminBookingsPage = lazy(() => import('./components/admin/AdminBookingsPage'));
const AdminStudiosPage = lazy(() => import('./components/admin/AdminStudiosPage'));
const AdminProjectsPage = lazy(() => import('./components/admin/AdminProjectsPage'));
const AdminEnquiriesPage = lazy(() => import('./components/admin/AdminEnquiriesPage'));
const AdminContentPage = lazy(() => import('./components/admin/AdminContentPage'));
const AdminSettingsPage = lazy(() => import('./components/admin/AdminSettingsPage'));

// Protected Route Component
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Protected User Route - redirects to login if not authenticated
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return <>{children}</>;
};

// Loading fallback for code-split chunks
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-4" />
      <p className="text-neutral-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <AdminAuthProvider>
        <UserAuthProvider>
          <ContentProvider>
            <Router>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Main Website Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="studios" element={<StudiosPage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="golden-hour" element={<GoldenHourPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="my-bookings" element={<MyBookingsPage />} />
                  {/* Protected user routes */}
                  <Route path="book" element={
                    <ProtectedUserRoute>
                      <BookPage />
                    </ProtectedUserRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedUserRoute>
                      <ProfilePage />
                    </ProtectedUserRoute>
                  } />
                </Route>

                {/* User Auth */}
                <Route path="/login" element={<LoginPage />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="studios" element={<AdminStudiosPage />} />
                  <Route path="projects" element={<AdminProjectsPage />} />
                  <Route path="enquiries" element={<AdminEnquiriesPage />} />
                  <Route path="content" element={<AdminContentPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Router>
        </ContentProvider>
        </UserAuthProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
