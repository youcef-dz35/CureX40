import React, { useState } from 'react';
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
import {
  NationalHealthMetrics,
  RegionMetrics,
  SupplyChainAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  TrendDirection
} from '../../types';

export default function GovernmentDashboard() {

  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'alerts' | 'reports'>('overview');
  const [refreshing, setRefreshing] = useState(false);


  // Mock data - replace with actual API calls
  const [nationalMetrics] = useState<NationalHealthMetrics>({
    totalPharmacies: 15420,
    activePharmacies: 14890,
    totalMedications: 45600,
    medicationsInStock: 42100,
    medicationsShortage: 890,
    totalPrescriptions: 892340,
    processedClaims: 785600,
    averageWaitTime: 12.5,
    supplyCoverage: 92.3,
    lastUpdated: new Date().toISOString()
  });

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

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

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
                Regional Analysis
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Map className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Regional Analysis
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Detailed regional analytics coming soon...
                </p>
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
