import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { medicationService } from '../services/api/medications';
import { Medication } from '../types';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart,
  RefreshCw,
  AlertCircle,
  Package,
  Pill,
  TrendingUp,
  Clock,
  Shield,
  X
} from 'lucide-react';

export default function MedicationsPage() {
  const { t } = useTranslation(['pharmacy']);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounced search callback
  const handleSearch = useCallback(async (debouncedSearchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicationService.getMedications({
        page: 1,
        per_page: 50,
        search: debouncedSearchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter as any : undefined
      });
      setMedications(response.data);
    } catch (err: any) {
      console.error('Failed to fetch medications:', err);
      setError(err.message || 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  // Use debounced search
  useDebouncedSearch(searchTerm, handleSearch, 500);

  // Fetch medications when category filter changes (immediate)
  useEffect(() => {
    if (searchTerm === '') {
      handleSearch('');
    }
  }, [categoryFilter, handleSearch]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicationService.getMedications({
        page: 1,
        per_page: 50
      });
      setMedications(response.data);
    } catch (err: any) {
      console.error('Failed to refresh medications:', err);
      setError(err.message || 'Failed to refresh medications');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Medications are now filtered on the backend, so we use them directly
  const filteredMedications = medications;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-curex-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Browse Medications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find and order your medications with ease
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading medications</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Medications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{medications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {medications.filter(m => m.stock > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {medications.filter(m => m.stock <= 10 && m.stock > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(medications.map(m => m.category)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medications..."
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
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="prescription">Prescription</option>
                <option value="over-the-counter">Over the Counter</option>
                <option value="supplements">Supplements</option>
                <option value="vitamins">Vitamins</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-curex-blue-100 text-curex-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-curex-blue-100 text-curex-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Medications List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredMedications.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No medications found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No medications are available at the moment.'
                }
              </p>
            </div>
          ) : (
            filteredMedications.map((medication) => (
              <div key={medication.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {medication.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {medication.brand} • {medication.genericName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {medication.category}
                        </span>
                        {medication.requiresPrescription && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(medication.price)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {medication.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        medication.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : medication.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {medication.stock > 0 ? `${medication.stock} in stock` : 'Out of stock'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {medication.form}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      disabled={medication.stock === 0}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {medication.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
