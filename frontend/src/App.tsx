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
import MedicationsPage from "./pages/MedicationsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

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
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/medications" element={<MedicationsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient routes */}
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PrescriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/digital-vault"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <DigitalVault />
          </ProtectedRoute>
        }
      />

      {/* Pharmacy routes */}
      <Route
        path="/pharmacy-dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PHARMACIST, UserRole.ADMIN]}>
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Government routes */}
      <Route
        path="/government-dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.GOVERNMENT_OFFICIAL, UserRole.ADMIN]}>
            <GovernmentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Insurance routes */}
      <Route
        path="/insurance-dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.INSURANCE_PROVIDER, UserRole.ADMIN]}>
            <ClaimsDashboard />
          </ProtectedRoute>
        }
      />

      {/* General protected routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
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
                <AppLayout>
                  <AppRoutes />
                </AppLayout>
              </Suspense>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
