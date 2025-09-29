import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Map,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  Package,
  Clock,
  BarChart3,
  Activity,
  Globe,
  RefreshCw,
  MapPin
} from 'lucide-react';
import AlgeriaMap from '../../components/AlgeriaMap';
import {
  NationalHealthMetrics,
  RegionMetrics,
  SupplyChainAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  TrendDirection
} from '../../types';
import { dashboardService, DashboardData } from '../../services/dashboardService';

export default function GovernmentDashboard() {

  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'alerts' | 'reports'>('overview');
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
      const data = await dashboardService.getGovernmentDashboard();
      setDashboardData(data);
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

  // Transform API data to match the expected format
  const nationalMetrics: NationalHealthMetrics = {
    totalPharmacies: dashboardData?.stats?.total_pharmacies || 0,
    activePharmacies: dashboardData?.stats?.active_pharmacies || 0,
    totalMedications: dashboardData?.stats?.total_medications || 0,
    medicationsInStock: dashboardData?.stats?.medications_in_stock || 0,
    medicationsShortage: dashboardData?.stats?.medications_shortage || 0,
    totalPrescriptions: dashboardData?.stats?.total_prescriptions || 0,
    processedClaims: dashboardData?.stats?.processed_claims || 0,
    averageWaitTime: dashboardData?.stats?.average_wait_time || 0,
    supplyCoverage: dashboardData?.stats?.supply_coverage || 0,
    lastUpdated: new Date().toISOString()
  };

  const [regionData] = useState<RegionMetrics[]>([
    {
      regionId: 'algiers',
      regionName: 'Algiers',
      pharmacyCount: 3200,
      populationCoverage: 95.2,
      stockLevel: 88.7,
      shortageAlerts: 12,
      averageAccessTime: 8.5,
      healthOutcomes: [
        {
          metric: 'Medication Availability',
          value: 92.1,
          unit: '%',
          trend: TrendDirection.UP,
          period: '30d'
        }
      ],
      coordinates: { latitude: 36.7372, longitude: 3.0865 }
    },
    {
      regionId: 'oran',
      regionName: 'Oran',
      pharmacyCount: 2100,
      populationCoverage: 89.8,
      stockLevel: 76.4,
      shortageAlerts: 28,
      averageAccessTime: 15.2,
      healthOutcomes: [
        {
          metric: 'Medication Availability',
          value: 84.6,
          unit: '%',
          trend: TrendDirection.DOWN,
          period: '30d'
        }
      ],
      coordinates: { latitude: 35.6911, longitude: -0.6417 }
    }
  ]);

  const [supplyAlerts] = useState<SupplyChainAlert[]>([
    {
      id: '1',
      type: AlertType.SHORTAGE,
      severity: AlertSeverity.HIGH,
      medicationId: 'insulin-100',
      medication: {
        id: 'insulin-100',
        name: 'Insulin Glargine 100 IU/mL',
        genericName: 'Insulin Glargine',
        brand: 'Lantus'
      } as any,
      affectedRegions: ['oran', 'constantine'],
      estimatedShortfall: 15000,
      estimatedDuration: '2-3 weeks',
      recommendedActions: [
        'Coordinate with regional suppliers',
        'Initiate emergency procurement'
      ],
      status: AlertStatus.ACTIVE,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // handleRefresh is now defined above

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case AlertSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case AlertSeverity.LOW:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.UP:
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case TrendDirection.DOWN:
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
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
          <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
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
                National Health Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time medicine flow monitoring and supply chain intelligence
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
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {([
              { key: 'overview', label: 'National Overview', icon: Globe },
              { key: 'regions', label: 'Regional Analysis', icon: Map },
              { key: 'alerts', label: 'Supply Alerts', icon: AlertTriangle },
              { key: 'reports', label: 'Reports', icon: BarChart3 },
            ] as Array<{ key: string; label: string; icon: React.ComponentType<any> }>).map(({ key, label, icon: Icon }) => (
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Active Pharmacies
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {nationalMetrics.activePharmacies.toLocaleString()}
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
                      <Package className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Supply Coverage
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {nationalMetrics.supplyCoverage.toFixed(1)}%
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
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Shortage Alerts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {nationalMetrics.medicationsShortage.toLocaleString()}
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
                      <Clock className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Avg. Wait Time
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {nationalMetrics.averageWaitTime} min
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Overview */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Regional Supply Status
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {regionData.map((region) => (
                    <div key={region.regionId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {region.regionName}
                        </h4>
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Stock Level</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.stockLevel.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${region.stockLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Supply Chain Alerts
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {supplyAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.medication.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            Shortage expected: {alert.estimatedDuration}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Regional Supply Status - Algeria Wilayas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interactive map showing medicine supply status across all 58 Algerian wilayas
              </p>
            </div>
            <div className="p-6">
              <AlgeriaMap />
            </div>
          </div>
        )}

        {/* Old Regions Tab - Replaced */}
        {false && (
          <div className="space-y-6">
            {/* Regional Supply Status Map */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Regional Supply Status - Algeria
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time medicine supply status across Algerian regions
                </p>
              </div>
              <div className="p-6">
                {/* Map Legend */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Adequate Supply</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Low Stock</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Critical Shortage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">No Data</span>
                    </div>
                  </div>
                </div>

                {/* Algeria Map SVG */}
                <div className="relative">
                  <svg
                    viewBox="0 0 800 600"
                    className="w-full h-auto max-w-4xl mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Algeria Outline */}
                    <path
                      d="M 100 150 L 200 120 L 300 100 L 400 90 L 500 100 L 600 120 L 700 150 L 750 200 L 780 300 L 750 400 L 700 500 L 600 520 L 500 530 L 400 540 L 300 530 L 200 520 L 100 500 L 50 400 L 30 300 L 50 200 Z"
                      fill="#f3f4f6"
                      stroke="#374151"
                      strokeWidth="2"
                      className="dark:fill-gray-700 dark:stroke-gray-500"
                    />
                    
                    {/* Regional Areas */}
                    {/* Algiers */}
                    <circle
                      cx="200"
                      cy="200"
                      r="25"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="200" y="205" textAnchor="middle" className="text-xs font-medium fill-white">
                      Algiers
                    </text>
                    
                    {/* Oran */}
                    <circle
                      cx="150"
                      cy="250"
                      r="20"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="150" y="255" textAnchor="middle" className="text-xs font-medium fill-white">
                      Oran
                    </text>
                    
                    {/* Constantine */}
                    <circle
                      cx="300"
                      cy="180"
                      r="22"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="300" y="185" textAnchor="middle" className="text-xs font-medium fill-white">
                      Constantine
                    </text>
                    
                    {/* Annaba */}
                    <circle
                      cx="350"
                      cy="200"
                      r="18"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="350" y="205" textAnchor="middle" className="text-xs font-medium fill-white">
                      Annaba
                    </text>
                    
                    {/* Blida */}
                    <circle
                      cx="180"
                      cy="220"
                      r="15"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="180" y="225" textAnchor="middle" className="text-xs font-medium fill-white">
                      Blida
                    </text>
                    
                    {/* Setif */}
                    <circle
                      cx="280"
                      cy="250"
                      r="20"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="280" y="255" textAnchor="middle" className="text-xs font-medium fill-white">
                      Setif
                    </text>
                    
                    {/* Tlemcen */}
                    <circle
                      cx="120"
                      cy="300"
                      r="18"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="120" y="305" textAnchor="middle" className="text-xs font-medium fill-white">
                      Tlemcen
                    </text>
                    
                    {/* Batna */}
                    <circle
                      cx="320"
                      cy="320"
                      r="16"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="320" y="325" textAnchor="middle" className="text-xs font-medium fill-white">
                      Batna
                    </text>
                    
                    {/* Bejaia */}
                    <circle
                      cx="250"
                      cy="150"
                      r="14"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="250" y="155" textAnchor="middle" className="text-xs font-medium fill-white">
                      Bejaia
                    </text>
                    
                    {/* Tizi Ouzou */}
                    <circle
                      cx="220"
                      cy="160"
                      r="12"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="220" y="165" textAnchor="middle" className="text-xs font-medium fill-white">
                      Tizi Ouzou
                    </text>
                    
                    {/* Ouargla (Sahara) */}
                    <circle
                      cx="400"
                      cy="400"
                      r="20"
                      fill="#6b7280"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="400" y="405" textAnchor="middle" className="text-xs font-medium fill-white">
                      Ouargla
                    </text>
                    
                    {/* Ghardaia */}
                    <circle
                      cx="350"
                      cy="450"
                      r="16"
                      fill="#6b7280"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text x="350" y="455" textAnchor="middle" className="text-xs font-medium fill-white">
                      Ghardaia
                    </text>
                  </svg>
                </div>

                {/* Regional Statistics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Adequate Supply</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">6</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Regions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Low Stock</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">3</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Regions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Critical Shortage</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">1</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Regions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">No Data</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Regions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Details Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Regional Supply Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pharmacies
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Update
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Algiers
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Adequate
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        45
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        85%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        2 hours ago
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Oran
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Low Stock
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        28
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        35%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        1 hour ago
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Constantine
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Adequate
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        32
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        78%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        3 hours ago
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Tlemcen
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Critical
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        15
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        12%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        30 minutes ago
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Ouargla
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                          No Data
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        8
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        N/A
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        2 days ago
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Reports & Analytics
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Reports Dashboard
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Advanced reporting features coming soon...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
