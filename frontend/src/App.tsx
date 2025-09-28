import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useTranslation } from "react-i18next";
import "./services/i18n"; // Initialize i18n

// Import components (we'll create these next)
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Import pages (we'll create these next)
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import MedicationsPage from "./pages/MedicationsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFoundPage from "./pages/NotFoundPage";

// Import test components (commented out for production)
// import ApiTest from "./components/test/ApiTest";
// import ConnectionTest from "./components/test/ConnectionTest";
// import TestHomePage from "./pages/TestHomePage";

// Role-based pages
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import GovernmentDashboard from "./pages/government/GovernmentDashboard";
import DigitalVault from "./pages/patient/DigitalVault";
import ClaimsDashboard from "./pages/insurance/ClaimsDashboard";

// Import types
import { UserRole } from "./types";
import { useAuth } from "./context/AuthContext";

// Loading component
function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading CureX40...
        </p>
      </div>
    </div>
  );
}

// Main App layout
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}



// Protected Route component for role-based access
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[]
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-curex-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to access this page.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Your Role: <span className="font-medium">{user.role}</span>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Required Roles: <span className="font-medium">{allowedRoles?.join(', ') || 'Any authenticated user'}</span>
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/home"
              className="inline-flex items-center px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Standalone routes (no main header/footer) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public routes with main layout */}
      <Route path="/home" element={
        <AppLayout>
          <HomePage />
        </AppLayout>
      } />
      <Route path="/medications" element={
        <AppLayout>
          <MedicationsPage />
        </AppLayout>
      } />

      {/* Test routes (commented out for production) */}
      {/* <Route path="/test-api" element={<ApiTest />} />
      <Route path="/test-connection" element={<ConnectionTest />} /> */}

      {/* Patient routes */}
      <Route
        path="/prescriptions"
        element={
          <AppLayout>
            <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <PrescriptionsPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/orders"
        element={
          <AppLayout>
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <AppLayout>
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/favorites"
        element={
          <AppLayout>
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/digital-vault"
        element={
          <AppLayout>
            <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <DigitalVault />
            </ProtectedRoute>
          </AppLayout>
        }
      />

      {/* Pharmacy routes */}
      <Route
        path="/pharmacy-dashboard"
        element={
          <AppLayout>
            <ProtectedRoute allowedRoles={[UserRole.PHARMACIST, UserRole.ADMIN]}>
              <PharmacyDashboard />
            </ProtectedRoute>
          </AppLayout>
        }
      />

      {/* Government routes */}
      <Route
        path="/government-dashboard"
        element={
          <AppLayout>
            <ProtectedRoute allowedRoles={[UserRole.GOVERNMENT_OFFICIAL, UserRole.ADMIN]}>
              <GovernmentDashboard />
            </ProtectedRoute>
          </AppLayout>
        }
      />

      {/* Insurance routes */}
      <Route
        path="/insurance-dashboard"
        element={
          <AppLayout>
            <ProtectedRoute allowedRoles={[UserRole.INSURANCE_PROVIDER, UserRole.ADMIN]}>
              <ClaimsDashboard />
            </ProtectedRoute>
          </AppLayout>
        }
      />

      {/* General protected routes */}
      <Route
        path="/profile"
        element={
          <AppLayout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </AppLayout>
        }
      />

      {/* 404 page */}
      <Route path="*" element={
        <AppLayout>
          <NotFoundPage />
        </AppLayout>
      } />
    </Routes>
  );
}

// Main App component
function App() {
  const { i18n } = useTranslation();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App" dir={i18n.dir()}>
              <Suspense fallback={<AppLoading />}>
                <AppRoutes />
              </Suspense>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
