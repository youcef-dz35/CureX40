import { apiClient, ApiResponse, handleApiError } from './config';
import { Medication } from '../../types';

export interface CartItem {
  id: string;
  medication_id: string;
  medication: Medication;
  quantity: number;
  unit_price: number;
  total_price: number;
  added_at: string;
  notes?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartData {
  medication_id: string;
  quantity: number;
  notes?: string;
}

export interface UpdateCartItemData {
  quantity: number;
  notes?: string;
}

export interface CartApiService {
  getCart(): Promise<Cart>;
  addToCart(data: AddToCartData): Promise<CartItem>;
  updateCartItem(itemId: string, data: UpdateCartItemData): Promise<CartItem>;
  removeFromCart(itemId: string): Promise<void>;
  clearCart(): Promise<void>;
  getCartSummary(): Promise<{
    items_count: number;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    total_amount: number;
  }>;
}

class CartService implements CartApiService {
  /**
   * Get user's cart
   */
  async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get<ApiResponse<Cart>>('/cart');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartData): Promise<CartItem> {
    try {
      const response = await apiClient.post<ApiResponse<CartItem>>('/cart/items', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update cart item
   */
  async updateCartItem(itemId: string, data: UpdateCartItemData): Promise<CartItem> {
    try {
      const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/items/${itemId}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<void> {
    try {
      await apiClient.delete(`/cart/items/${itemId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/cart');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get cart summary
   */
  async getCartSummary(): Promise<{
    items_count: number;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    total_amount: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{
        items_count: number;
        subtotal: number;
        tax_amount: number;
        shipping_cost: number;
        total_amount: number;
      }>>('/cart/summary');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the cart service instance
export const cartService = new CartService();
export default cartService;
