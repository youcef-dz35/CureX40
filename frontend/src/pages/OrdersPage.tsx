import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api/orders';
import { Order, OrderItem } from '../types';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Phone,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  Star,
  Download,
  Plus
} from 'lucide-react';


export default function OrdersPage() {
  const { t } = useTranslation(['pharmacy']);
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Debounced search callback
  const handleSearch = useCallback(async (debouncedSearchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrderHistory({
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined
      });
      setOrders(response);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Use debounced search
  useDebouncedSearch(searchTerm, handleSearch, 500);

  // Fetch orders when status filter changes (immediate)
  useEffect(() => {
    if (searchTerm === '') {
      handleSearch('');
    }
  }, [statusFilter, handleSearch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'ready':
        return <Truck className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Orders are now filtered on the backend, so we use them directly
  const filteredOrders = orders;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrderHistory();
      setOrders(response);
    } catch (err: any) {
      console.error('Failed to refresh orders:', err);
      setError(err.message || 'Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-curex-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
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
                Track Your Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your medication orders and delivery status
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
                <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
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
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'delivered').length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orders.filter(o => ['pending', 'confirmed', 'processing', 'ready', 'shipped'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(orders.reduce((sum, order) => sum + (order.total_amount || order.total || 0), 0))}
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
                  placeholder="Search orders..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You haven\'t placed any orders yet.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button className="inline-flex items-center px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Medications
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.pharmacy_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center px-3 py-1 text-curex-blue-600 hover:text-curex-blue-700 font-medium"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(order.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {typeof order.delivery_address === 'string' ? order.delivery_address : 
                       order.delivery_address ? `${order.delivery_address.street}, ${order.delivery_address.city}` : 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      {order.delivery_phone}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.total_amount || order.total || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {order.items?.length || order.orderItems?.length || 0} item{(order.items?.length || order.orderItems?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Order Details - {selectedOrder.order_number}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {(selectedOrder.items || selectedOrder.orderItems || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.medication_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.medication_brand}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.total_price || item.totalPrice || 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCurrency(item.unit_price || item.unitPrice || 0)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Delivery Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        {typeof selectedOrder.delivery_address === 'string' ? selectedOrder.delivery_address : 
                         selectedOrder.delivery_address ? `${selectedOrder.delivery_address.street}, ${selectedOrder.delivery_address.city}` : 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedOrder.delivery_phone}
                      </div>
                      {selectedOrder.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Notes:</strong> {selectedOrder.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedOrder.total_amount || selectedOrder.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
