import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Sun,
  Moon,

  ChevronDown,
  LogOut,
  Settings,
  Heart,
  Package,
  FileText,
  Grid3X3,
  Building2,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../hooks';
import { cn } from '../../utils';
import Logo from '../ui/Logo';
import { UserRole } from '../../types';

export default function Header() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medications?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Core navigation items that are always visible
  const getCoreNavigationItems = () => {
    return [
      { href: '/medications', label: t('common:navigation.medications') },
    ];
  };

  // Patient-specific navigation
  const getPatientNavigation = () => {
    if (!isAuthenticated || !user || user.role !== UserRole.PATIENT) return [];
    return [
      { href: '/prescriptions', label: t('common:navigation.prescriptions') },
      { href: '/orders', label: t('common:navigation.orders') },
      { href: '/digital-vault', label: 'Digital Vault' }
    ];
  };

  // Dashboard items for dropdown
  const getDashboardItems = () => {
    if (!isAuthenticated || !user) return [];

    const dashboards = [];

    // Pharmacist-specific dashboard
    if (user.role === UserRole.PHARMACIST || user.role === UserRole.ADMIN) {
      dashboards.push({
        href: '/pharmacy-dashboard',
        label: 'Pharmacy Dashboard',
        icon: Building2,
        description: 'Manage pharmacy operations'
      });
    }

    // Government official dashboard
    if (user.role === UserRole.GOVERNMENT_OFFICIAL || user.role === UserRole.ADMIN) {
      dashboards.push({
        href: '/government-dashboard',
        label: 'Government Dashboard',
        icon: Shield,
        description: 'Government oversight tools'
      });
    }

    // Insurance provider dashboard
    if (user.role === UserRole.INSURANCE_PROVIDER || user.role === UserRole.ADMIN) {
      dashboards.push({
        href: '/insurance-dashboard',
        label: 'Insurance Dashboard',
        icon: FileText,
        description: 'Insurance management'
      });
    }

    return dashboards;
  };

  const coreNavigation = getCoreNavigationItems();
  const patientNavigation = getPatientNavigation();
  const dashboardItems = getDashboardItems();

  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);

  const userMenuItems = [
    {
      icon: User,
      label: t('common:navigation.profile'),
      href: '/profile'
    },
    {
      icon: Package,
      label: t('common:navigation.orders'),
      href: '/orders'
    },
    {
      icon: FileText,
      label: t('common:navigation.prescriptions'),
      href: '/prescriptions'
    },
    {
      icon: Heart,
      label: 'Favorites',
      href: '/favorites'
    },
    {
      icon: Settings,
      label: t('common:navigation.settings'),
      href: '/settings'
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="transition-transform duration-200 hover:scale-105">
              <Logo size="md" className="animate-fade-in" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('pharmacy:header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Core Navigation */}
              {coreNavigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400",
                    location.pathname === item.href
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Patient Navigation */}
              {patientNavigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400",
                    location.pathname === item.href
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Dashboards Dropdown */}
              {dashboardItems.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                    className={cn(
                      "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400",
                      dashboardItems.some(item => location.pathname === item.href)
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span>Dashboards</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dashboard Dropdown Menu */}
                  {isDashboardMenuOpen && (
                    <div className="absolute left-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-2">
                        {dashboardItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsDashboardMenuOpen(false)}
                            className={cn(
                              "flex items-start px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                              location.pathname === item.href
                                ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                                : "text-gray-700 dark:text-gray-300"
                            )}
                          >
                            <item.icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-xs font-medium text-white flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                    {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        {t('common:navigation.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn btn-ghost btn-sm"
                >
                  {t('common:navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  {t('common:navigation.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {/* Mobile Search */}
            <div className="mb-4 md:hidden">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('pharmacy:header.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-1">
              {/* Core Navigation */}
              {coreNavigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-base font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Patient Navigation */}
              {patientNavigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-base font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Dashboard Navigation */}
              {dashboardItems.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dashboards
                  </div>
                  {dashboardItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors",
                        location.pathname === item.href
                          ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isUserMenuOpen || isDashboardMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsDashboardMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
