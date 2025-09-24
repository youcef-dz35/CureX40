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

export default function DigitalVault() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'medications' | 'allergies' | 'conditions' | 'vitals' | 'permissions'>('overview');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  // Mock vault data - replace with actual API calls
  const [vaultData, setVaultData] = useState<HealthVault>({
    id: 'vault-1',
    patientId: user?.id || '',
    vitallsIntegrationId: 'vitalls-123456',
    healthRecords: [
      {
        id: '1',
        type: RecordType.LAB_RESULT,
        title: 'Complete Blood Count',
        description: 'Routine blood work showing normal ranges',
        fileUrl: '/api/files/cbc-report.pdf',
        metadata: {
          testType: 'CBC',
          laboratory: 'Central Lab',
          results: {
            hemoglobin: '14.2 g/dL',
            whiteBloodCells: '7,200/μL',
            platelets: '280,000/μL'
          }
        },
        providerId: 'doc-123',
        providerName: 'Dr. Sarah Johnson',
        recordDate: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: RecordType.IMAGING,
        title: 'Chest X-Ray',
        description: 'Clear chest X-ray, no abnormalities detected',
        fileUrl: '/api/files/chest-xray.dcm',
        metadata: {
          imagingType: 'X-Ray',
          bodyPart: 'Chest',
          findings: 'Normal'
        },
        providerId: 'doc-456',
        providerName: 'Dr. Michael Chen',
        recordDate: '2024-01-10T14:30:00Z',
        createdAt: '2024-01-10T15:00:00Z'
      },
      {
        id: '3',
        type: RecordType.VACCINATION,
        title: 'COVID-19 Vaccination',
        description: 'mRNA vaccine - 2nd dose',
        metadata: {
          vaccineType: 'mRNA',
          manufacturer: 'Pfizer-BioNTech',
          lotNumber: 'FL7533',
          doseNumber: 2
        },
        providerId: 'clinic-789',
        providerName: 'City Health Clinic',
        recordDate: '2024-01-05T09:00:00Z',
        createdAt: '2024-01-05T09:15:00Z'
      }
    ],
    medications: [
      {
        medicationId: 'med-1',
        medication: {
          id: 'med-1',
          name: 'Lisinopril 10mg',
          genericName: 'Lisinopril',
          brand: 'Prinivil'
        } as any,
        prescribedDate: '2024-01-01T00:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        dosage: '10mg',
        frequency: 'Once daily',
        prescriberId: 'doc-123',
        prescriberName: 'Dr. Sarah Johnson',
        status: MedicationStatus.ACTIVE,
        adherence: 95,
        sideEffectsReported: []
      },
      {
        medicationId: 'med-2',
        medication: {
          id: 'med-2',
          name: 'Metformin 500mg',
          genericName: 'Metformin',
          brand: 'Glucophage'
        } as any,
        prescribedDate: '2023-12-15T00:00:00Z',
        startDate: '2023-12-15T00:00:00Z',
        endDate: '2024-01-20T00:00:00Z',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescriberId: 'doc-456',
        prescriberName: 'Dr. Michael Chen',
        status: MedicationStatus.COMPLETED,
        adherence: 88,
        sideEffectsReported: ['Mild nausea']
      }
    ],
    allergies: [
      {
        id: '1',
        allergen: 'Penicillin',
        severity: AllergySeverity.SEVERE,
        symptoms: ['Rash', 'Difficulty breathing', 'Swelling'],
        diagnosedDate: '2020-03-15T00:00:00Z',
        notes: 'Discovered during treatment for strep throat'
      },
      {
        id: '2',
        allergen: 'Shellfish',
        severity: AllergySeverity.MODERATE,
        symptoms: ['Hives', 'Itching', 'Digestive upset'],
        diagnosedDate: '2018-07-20T00:00:00Z',
        notes: 'Reaction occurred after eating shrimp'
      }
    ],
    chronicConditions: [
      {
        id: '1',
        condition: 'Hypertension',
        diagnosedDate: '2022-06-10T00:00:00Z',
        status: ConditionStatus.ACTIVE,
        medications: ['Lisinopril'],
        managementPlan: 'Regular blood pressure monitoring, low sodium diet, exercise',
        lastReview: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        condition: 'Type 2 Diabetes',
        diagnosedDate: '2023-08-15T00:00:00Z',
        status: ConditionStatus.MONITORING,
        medications: ['Metformin'],
        managementPlan: 'Blood glucose monitoring, dietary modifications, regular exercise',
        lastReview: '2024-01-15T00:00:00Z'
      }
    ],
    vitalSigns: [
      {
        id: '1',
        type: VitalType.BLOOD_PRESSURE,
        value: 128,
        unit: 'mmHg (systolic)',
        recordedDate: '2024-01-20T08:00:00Z',
        recordedBy: 'Self-monitored',
        notes: 'Taken in morning before medication'
      },
      {
        id: '2',
        type: VitalType.WEIGHT,
        value: 175,
        unit: 'lbs',
        recordedDate: '2024-01-20T07:30:00Z',
        recordedBy: 'Self-monitored'
      },
      {
        id: '3',
        type: VitalType.BLOOD_GLUCOSE,
        value: 95,
        unit: 'mg/dL',
        recordedDate: '2024-01-20T09:15:00Z',
        recordedBy: 'Self-monitored',
        notes: 'Fasting glucose'
      }
    ],
    accessPermissions: [
      {
        id: '1',
        grantedTo: 'Dr. Sarah Johnson',
        grantedToType: PermissionGranteeType.HEALTHCARE_PROVIDER,
        permissions: [VaultAccessType.READ, VaultAccessType.WRITE],
        grantedAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-12-31T23:59:59Z'
      },
      {
        id: '2',
        grantedTo: 'City Pharmacy',
        grantedToType: PermissionGranteeType.PHARMACY,
        permissions: [VaultAccessType.READ],
        grantedAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-06-30T23:59:59Z'
      }
    ],
    encryptionKey: 'encrypted-key-hash',
    lastSync: '2024-01-20T10:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  });

  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading vault data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockVault = () => {
    // In real implementation, this would trigger biometric authentication
    setIsVaultLocked(false);
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

  if (loading) {
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
              {vaultData.vitallsIntegrationId && (
                <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Vitalls Connected</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Last sync: {new Date(vaultData.lastSync).toLocaleTimeString()}</span>
              </div>
              <button className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg bg-curex-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-curex-teal-700">
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
                          {vaultData.healthRecords.length}
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
                          {vaultData.medications.filter(m => m.status === MedicationStatus.ACTIVE).length}
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
                          {vaultData.allergies.length}
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
                          {vaultData.chronicConditions.filter(c => c.status === ConditionStatus.ACTIVE).length}
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
                    {vaultData.healthRecords.slice(0, 5).map((record, index) => (
                      <li key={record.id}>
                        <div className="relative pb-8">
                          {index !== vaultData.healthRecords.slice(0, 5).length - 1 && (
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
                {vaultData.healthRecords.map((record) => (
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
                {vaultData.medications.map((medication) => (
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
                {vaultData.allergies.map((allergy) => (
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
    </div>
  );
}
