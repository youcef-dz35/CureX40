import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  Bell,
  Clock,
  Thermometer,
  Droplets,
  Zap,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { SmartShelf, ShelfStatus, SensorStatus, AIInsight, ImpactLevel } from '../../types';

export default function PharmacyDashboard() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const [activeTab, setActiveTab] = useState<'overview' | 'shelves' | 'inventory' | 'analytics'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    totalMedications: 1245,
    lowStock: 23,
    expiringSoon: 8,
    revenue: 15420,
    orders: 156,
    prescriptions: 89,
    revenueChange: 12.5,
    ordersChange: -3.2,
    prescriptionsChange: 8.1
  });

  const [smartShelves, setSmartShelves] = useState<SmartShelf[]>([
    {
      id: '1',
      pharmacyId: 'pharmacy1',
      shelfCode: 'A1-01',
      location: 'Section A, Aisle 1',
      temperature: 22.5,
      humidity: 45.2,
      capacity: 100,
      currentStock: 87,
      medications: [],
      sensors: [
        {
          id: '1',
          type: 'temperature' as any,
          value: 22.5,
          unit: '°C',
          threshold: { min: 15, max: 25, unit: '°C' },
          status: SensorStatus.NORMAL,
          lastReading: new Date().toISOString()
        },
        {
          id: '2',
          type: 'humidity' as any,
          value: 45.2,
          unit: '%',
          threshold: { min: 30, max: 60, unit: '%' },
          status: SensorStatus.NORMAL,
          lastReading: new Date().toISOString()
        }
      ],
      status: ShelfStatus.ACTIVE,
      lastMaintenance: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      pharmacyId: 'pharmacy1',
      shelfCode: 'A1-02',
      location: 'Section A, Aisle 2',
      temperature: 26.1,
      humidity: 52.8,
      capacity: 100,
      currentStock: 45,
      medications: [],
      sensors: [
        {
          id: '3',
          type: 'temperature' as any,
          value: 26.1,
          unit: '°C',
          threshold: { min: 15, max: 25, unit: '°C' },
          status: SensorStatus.WARNING,
          lastReading: new Date().toISOString()
        }
      ],
      status: ShelfStatus.ACTIVE,
      lastMaintenance: '2024-01-10T14:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ]);

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'expiry_alert' as any,
      title: 'Medications Expiring Soon',
      description: '8 medications will expire within 30 days. Consider FIFO rotation.',
      confidence: 0.95,
      impact: ImpactLevel.HIGH,
      actionRequired: true,
      recommendations: ['Rotate stock using FIFO', 'Contact supplier for fresh inventory'],
      affectedEntities: ['shelf-A1-01', 'shelf-B2-03'],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'demand_forecast' as any,
      title: 'High Demand Expected',
      description: 'Paracetamol demand expected to increase by 40% next week.',
      confidence: 0.87,
      impact: ImpactLevel.MEDIUM,
      actionRequired: false,
      recommendations: ['Increase stock levels', 'Monitor closely'],
      affectedEntities: ['paracetamol-500mg'],
      createdAt: new Date().toISOString()
    }
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusIcon = (status: ShelfStatus | SensorStatus) => {
    switch (status) {
      case 'active':
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ShelfStatus | SensorStatus) => {
    switch (status) {
      case 'active':
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pharmacy Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Smart inventory management and analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg bg-curex-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-curex-teal-700">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'shelves', label: 'Smart Shelves', icon: Package },
              { key: 'inventory', label: 'Inventory', icon: Eye },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 border-b-2 pb-4 text-sm font-medium ${
                  activeTab === key
                    ? 'border-curex-teal-500 text-curex-teal-600 dark:text-curex-teal-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Medications
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboardData.totalMedications.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Low Stock Alerts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboardData.lowStock}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Expiring Soon
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboardData.expiringSoon}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Today's Revenue
                        </dt>
                        <dd className="flex items-center">
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            ${dashboardData.revenue.toLocaleString()}
                          </span>
                          <span className={`ml-2 flex items-center text-sm ${
                            dashboardData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {dashboardData.revenueChange >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(dashboardData.revenueChange)}%
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  AI Insights & Recommendations
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`border rounded-lg p-4 ${
                        insight.impact === ImpactLevel.CRITICAL
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : insight.impact === ImpactLevel.HIGH
                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {insight.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {insight.description}
                          </p>
                          {insight.actionRequired && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                Recommended Actions:
                              </h5>
                              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                {insight.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className="w-1 h-1 bg-curex-teal-500 rounded-full mr-2" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            insight.impact === ImpactLevel.CRITICAL
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : insight.impact === ImpactLevel.HIGH
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {insight.impact.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Shelves Tab */}
        {activeTab === 'shelves' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Smart Shelf Monitoring
              </h2>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {smartShelves.map((shelf) => (
                <div key={shelf.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {shelf.shelfCode}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {shelf.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(shelf.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(shelf.status)}`}>
                          {shelf.status}
                        </span>
                      </div>
                    </div>

                    {/* Stock Level */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mb-1">
                        <span>Stock Level</span>
                        <span>{shelf.currentStock}/{shelf.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full ${
                            shelf.currentStock / shelf.capacity > 0.7
                              ? 'bg-green-600'
                              : shelf.currentStock / shelf.capacity > 0.3
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${(shelf.currentStock / shelf.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Sensors */}
                    <div className="grid grid-cols-2 gap-4">
                      {shelf.sensors.map((sensor) => (
                        <div key={sensor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {sensor.type === 'temperature' ? (
                                <Thermometer className="h-4 w-4 text-red-500" />
                              ) : (
                                <Droplets className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {sensor.type}
                              </span>
                            </div>
                            {getStatusIcon(sensor.status)}
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {sensor.value}{sensor.unit}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Range: {sensor.threshold.min}-{sensor.threshold.max}{sensor.threshold.unit}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Last maintenance: {new Date(shelf.lastMaintenance).toLocaleDateString()}</span>
                        <button className="text-curex-teal-600 hover:text-curex-teal-800 dark:text-curex-teal-400">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Inventory Management
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Inventory Management
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Advanced inventory features coming soon...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Analytics & Reporting
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Advanced analytics and reporting features coming soon...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
