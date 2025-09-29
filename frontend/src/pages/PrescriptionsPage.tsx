import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { prescriptionService } from '../services/api/prescriptions';
import { Prescription, PrescriptionStatus } from '../types';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Pill,
  User,
  Phone,
  MapPin,
  X
} from 'lucide-react';

export default function PrescriptionsPage() {
  const { t } = useTranslation(['pharmacy']);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | 'all'>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Debounced search callback
  const handleSearch = useCallback(async (debouncedSearchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await prescriptionService.getPrescriptionHistory({
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setPrescriptions(data);
    } catch (err) {
      setError('Failed to load prescriptions');
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Use debounced search
  useDebouncedSearch(searchTerm, handleSearch, 500);

  // Fetch prescriptions when status filter changes (immediate)
  useEffect(() => {
    if (searchTerm === '') {
      handleSearch('');
    }
  }, [statusFilter, handleSearch]);

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await prescriptionService.getPrescriptions({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setPrescriptions(response.data || []);
    } catch (err: any) {
      setError('Failed to load prescriptions');
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'verified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'filled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'filled':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prescriptions are now filtered on the backend, so we use them directly
  const filteredPrescriptions = prescriptions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-curex-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPrescriptions}
            className="px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Prescriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your prescriptions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PrescriptionStatus | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="filled">Filled</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No prescriptions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You don\'t have any prescriptions yet.'
                }
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {prescription.prescription_number}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                        {getStatusIcon(prescription.status)}
                        {prescription.status}
                      </span>
                      {prescription.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        <span>{prescription.doctor_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(prescription.prescribed_date || prescription.issueDate || prescription.issue_date || '')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Expires: {formatDate(prescription.expiry_date || prescription.expiryDate || '')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Pill className="h-4 w-4" />
                        <span>{prescription.items_count || 0} medications</span>
                      </div>
                    </div>

                    {prescription.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Notes:</strong> {prescription.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedPrescription(prescription)}
                        className="flex items-center gap-2 px-4 py-2 text-curex-blue-600 hover:text-curex-blue-700 font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {prescription.status === 'filled' && (
                        <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 font-medium">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Prescription Details Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Prescription Details
                  </h2>
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Prescription Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Prescription Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prescription Number
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedPrescription.prescription_number}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                          {getStatusIcon(selectedPrescription.status)}
                          {selectedPrescription.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Doctor
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedPrescription.doctor_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Issue Date
                        </label>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedPrescription.prescribed_date || selectedPrescription.issueDate || selectedPrescription.issue_date || '')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedPrescription.expiry_date || selectedPrescription.expiryDate || '')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Verification Status
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedPrescription.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medications */}
                  {(selectedPrescription.items_count || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Medications ({selectedPrescription.items_count || 0})
                      </h3>
                      <div className="text-center py-8">
                        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Medication details will be available once the prescription is processed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedPrescription.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Notes
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Close
                  </button>
                  {selectedPrescription.status === 'filled' && (
                    <button className="px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700">
                      Download Prescription
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
