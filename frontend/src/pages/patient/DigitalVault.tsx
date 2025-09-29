import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Activity,
  Pill,
  AlertTriangle,
  Plus,
  Download,
  Share2,
  Settings,
  Calendar,
  User,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
  TestTube,
  Camera,
  RefreshCw,
  Bell,
  ExternalLink
} from 'lucide-react';
import {
  HealthVault,
  HealthRecord,
  VaultMedication,
  Allergy,
  ChronicCondition,
  VitalSign,
  VaultPermission,
  RecordType,
  MedicationStatus,
  AllergySeverity,
  ConditionStatus,
  VitalType,
  PermissionGranteeType,
  VaultAccessType
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, DashboardData } from '../../services/dashboardService';
import { healthRecordService, CreateHealthRecordData } from '../../services/healthRecordService';

export default function DigitalVault() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'medications' | 'allergies' | 'conditions' | 'vitals' | 'permissions'>('overview');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [formData, setFormData] = useState<CreateHealthRecordData>({
    type: 'prescription',
    title: '',
    description: '',
    provider_name: '',
    record_date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real API data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultError, setVaultError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setVaultLoading(true);
      setVaultError(null);
      console.log('Loading dashboard data...');
      
      // Load both dashboard data and health records
      const [dashboardData, healthRecordsData] = await Promise.all([
        dashboardService.getPatientDashboard(),
        healthRecordService.getHealthRecords()
      ]);
      
      console.log('Dashboard data loaded:', dashboardData);
      console.log('Health records loaded:', healthRecordsData);
      
      setDashboardData(dashboardData);
      
      // Handle different possible response structures
      let recordsData = [];
      if (healthRecordsData && healthRecordsData.data) {
        if (Array.isArray(healthRecordsData.data)) {
          recordsData = healthRecordsData.data;
        } else if (healthRecordsData.data.data && Array.isArray(healthRecordsData.data.data)) {
          recordsData = healthRecordsData.data.data;
        }
      } else if (Array.isArray(healthRecordsData)) {
        recordsData = healthRecordsData;
      }
      
      console.log('Processed health records:', recordsData);
      setHealthRecords(recordsData);
    } catch (err: any) {
      setVaultError('Failed to load vault data');
      console.error('Error loading vault:', err);
    } finally {
      setVaultLoading(false);
    }
  };

  // Real vault data from API
  const [vaultData, setVaultData] = useState<HealthVault | null>(null);

  // Transform dashboard data into vault format when dashboard data is loaded
  useEffect(() => {
    if (dashboardData) {
      console.log('Dashboard data received:', dashboardData);
      console.log('Recent prescriptions:', dashboardData.recent_prescriptions);
      console.log('Health records:', healthRecords);
      console.log('Health records type:', typeof healthRecords, 'Is array:', Array.isArray(healthRecords));
      
      // Combine prescription-based records and user-created health records
      const prescriptionRecords = dashboardData.recent_prescriptions?.flatMap((prescription, prescriptionIndex) => 
        prescription.items?.map((item, itemIndex) => ({
          id: `${prescription.id}-${item.id}` || `prescription-${prescriptionIndex}-${itemIndex}`,
          type: RecordType.PRESCRIPTION,
          title: `Prescription - ${item.medication?.name || item.medication_name || 'Unknown Medication'}`,
          description: `Prescription for ${item.medication?.name || item.medication_name || 'medication'}`,
          fileUrl: prescription.prescription_file || undefined,
          metadata: {
            prescriptionId: prescription.id,
            medicationName: item.medication?.name || item.medication_name,
            dosage: item.dosage_instructions || 'Unknown',
            frequency: item.frequency || 'Unknown'
          },
          providerId: prescription.doctor_id || 'unknown',
          providerName: prescription.doctor_name || 'Unknown Doctor',
          recordDate: prescription.prescribed_date || prescription.issueDate || prescription.issue_date || new Date().toISOString(),
          createdAt: prescription.created_at || new Date().toISOString()
        })) || []
      ) || [];

      // Convert health records to vault format
      const userHealthRecords = (Array.isArray(healthRecords) ? healthRecords : []).map((record, index) => ({
        id: record.id || `health-record-${index}`,
        type: record.type === 'prescription' ? RecordType.PRESCRIPTION :
              record.type === 'lab_result' ? RecordType.LAB_RESULT :
              record.type === 'imaging' ? RecordType.IMAGING :
              record.type === 'consultation' ? RecordType.CONSULTATION :
              record.type === 'vaccination' ? RecordType.VACCINATION :
              RecordType.PRESCRIPTION, // Default fallback
        title: record.title,
        description: record.description || '',
        fileUrl: record.file_path || undefined,
        metadata: record.metadata || {},
        providerId: record.provider_id || 'unknown',
        providerName: record.provider_name || 'Unknown Provider',
        recordDate: record.record_date || new Date().toISOString(),
        createdAt: record.created_at || new Date().toISOString()
      }));

      const transformedVaultData: HealthVault = {
        id: 'vault-1',
        patientId: user?.id || '',
        vitallsIntegrationId: 'vitalls-123456',
        healthRecords: [...prescriptionRecords, ...userHealthRecords],
        medications: dashboardData.recent_prescriptions?.flatMap((prescription, prescriptionIndex) => 
          prescription.items?.map((item, itemIndex) => ({
            medicationId: item.medication?.id || `med-${prescriptionIndex}-${itemIndex}`,
            medication: item.medication || {
              id: item.medication?.id || `med-${prescriptionIndex}-${itemIndex}`,
              name: item.medication?.name || item.medication_name || 'Unknown Medication',
              genericName: item.medication?.generic_name || item.medication?.genericName,
              brand: item.medication?.brand || item.medication?.brand_name
            } as any,
            prescribedDate: prescription.prescribed_date || prescription.issueDate || prescription.issue_date || new Date().toISOString(),
            startDate: prescription.prescribed_date || prescription.issueDate || prescription.issue_date || new Date().toISOString(),
            dosage: item.dosage_instructions || 'Unknown',
            frequency: item.frequency || 'Unknown',
            prescriberId: prescription.doctor_id || 'unknown',
            prescriberName: prescription.doctor_name || 'Unknown Doctor',
            status: prescription.status === 'active' ? MedicationStatus.ACTIVE : 
                    prescription.status === 'completed' ? MedicationStatus.COMPLETED :
                    prescription.status === 'discontinued' ? MedicationStatus.DISCONTINUED : MedicationStatus.ACTIVE,
            adherence: 95, // Default value
            sideEffectsReported: []
          })) || []
        ) || [],
        allergies: [], // No allergies data in current API
        chronicConditions: [], // No conditions data in current API
        vitalSigns: [], // No vitals data in current API
        accessPermissions: [], // No permissions data in current API
        encryptionKey: 'encrypted-key-hash',
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Transformed vault data:', transformedVaultData);
      console.log('Health records count:', transformedVaultData.healthRecords.length);
      console.log('Medications count:', transformedVaultData.medications.length);
      
      setVaultData(transformedVaultData);
    }
  }, [dashboardData, healthRecords, user?.id]);

  const handleUnlockVault = () => {
    // In real implementation, this would trigger biometric authentication
    setIsVaultLocked(false);
  };

  const handleShareVault = () => {
    // In real implementation, this would open a share modal or generate a shareable link
    if (navigator.share) {
      navigator.share({
        title: 'My Digital Health Vault',
        text: 'Check out my health records in CureX40 Digital Vault',
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Vault link copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy link. Please copy manually: ' + window.location.href);
      });
    }
  };

  const handleAddRecord = async () => {
    try {
      setIsSubmitting(true);
      
      const recordData: CreateHealthRecordData = {
        ...formData,
        file: selectedFile || undefined
      };

      await healthRecordService.createHealthRecord(recordData);
      
      // Reset form
      setFormData({
        type: 'prescription',
        title: '',
        description: '',
        provider_name: '',
        record_date: new Date().toISOString().split('T')[0]
      });
      setSelectedFile(null);
      setShowAddModal(false);
      
      // Reload dashboard data to show new record
      await loadDashboardData();
      
      alert('Health record added successfully!');
    } catch (error: any) {
      console.error('Error adding health record:', error);
      alert('Failed to add health record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case RecordType.LAB_RESULT:
        return <TestTube className="h-5 w-5" />;
      case RecordType.IMAGING:
        return <Camera className="h-5 w-5" />;
      case RecordType.CONSULTATION:
        return <Stethoscope className="h-5 w-5" />;
      case RecordType.VACCINATION:
        return <Shield className="h-5 w-5" />;
      case RecordType.PRESCRIPTION:
        return <Pill className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getRecordTypeColor = (type: RecordType) => {
    switch (type) {
      case RecordType.LAB_RESULT:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case RecordType.IMAGING:
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case RecordType.CONSULTATION:
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case RecordType.VACCINATION:
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case RecordType.PRESCRIPTION:
        return 'text-curex-teal-600 bg-curex-teal-100 dark:bg-curex-teal-900/20 dark:text-curex-teal-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMedicationStatusColor = (status: MedicationStatus) => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case MedicationStatus.COMPLETED:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case MedicationStatus.DISCONTINUED:
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case MedicationStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAllergySeverityColor = (severity: AllergySeverity) => {
    switch (severity) {
      case AllergySeverity.LIFE_THREATENING:
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case AllergySeverity.SEVERE:
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case AllergySeverity.MODERATE:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case AllergySeverity.MILD:
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getVitalIcon = (type: VitalType) => {
    switch (type) {
      case VitalType.BLOOD_PRESSURE:
      case VitalType.HEART_RATE:
        return <Heart className="h-4 w-4" />;
      case VitalType.WEIGHT:
      case VitalType.HEIGHT:
        return <Activity className="h-4 w-4" />;
      case VitalType.BLOOD_GLUCOSE:
        return <TestTube className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (vaultLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-curex-teal-500 animate-spin" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            Loading your digital vault...
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Decrypting your secure health data
          </p>
        </div>
      </div>
    );
  }

  if (isVaultLocked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-curex-teal-100 dark:bg-curex-teal-900/20">
              <Lock className="h-8 w-8 text-curex-teal-600 dark:text-curex-teal-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Your Digital Vault is Locked
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Use biometric authentication or your secure PIN to access your health data
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleUnlockVault}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-curex-teal-600 hover:bg-curex-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-curex-teal-500"
              >
                <Shield className="h-4 w-4 mr-2" />
                Unlock with Biometrics
              </button>
              <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <Lock className="h-4 w-4 mr-2" />
                Enter PIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vaultLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-curex-blue-500" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (!vaultData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
          <p className="mt-2 text-red-600 dark:text-red-400">Failed to load vault data</p>
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

  if (vaultError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
          <p className="mt-2 text-red-600 dark:text-red-400">{vaultError}</p>
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
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-curex-teal-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Digital Health Vault
                </h1>
              </div>
              {vaultData?.vitallsIntegrationId && (
                <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Vitalls Connected</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Last sync: {vaultData ? new Date(vaultData.lastSync).toLocaleTimeString() : 'Never'}</span>
              </div>
              <button 
                onClick={handleShareVault}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-curex-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-curex-teal-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Record</span>
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
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'records', label: 'Health Records', icon: FileText },
              { key: 'medications', label: 'Medications', icon: Pill },
              { key: 'allergies', label: 'Allergies', icon: AlertTriangle },
              { key: 'conditions', label: 'Conditions', icon: Heart },
              { key: 'vitals', label: 'Vital Signs', icon: Activity },
              { key: 'permissions', label: 'Permissions', icon: Settings },
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
            {/* Quick Stats */}
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
                          Health Records
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {vaultData?.healthRecords.length || 0}
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
                      <Pill className="h-6 w-6 text-curex-teal-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Active Medications
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {vaultData?.medications.filter(m => m.status === MedicationStatus.ACTIVE).length || 0}
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
                      <AlertTriangle className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Allergies
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {vaultData?.allergies.length || 0}
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
                      <Heart className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Conditions
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {vaultData?.chronicConditions.filter(c => c.status === ConditionStatus.ACTIVE).length || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {vaultData?.healthRecords.slice(0, 5).map((record, index) => (
                      <li key={record.id}>
                        <div className="relative pb-8">
                          {index !== (vaultData?.healthRecords.slice(0, 5).length || 0) - 1 && (
                            <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                          )}
                          <div className="relative flex items-start space-x-3">
                            <div className={`relative px-1 ${getRecordTypeColor(record.type)} rounded-full flex h-8 w-8 items-center justify-center`}>
                              {getRecordIcon(record.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {record.title}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                  {record.description}
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{record.providerName}</span>
                                <span className="mx-1">•</span>
                                <time dateTime={record.recordDate}>
                                  {new Date(record.recordDate).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Health Records
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-curex-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-curex-teal-700"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Record</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {vaultData?.healthRecords.map((record) => (
                  <li key={record.id}>
                    <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`flex-shrink-0 ${getRecordTypeColor(record.type)} rounded-full p-2`}>
                          {getRecordIcon(record.type)}
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {record.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {record.description}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{record.providerName}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{new Date(record.recordDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeColor(record.type)}`}>
                          {record.type.replace('_', ' ').toUpperCase()}
                        </span>
                        {record.fileUrl && (
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Current Medications
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {vaultData?.medications.map((medication) => (
                  <div key={medication.medicationId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {medication.medication.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {medication.dosage} - {medication.frequency}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Prescribed by: {medication.prescriberName}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMedicationStatusColor(medication.status)}`}>
                        {medication.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Allergies & Sensitivities
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {vaultData?.allergies.map((allergy) => (
                  <div key={allergy.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {allergy.allergen}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Symptoms: {allergy.symptoms.join(', ')}
                        </p>
                        {allergy.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {allergy.notes}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAllergySeverityColor(allergy.severity)}`}>
                        {allergy.severity.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs with placeholder content */}
        {(activeTab === 'conditions' || activeTab === 'vitals' || activeTab === 'permissions') && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {activeTab === 'conditions' ? 'Chronic Conditions' :
                 activeTab === 'vitals' ? 'Vital Signs' : 'Access Permissions'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {activeTab === 'conditions' ? 'Health Conditions' :
                   activeTab === 'vitals' ? 'Vital Signs Tracking' : 'Permission Management'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Advanced features coming soon...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Record</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Record Type
                  </label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="lab_result">Lab Result</option>
                    <option value="imaging">Imaging</option>
                    <option value="consultation">Consultation</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter record title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Enter record description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    name="provider_name"
                    value={formData.provider_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter provider name (doctor, clinic, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Record Date *
                  </label>
                  <input
                    type="date"
                    name="record_date"
                    value={formData.record_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  {selectedFile && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                disabled={isSubmitting || !formData.title || !formData.record_date}
                className="px-4 py-2 text-sm font-medium text-white bg-curex-teal-600 rounded-md hover:bg-curex-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
