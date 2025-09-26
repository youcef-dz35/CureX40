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
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
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
            <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <OrdersPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <AppLayout>
            <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <CartPage />
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
