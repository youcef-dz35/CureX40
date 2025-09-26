import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { Order, OrderStatus, OrderItem, PaymentMethod, DeliveryMethod } from '../../types';

export interface OrderApiService {
  getOrders(params?: OrderQueryParams): Promise<PaginatedResponse<Order>>;
  getOrder(id: string): Promise<Order>;
  createOrder(data: CreateOrderData): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
  cancelOrder(id: string, reason?: string): Promise<void>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  trackOrder(id: string): Promise<OrderTracking>;
  getOrderHistory(userId?: string): Promise<Order[]>;
  processPayment(orderId: string, paymentData: PaymentData): Promise<PaymentResult>;
  requestRefund(orderId: string, reason: string): Promise<RefundResult>;
}

export interface OrderQueryParams {
  page?: number;
  per_page?: number;
  status?: OrderStatus;
  user_id?: string;
  pharmacy_id?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: 'created_at' | 'total_amount' | 'status';
  sort_order?: 'asc' | 'desc';
}

export interface CreateOrderData {
  items: {
    medication_id: string;
    quantity: number;
    price: number;
  }[];
  pharmacy_id: string;
  delivery_method: DeliveryMethod;
  delivery_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  payment_method: PaymentMethod;
  special_instructions?: string;
  prescription_id?: string;
  insurance_coverage?: boolean;
}

export interface OrderTracking {
  order_id: string;
  status: OrderStatus;
  tracking_number?: string;
  estimated_delivery?: string;
  updates: {
    status: string;
    message: string;
    timestamp: string;
    location?: string;
  }[];
}

export interface PaymentData {
  payment_method: PaymentMethod;
  stripe_payment_method_id?: string;
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

export interface PaymentResult {
  payment_id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  currency: string;
  receipt_url?: string;
  error_message?: string;
}

export interface RefundResult {
  refund_id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  reason: string;
  expected_processing_time?: string;
}

class OrderService implements OrderApiService {
  /**
   * Get paginated list of orders
   */
  async getOrders(params?: OrderQueryParams): Promise<PaginatedResponse<Order>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/orders?${queryString}` : '/orders';

      const response = await apiClient.get<PaginatedResponse<Order>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single order by ID
   */
  async getOrder(id: string): Promise<Order> {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason?: string): Promise<void> {
    try {
      await apiClient.delete(`/orders/${id}`, {
        data: { reason },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get order items
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<OrderItem[]>>(`/orders/${orderId}/items`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Track order
   */
  async trackOrder(id: string): Promise<OrderTracking> {
    try {
      const response = await apiClient.get<ApiResponse<OrderTracking>>(`/orders/${id}/tracking`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get order history for user
   */
  async getOrderHistory(userId?: string): Promise<Order[]> {
    try {
      const params = userId ? { user_id: userId } : {};
      const queryString = buildQueryParams(params);
      const url = queryString ? `/orders/history?${queryString}` : '/orders/history';

      const response = await apiClient.get<ApiResponse<Order[]>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Process payment for order
   */
  async processPayment(orderId: string, paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentResult>>(
        `/orders/${orderId}/payment`,
        paymentData
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Request refund for order
   */
  async requestRefund(orderId: string, reason: string): Promise<RefundResult> {
    try {
      const response = await apiClient.post<ApiResponse<RefundResult>>(`/orders/${orderId}/refund`, {
        reason,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the order service instance
export const orderService = new OrderService();
export default orderService;
