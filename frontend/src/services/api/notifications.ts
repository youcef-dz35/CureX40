import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { AppNotification, NotificationType } from '../../types';

export interface NotificationApiService {
  getNotifications(params?: NotificationQueryParams): Promise<PaginatedResponse<AppNotification>>;
  getNotification(id: string): Promise<AppNotification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getUnreadCount(): Promise<{ count: number }>;
  updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings>;
  getNotificationSettings(): Promise<NotificationSettings>;
  sendNotification(data: SendNotificationData): Promise<AppNotification>;
  subscribeToWebPush(subscription: PushSubscription): Promise<void>;
  unsubscribeFromWebPush(): Promise<void>;
  testNotification(type: NotificationType): Promise<void>;
}

export interface NotificationQueryParams {
  page?: number;
  per_page?: number;
  type?: NotificationType;
  read?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  from_date?: string;
  to_date?: string;
  sort_by?: 'created_at' | 'priority' | 'type';
  sort_order?: 'asc' | 'desc';
}

export interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  types: {
    [K in NotificationType]: {
      email: boolean;
      push: boolean;
      sms: boolean;
      in_app: boolean;
    };
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
  frequency: {
    digest_enabled: boolean;
    digest_frequency: 'daily' | 'weekly' | 'monthly';
    digest_time: string;
  };
}

export interface SendNotificationData {
  recipient_id?: string;
  recipient_ids?: string[];
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  schedule_for?: string;
  channels?: ('email' | 'push' | 'sms' | 'in_app')[];
}

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService implements NotificationApiService {
  /**
   * Get paginated list of notifications
   */
  async getNotifications(params?: NotificationQueryParams): Promise<PaginatedResponse<AppNotification>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/notifications?${queryString}` : '/notifications';

      const response = await apiClient.get<PaginatedResponse<AppNotification>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single notification by ID
   */
  async getNotification(id: string): Promise<AppNotification> {
    try {
      const response = await apiClient.get<ApiResponse<AppNotification>>(`/notifications/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put<ApiResponse<NotificationSettings>>('/notifications/settings', settings);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get<ApiResponse<NotificationSettings>>('/notifications/settings');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Send notification (admin/system use)
   */
  async sendNotification(data: SendNotificationData): Promise<AppNotification> {
    try {
      const response = await apiClient.post<ApiResponse<AppNotification>>('/notifications/send', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Subscribe to web push notifications
   */
  async subscribeToWebPush(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData: WebPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      };

      await apiClient.post('/notifications/web-push/subscribe', subscriptionData);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Unsubscribe from web push notifications
   */
  async unsubscribeFromWebPush(): Promise<void> {
    try {
      await apiClient.post('/notifications/web-push/unsubscribe');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Test notification delivery
   */
  async testNotification(type: NotificationType): Promise<void> {
    try {
      await apiClient.post('/notifications/test', { type });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Request notification permission and setup web push
   */
  async setupWebPush(): Promise<boolean> {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Check if service worker and push messaging are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const vapidPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Send subscription to server
      await this.subscribeToWebPush(subscription);

      return true;
    } catch (error) {
      console.error('Failed to setup web push:', error);
      return false;
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title: string, options?: NotificationOptions): void {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...options,
        });
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  /**
   * Setup real-time notification listener (WebSocket/SSE)
   */
  setupRealtimeNotifications(onNotification: (notification: AppNotification) => void): () => void {
    try {
      // Setup WebSocket connection for real-time notifications
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      const ws = new WebSocket(`${wsUrl}/notifications`);

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          onNotification(notification);

          // Show browser notification if enabled
          this.showBrowserNotification(notification.title, {
            body: notification.message,
            tag: notification.id,
            data: notification,
          });
        } catch (error) {
          console.error('Failed to process real-time notification:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Notification WebSocket connection closed');
      };

      // Return cleanup function
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Failed to setup real-time notifications:', error);
      return () => {};
    }
  }
}

// Create and export the notification service instance
export const notificationService = new NotificationService();
export default notificationService;
