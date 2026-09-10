<<<<<<< HEAD
import { Navigate, Routes, Route } from 'react-router-dom';
=======
import { Routes, Route } from 'react-router-dom';
>>>>>>> origin/main
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
<<<<<<< HEAD

// Preserved Public / Auth Pages
=======
>>>>>>> origin/main
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
<<<<<<< HEAD

// Authenticated Student Pages
import { CampusFeedPage } from './pages/CampusFeedPage';
import { CampusExplorerPage } from './pages/CampusExplorerPage';
import { SearchPage } from './pages/SearchPage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { MessagesPage } from './pages/MessagesPage';
import { UserRecoveryPage } from './pages/UserRecoveryPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRecoveryPage } from './pages/admin/AdminRecoveryPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminCampusPage } from './pages/admin/AdminCampusPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import './App.css';

import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLandingOrAuthOrAdmin =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/admin');

  return (
    <div className="app min-h-screen flex flex-col bg-findlyBg text-findlyTextPrimary">
      <Navbar />
      <main className={`app__main flex-1 ${isLandingOrAuthOrAdmin ? '' : 'pt-20'}`}>
        <Routes>
          {/* 1. Public / Preserved Landing & Auth */}
=======
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { SearchPage } from './pages/SearchPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">
        <Routes>
>>>>>>> origin/main
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
<<<<<<< HEAD

          {/* 2. Authenticated Student / Campus Ecosystem */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <CampusFeedPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route
            path="/campus"
            element={
              <ProtectedRoute>
                <CampusExplorerPage />
=======
          <Route
            path="/report/lost"
            element={
              <ProtectedRoute>
                <ReportLostPage />
>>>>>>> origin/main
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportItemPage />
              </ProtectedRoute>
            }
          />
          <Route path="/report/lost" element={<Navigate to="/report?type=LOST" replace />} />
          <Route path="/report/found" element={<Navigate to="/report?type=FOUND" replace />} />
          <Route
            path="/items/:id"
            element={
              <ProtectedRoute>
                <ItemDetailsPage />
              </ProtectedRoute>
            }
          />
=======
            path="/report/found"
            element={
              <ProtectedRoute>
                <ReportFoundPage />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchPage />} />
>>>>>>> origin/main
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <MyReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recovery"
            element={
              <ProtectedRoute>
                <UserRecoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* 3. Administrative Operations Suite */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
=======
            path="/admin"
            element={
              <ProtectedRoute>
>>>>>>> origin/main
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/recovery"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminRecoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campus"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCampusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 4. Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
=======
>>>>>>> origin/main
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
