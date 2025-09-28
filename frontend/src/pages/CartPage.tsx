import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cartService } from '../services/api/cart';
import { Cart, CartItem } from '../services/api/cart';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  RefreshCw, 
  XCircle,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User
} from 'lucide-react';

export default function CartPage() {
  const { t } = useTranslation(['pharmacy']);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      setError('Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      await cartService.updateCartItem(itemId, { quantity: newQuantity });
      await loadCart(); // Reload cart to get updated totals
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      await loadCart(); // Reload cart
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await loadCart(); // Reload cart
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-curex-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
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
            onClick={loadCart}
            className="px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start adding medications to your cart to see them here.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700">
              Browse Medications
            </button>
          </div>
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
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => {
                const stockStatus = getStockStatus(item.medication.stock);
                const StockIcon = stockStatus.icon;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* Medication Image */}
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.medication.image_url ? (
                          <img
                            src={item.medication.image_url}
                            alt={item.medication.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.medication.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.medication.brand} • {item.medication.strength} {item.medication.dosage_form}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-curex-blue-600">
                              {formatPrice(item.total_price)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPrice(item.unit_price)} each
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${stockStatus.color}`}>
                            <StockIcon className="h-3 w-3" />
                            {stockStatus.status === 'out' ? 'Out of Stock' : 
                             stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Stock: {item.medication.stock} units
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity <= 1}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {updating === item.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id || item.quantity >= item.medication.stock}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(cart.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(cart.shipping_cost)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-curex-blue-600">{formatPrice(cart.total_amount)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-curex-blue-600 text-white py-3 px-4 rounded-lg hover:bg-curex-blue-700 font-medium mb-4">
                Proceed to Checkout
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
