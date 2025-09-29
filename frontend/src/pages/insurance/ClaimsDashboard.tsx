import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  InsuranceClaim,
  ClaimStatus,
  FraudLevel,
  DocumentType,
  User
} from '../../types';
import { dashboardService, DashboardData } from '../../services/dashboardService';

export default function ClaimsDashboard() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'fraud' | 'analytics'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
      const data = await dashboardService.getInsuranceDashboard();
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
  const dashboardMetrics = {
    totalClaims: dashboardData?.stats?.total_claims || 0,
    pendingClaims: dashboardData?.stats?.pending_claims || 0,
    approvedClaims: dashboardData?.stats?.approved_claims || 0,
    rejectedClaims: dashboardData?.stats?.rejected_claims || 0,
    totalClaimValue: dashboardData?.stats?.total_claim_value || 0,
    averageClaimValue: dashboardData?.stats?.average_claim_value || 0,
    processingTime: dashboardData?.stats?.processing_time || 0,
    fraudDetectionRate: dashboardData?.stats?.fraud_detection_rate || 0,
    approvalRate: dashboardData?.stats?.approval_rate || 0,
    monthlyChange: dashboardData?.stats?.monthly_change || 0
  };

  const [claims, setClaims] = useState<InsuranceClaim[]>([
    {
      id: 'claim-001',
      patientId: 'patient-123',
      patient: {
        id: 'patient-123',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        role: 'patient' as any,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      } as User,
      prescriptionId: 'rx-456',
      prescription: {} as any,
      orderId: 'order-789',
      order: {} as any,
      insuranceProvider: 'HealthFirst Insurance',
      policyNumber: 'HF-2024-001234',
      claimAmount: 245.80,
      approvedAmount: 220.22,
      deductible: 25.00,
      copayment: 15.00,
      status: ClaimStatus.UNDER_REVIEW,
      submissionDate: '2024-01-20T10:30:00Z',
      processingDate: '2024-01-20T14:15:00Z',
      fraudRisk: {
        score: 0.23,
        level: FraudLevel.LOW,
        factors: [],
        verificationStatus: 'approved' as any,
        lastChecked: '2024-01-20T15:00:00Z'
      },
      documents: [
        {
          id: 'doc-1',
          type: DocumentType.PRESCRIPTION,
          fileName: 'prescription-rx456.pdf',
          fileUrl: '/api/files/prescription-rx456.pdf',
          verified: true,
          uploadedAt: '2024-01-20T10:32:00Z'
        }
      ],
      notes: 'Standard prescription claim for hypertension medication',
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T15:00:00Z'
    },
    {
      id: 'claim-002',
      patientId: 'patient-456',
      patient: {
        id: 'patient-456',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        role: 'patient' as any,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      } as User,
      prescriptionId: 'rx-789',
      prescription: {} as any,
      orderId: 'order-101',
      order: {} as any,
      insuranceProvider: 'MediCare Plus',
      policyNumber: 'MP-2024-005678',
      claimAmount: 89.50,
      approvedAmount: 89.50,
      deductible: 0,
      copayment: 10.00,
      status: ClaimStatus.APPROVED,
      submissionDate: '2024-01-19T09:15:00Z',
      processingDate: '2024-01-19T11:30:00Z',
      approvalDate: '2024-01-19T16:45:00Z',
      fraudRisk: {
        score: 0.08,
        level: FraudLevel.LOW,
        factors: [],
        verificationStatus: 'approved' as any,
        lastChecked: '2024-01-19T12:00:00Z'
      },
      documents: [
        {
          id: 'doc-2',
          type: DocumentType.PRESCRIPTION,
          fileName: 'prescription-rx789.pdf',
          fileUrl: '/api/files/prescription-rx789.pdf',
          verified: true,
          uploadedAt: '2024-01-19T09:17:00Z'
        }
      ],
      createdAt: '2024-01-19T09:15:00Z',
      updatedAt: '2024-01-19T16:45:00Z'
    },
    {
      id: 'claim-003',
      patientId: 'patient-789',
      patient: {
        id: 'patient-789',
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@email.com',
        role: 'patient' as any,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      } as User,
      prescriptionId: 'rx-321',
      prescription: {} as any,
      orderId: 'order-202',
      order: {} as any,
      insuranceProvider: 'SecureHealth',
      policyNumber: 'SH-2024-009876',
      claimAmount: 1250.00,
      approvedAmount: 0,
      deductible: 100.00,
      copayment: 25.00,
      status: ClaimStatus.REJECTED,
      submissionDate: '2024-01-18T14:20:00Z',
      processingDate: '2024-01-18T16:00:00Z',
      rejectionReason: 'Medication not covered under current policy',
      fraudRisk: {
        score: 0.78,
        level: FraudLevel.HIGH,
        factors: [
          {
            type: 'unusual_amount',
            description: 'Claim amount significantly higher than average',
            riskScore: 0.6,
            severity: 'high' as any
          },
          {
            type: 'pharmacy_pattern',
            description: 'Patient has multiple claims from different pharmacies',
            riskScore: 0.4,
            severity: 'medium' as any
          }
        ],
        verificationStatus: 'pending' as any,
        lastChecked: '2024-01-18T17:30:00Z'
      },
      documents: [
        {
          id: 'doc-3',
          type: DocumentType.PRESCRIPTION,
          fileName: 'prescription-rx321.pdf',
          fileUrl: '/api/files/prescription-rx321.pdf',
          verified: false,
          uploadedAt: '2024-01-18T14:22:00Z'
        }
      ],
      createdAt: '2024-01-18T14:20:00Z',
      updatedAt: '2024-01-18T17:30:00Z'
    }
  ]);

  // handleRefresh is now defined above

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case ClaimStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case ClaimStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case ClaimStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case ClaimStatus.PAID:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case ClaimStatus.DISPUTED:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getFraudLevelColor = (level: FraudLevel) => {
    switch (level) {
      case FraudLevel.LOW:
        return 'text-green-600';
      case FraudLevel.MEDIUM:
        return 'text-yellow-600';
      case FraudLevel.HIGH:
        return 'text-red-600';
      case FraudLevel.SUSPICIOUS:
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFraudIcon = (level: FraudLevel) => {
    switch (level) {
      case FraudLevel.LOW:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case FraudLevel.MEDIUM:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case FraudLevel.HIGH:
      case FraudLevel.SUSPICIOUS:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
    const matchesSearch = searchQuery === '' ||
      claim.patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
                Insurance Claims Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automated claims processing and fraud detection
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
              { key: 'claims', label: 'Claims Management', icon: FileText },
              { key: 'fraud', label: 'Fraud Detection', icon: Shield },
              { key: 'analytics', label: 'Analytics', icon: PieChart },
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Claims
                        </dt>
                        <dd className="flex items-center">
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            {dashboardMetrics.totalClaims.toLocaleString()}
                          </span>
                          <span className="ml-2 flex items-center text-sm text-green-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {dashboardMetrics.monthlyChange}%
                          </span>
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
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Pending Claims
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboardMetrics.pendingClaims.toLocaleString()}
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
                          Total Claim Value
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          ${dashboardMetrics.totalClaimValue.toLocaleString()}
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
                      <Shield className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Fraud Detection Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboardMetrics.fraudDetectionRate}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Claims */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Claims
                </h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fraud Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {claims.slice(0, 5).map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {claim.patient.first_name} {claim.patient.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {claim.policyNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${claim.claimAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {claim.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getFraudIcon(claim.fraudRisk.level)}
                            <span className={`ml-2 text-sm font-medium ${getFraudLevelColor(claim.fraudRisk.level)}`}>
                              {claim.fraudRisk.level.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(claim.submissionDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('claims')}
                  className="text-curex-teal-600 hover:text-curex-teal-800 dark:text-curex-teal-400 text-sm font-medium"
                >
                  View all claims →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claims Management Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by patient name or policy number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-curex-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ClaimStatus | 'all')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-curex-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value={ClaimStatus.SUBMITTED}>Submitted</option>
                    <option value={ClaimStatus.UNDER_REVIEW}>Under Review</option>
                    <option value={ClaimStatus.APPROVED}>Approved</option>
                    <option value={ClaimStatus.REJECTED}>Rejected</option>
                    <option value={ClaimStatus.PAID}>Paid</option>
                  </select>
                  <button className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Claim Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fraud Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Processing Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredClaims.map((claim) => {
                      const processingTime = claim.processingDate
                        ? Math.round((new Date(claim.processingDate).getTime() - new Date(claim.submissionDate).getTime()) / (1000 * 60 * 60))
                        : null;

                      return (
                        <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {claim.patient.first_name} {claim.patient.last_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {claim.policyNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                ${claim.claimAmount.toFixed(2)}
                              </div>
                              {claim.approvedAmount > 0 && claim.approvedAmount !== claim.claimAmount && (
                                <div className="text-sm text-green-600 dark:text-green-400">
                                  Approved: ${claim.approvedAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                              {claim.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getFraudIcon(claim.fraudRisk.level)}
                              <span className={`ml-2 text-sm font-medium ${getFraudLevelColor(claim.fraudRisk.level)}`}>
                                {claim.fraudRisk.level.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {processingTime ? `${processingTime}h` : 'Pending'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-curex-teal-600 hover:text-curex-teal-900 dark:text-curex-teal-400">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detection Tab */}
        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Fraud Detection
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Fraud Detection System
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Advanced fraud detection features coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Analytics & Reporting
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Advanced analytics features coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
