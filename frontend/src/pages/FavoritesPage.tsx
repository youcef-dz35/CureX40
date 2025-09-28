import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { favoritesService } from '../services/api/favorites';
import { cartService } from '../services/api/cart';
import { FavoriteMedication } from '../services/api/favorites';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { 
  Heart, 
  Search, 
  Filter, 
  RefreshCw, 
  XCircle, 
  Star,
  ShoppingCart,
  Eye,
  Trash2,
  Plus,
  Pill,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

export default function FavoritesPage() {
  const { t } = useTranslation(['pharmacy']);
  const [favorites, setFavorites] = useState<FavoriteMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'added_at' | 'times_ordered'>('name');

  // Debounced search callback
  const handleSearch = useCallback(async (debouncedSearchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoritesService.getFavorites({
        search: debouncedSearchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sort_by: sortBy,
        sort_order: 'desc'
      });
      setFavorites(data.data || []);
    } catch (err) {
      setError('Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, sortBy]);

  // Use debounced search
  useDebouncedSearch(searchTerm, handleSearch, 500);

  // Fetch favorites when filters change (immediate)
  useEffect(() => {
    if (searchTerm === '') {
      handleSearch('');
    }
  }, [categoryFilter, sortBy, handleSearch]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const removeFavorite = async (medicationId: string) => {
    try {
      await favoritesService.removeFromFavorites(medicationId);
      setFavorites(prev => prev.filter(fav => fav.medication_id !== medicationId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const addToCart = async (medication: FavoriteMedication) => {
    try {
      await cartService.addToCart({
        medication_id: medication.medication_id,
        quantity: 1
      });
      console.log('Added to cart:', medication.name);
      // You could show a toast notification here
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD'
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600', icon: XCircle };
    if (stock < 10) return { status: 'low', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'available', color: 'text-green-600', icon: CheckCircle };
  };

  // Favorites are now filtered and sorted on the backend, so we use them directly
  const filteredFavorites = favorites;

  const categories = Array.from(new Set(favorites.map(fav => fav.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-curex-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
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
            onClick={loadFavorites}
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
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved medications and frequently ordered items
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorites..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="added_at">Sort by Date Added</option>
              <option value="times_ordered">Sort by Most Ordered</option>
            </select>
          </div>
        </div>

        {/* Favorites List */}
        <div className="space-y-4">
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || categoryFilter !== 'all' ? 'No favorites found' : 'No favorites yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start adding medications to your favorites to see them here.'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700">
                  <Plus className="h-4 w-4" />
                  Browse Medications
                </button>
              )}
            </div>
          ) : (
            filteredFavorites.map((favorite) => {
              const stockStatus = getStockStatus(favorite.stock);
              const StockIcon = stockStatus.icon;
              
              return (
                <div
                  key={favorite.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Medication Image */}
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          {favorite.image_url ? (
                            <img
                              src={favorite.image_url}
                              alt={favorite.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Pill className="h-8 w-8 text-gray-400" />
                          )}
                        </div>

                        {/* Medication Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {favorite.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {favorite.brand} • {favorite.strength} {favorite.dosage_form}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-curex-blue-600">
                                {formatPrice(favorite.price)}
                              </span>
                              <button
                                onClick={() => removeFavorite(favorite.medication_id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {favorite.category}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${stockStatus.color}`}>
                              <StockIcon className="h-3 w-3" />
                              {stockStatus.status === 'out' ? 'Out of Stock' : 
                               stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                            </span>
                            {favorite.times_ordered > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Star className="h-3 w-3 text-yellow-500" />
                                Ordered {favorite.times_ordered} times
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Added {formatDate(favorite.added_at)}</span>
                            </div>
                            {favorite.last_ordered && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Last ordered {formatDate(favorite.last_ordered)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => addToCart(favorite)}
                              disabled={favorite.stock === 0}
                              className="flex items-center gap-2 px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {favorite.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {favorites.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Favorites Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-curex-blue-600">
                  {favorites.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Favorites
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {favorites.filter(fav => fav.stock > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  In Stock
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {favorites.filter(fav => fav.times_ordered > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Previously Ordered
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
