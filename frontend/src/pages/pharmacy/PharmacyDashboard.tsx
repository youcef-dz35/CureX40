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
import { dashboardService, DashboardData } from '../../services/dashboardService';

export default function PharmacyDashboard() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const [activeTab, setActiveTab] = useState<'overview' | 'shelves' | 'inventory' | 'analytics'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Real API data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getPharmacyDashboard();
      console.log('Dashboard data received:', data);
      console.log('Stats:', data?.stats);
      console.log('Inventory summary:', data?.inventory_summary);
      setDashboardData(data);
      
      // Generate smart shelves based on inventory categories
      if (data?.inventory_summary?.categories) {
        const shelves: SmartShelf[] = Object.entries(data.inventory_summary.categories)
          .filter(([category, categoryData]) => category && categoryData) // Filter out undefined/null entries
          .map(([category, categoryData]: [string, any], index) => ({
            id: `shelf-${index + 1}`,
            shelfCode: `SHELF-${(category || 'UNKNOWN').toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
            location: `${(category || 'Unknown').charAt(0).toUpperCase() + (category || 'Unknown').slice(1)} Section`,
            status: (categoryData?.total_stock || 0) > 100 ? 'operational' : (categoryData?.total_stock || 0) > 50 ? 'warning' : 'critical',
            currentStock: categoryData?.total_stock || 0,
            capacity: Math.max((categoryData?.total_stock || 0) * 1.5, 200),
          sensors: [
            {
              id: `temp-${index + 1}`,
              type: 'temperature',
              value: 18 + Math.random() * 4,
              unit: '°C',
              status: 'operational',
              threshold: { min: 15, max: 25, unit: '°C' }
            },
            {
              id: `humidity-${index + 1}`,
              type: 'humidity',
              value: 45 + Math.random() * 10,
              unit: '%',
              status: 'operational',
              threshold: { min: 40, max: 60, unit: '%' }
            }
          ],
          lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        setSmartShelves(shelves);
      } else {
        // Fallback: create a default shelf if no categories are available
        setSmartShelves([{
          id: 'shelf-default',
          shelfCode: 'SHELF-DEFAULT-01',
          location: 'General Section',
          status: 'operational',
          currentStock: 0,
          capacity: 200,
          sensors: [
            {
              id: 'temp-default',
              type: 'temperature',
              value: 20,
              unit: '°C',
              status: 'operational',
              threshold: { min: 15, max: 25, unit: '°C' }
            },
            {
              id: 'humidity-default',
              type: 'humidity',
              value: 50,
              unit: '%',
              status: 'operational',
              threshold: { min: 40, max: 60, unit: '%' }
            }
          ],
          lastMaintenance: new Date().toISOString()
        }]);
      }
      
      // Generate AI insights based on the data
      const insights: AIInsight[] = [];
      
      if (data?.inventory_summary?.low_stock_count > 0) {
        insights.push({
          id: 'low-stock-alert',
          type: 'warning',
          title: 'Low Stock Alert',
          description: `${data.inventory_summary.low_stock_count} medications are running low on stock. Consider reordering soon.`,
          confidence: 0.95,
          impact: ImpactLevel.HIGH,
          actionRequired: true,
          recommendations: ['Review inventory levels', 'Place orders for low-stock items', 'Set up automated reorder alerts'],
          affectedEntities: ['Inventory Management', 'Supply Chain'],
          createdAt: new Date().toISOString()
        });
      }
      
      if (data?.stats?.total_revenue && parseFloat(data.stats.total_revenue) > 100) {
        insights.push({
          id: 'revenue-insight',
          type: 'success',
          title: 'Revenue Performance',
          description: `Strong revenue performance with $${parseFloat(data.stats.total_revenue).toFixed(2)} in total revenue.`,
          confidence: 0.88,
          impact: ImpactLevel.MEDIUM,
          actionRequired: false,
          recommendations: ['Continue current sales strategies', 'Consider expanding popular product lines', 'Analyze top-performing categories'],
          affectedEntities: ['Sales Performance', 'Revenue Analytics'],
          createdAt: new Date().toISOString()
        });
      }
      
      if (data?.inventory_summary?.categories) {
        const totalCategories = Object.keys(data.inventory_summary.categories).length;
        if (totalCategories > 1) {
          insights.push({
            id: 'category-diversity',
            type: 'info',
            title: 'Inventory Diversity',
            description: `Good inventory diversity with ${totalCategories} different medication categories in stock.`,
            confidence: 0.92,
            impact: ImpactLevel.LOW,
            actionRequired: false,
            recommendations: ['Maintain current category distribution', 'Monitor category performance', 'Optimize stock levels per category'],
            affectedEntities: ['Inventory Management', 'Category Analytics'],
            createdAt: new Date().toISOString()
          });
        }
      }
      
      setAiInsights(insights);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const [smartShelves, setSmartShelves] = useState<SmartShelf[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // handleRefresh is now defined above

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-curex-blue-500" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
          <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-curex-blue-500 text-white rounded-md hover:bg-curex-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                          {(() => {
                            const value = dashboardData?.inventory_summary?.total_medications;
                            console.log('Total medications value:', value);
                            return value?.toLocaleString() || '0';
                          })()}
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
                          {dashboardData?.inventory_summary?.low_stock_count || '0'}
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
                          {dashboardData?.low_stock_medications?.length || '0'}
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
                            {(() => {
                              const value = dashboardData?.stats?.total_revenue;
                              console.log('Total revenue value:', value);
                              return `$${(value || 0).toLocaleString()}`;
                            })()}
                          </span>
                          <span className={`ml-2 flex items-center text-sm ${
                            (dashboardData?.stats?.revenue_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(dashboardData?.stats?.revenue_change || 0) >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(dashboardData?.stats?.revenue_change || 0)}%
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Debug Info</h3>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <div>Dashboard Data: {dashboardData ? 'Loaded' : 'Not loaded'}</div>
                <div>Total Medications: {dashboardData?.inventory_summary?.total_medications || 'undefined'}</div>
                <div>Low Stock Count: {dashboardData?.inventory_summary?.low_stock_count || 'undefined'}</div>
                <div>Total Revenue: {dashboardData?.stats?.total_revenue || 'undefined'}</div>
                <div>Total Orders: {dashboardData?.stats?.total_orders || 'undefined'}</div>
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
                  {aiInsights.length > 0 ? (
                    aiInsights.map((insight) => (
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
                            {(insight.impact || 'MEDIUM').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No AI insights available</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        AI insights will appear here as data is analyzed.
                      </p>
                    </div>
                  )}
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
