// Main API services index file
import { default as apiClient, API_CONFIG, API_BASE_URL, handleApiError, retryRequest, buildQueryParams, uploadFile, healthCheck } from './config';
export { apiClient, API_CONFIG, API_BASE_URL, handleApiError, retryRequest, buildQueryParams, uploadFile, healthCheck };
export type { ApiResponse, PaginatedResponse, ApiError } from './config';

// Auth service
import authServiceImport from './auth';
export type {
  AuthApiService,
  ResetPasswordData,
  UpdateProfileData,
  ChangePasswordData
} from './auth';

// Medication service
import medicationServiceImport from './medications';
export type {
  MedicationApiService,
  MedicationQueryParams,
  CreateMedicationData,
  UpdateMedicationData,
  MedicationInteraction,
  MedicationStock,
  ReservationResult
} from './medications';

// Order service
import orderServiceImport from './orders';
export type {
  OrderApiService,
  OrderQueryParams,
  CreateOrderData,
  OrderTracking,
  PaymentData,
  PaymentResult,
  RefundResult
} from './orders';

// Prescription service
import prescriptionServiceImport from './prescriptions';
export type {
  PrescriptionApiService,
  PrescriptionQueryParams,
  CreatePrescriptionData,
  UpdatePrescriptionData,
  ValidatePrescriptionData,
  ValidationResult
} from './prescriptions';

// Pharmacy service
import pharmacyServiceImport from './pharmacies';
export type {
  PharmacyApiService,
  PharmacyQueryParams,
  MedicationAvailability,
  PharmacyInventory,
  PharmacyReview,
  ReviewData,
  RegisterPharmacyData,
  UpdatePharmacyData,
} from './pharmacies';

// Smart shelf service
import smartShelfServiceImport from './smart-shelves';
export type {
  SmartShelfApiService,
  ShelfQueryParams,
  ShelfInventoryUpdate,
  ShelfSensorData,
  CalibrationResult,
  ShelfAlert,
  ShelfAnalytics,
  SyncResult
} from './smart-shelves';

// Insurance service
import insuranceServiceImport from './insurance';
export type {
  InsuranceApiService,
  ClaimQueryParams,
  SubmitClaimData,
  UpdateClaimData,
  PaymentProcessResult,
  PatientInfo,
  InsuranceValidationResult,
  CoverageResult,
  MedicationCoverageRequest,
  CoverageEstimate
} from './insurance';

// Government service
import governmentServiceImport from './government';
export type {
  GovernmentApiService,
  HealthMetricsQueryParams,
  CreateAlertData,
  UpdateAlertData,
  DrugShortage,
  DrugShortageReport,
  ComplianceReport,
  RegulationUpdate,
  RegulationUpdateData
} from './government';

// Notification service
import notificationServiceImport from './notifications';
export type {
  NotificationApiService,
  NotificationQueryParams,
  NotificationSettings,
  SendNotificationData,
  WebPushSubscription
} from './notifications';

// Analytics service
import analyticsServiceImport from './analytics';
export type {
  AnalyticsApiService,
  UserAnalytics,
  PharmacyAnalytics,
  SystemAnalytics,
  MedicationAnalytics,
  OrderAnalytics,
  PrescriptionAnalytics,
  RevenueAnalytics,
  CustomerAnalytics,
  InventoryAnalytics,
  ComplianceAnalytics,
  AnalyticsEvent,
  PageViewData,
  EventAnalytics,
  ReportParams,
  AnalyticsReport,
  ExportParams,
  ExportResult
} from './analytics';

// Utility functions for common API operations
export const apiUtils = {
  // Health check for the entire API
  async healthCheck(): Promise<boolean> {
    return await healthCheck();
  },

  // Get API status
  async getStatus(): Promise<{ status: string; version: string; uptime: number }> {
    try {
      const response = await apiClient.get('/status');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Batch operations
  async batchRequest<T>(requests: (() => Promise<T>)[]): Promise<T[]> {
    try {
      const results = await Promise.allSettled(requests.map(request => request()));

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Batch request ${index} failed:`, result.reason);
          throw result.reason;
        }
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Utility method to check if user has permission for an endpoint
  async checkPermission(endpoint: string, method: string = 'GET'): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/check-permission', {
        endpoint,
        method,
      });
      return response.data.data.allowed;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  // Get API rate limit status
  async getRateLimitStatus(): Promise<{
    remaining: number;
    reset: string;
    limit: number;
  }> {
    try {
      const response = await apiClient.get('/rate-limit');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Create service instances
export const authService = authServiceImport;
export const medicationService = medicationServiceImport;
export const orderService = orderServiceImport;
export const prescriptionService = prescriptionServiceImport;
export const pharmacyService = pharmacyServiceImport;
export const smartShelfService = smartShelfServiceImport;
export const insuranceService = insuranceServiceImport;
export const governmentService = governmentServiceImport;
export const notificationService = notificationServiceImport;
export const analyticsService = analyticsServiceImport;

// For backward compatibility, create a simple object with services
export const api = {
  auth: authService,
  medications: medicationService,
  orders: orderService,
  prescriptions: prescriptionService,
  pharmacies: pharmacyService,
  smartShelves: smartShelfService,
  insurance: insuranceService,
  government: governmentService,
  notifications: notificationService,
  analytics: analyticsService,
  utils: apiUtils
};

export default api;

// Re-export commonly used types from the main types file
export type {
  User,
  UserRole,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Medication,
  MedicationForm,
  MedicationCategory,
  Prescription,
  PrescriptionStatus,
  Order,
  OrderStatus,
  OrderItem,
  PaymentMethod,
  DeliveryMethod,
  Pharmacy,
  Address,
  Coordinates,
  OperatingHours,
  PharmacyService,
  AppNotification,
  NotificationType,
  SearchFilters,
  SmartShelf,
  ShelfMedication,
  ShelfStatus,
  SensorType,
  SensorStatus,
  InsuranceClaim,
  ClaimStatus,
  FraudRisk,
  ClaimDocument,
  NationalHealthMetrics,
  RegionMetrics,
  SupplyChainAlert,
  AlertType,
  AlertSeverity,
  AlertStatus
} from '../../types';

// Export utility functions for common operations
export const utils = {
  // Format API errors for user display
  formatError: (error: any): string => {
    if (error.errors && typeof error.errors === 'object') {
      return Object.values(error.errors).flat().join(', ');
    }
    return error.message || 'An unexpected error occurred';
  },

  // Check if error is a validation error
  isValidationError: (error: any): boolean => {
    return error.status === 422 || (error.errors && typeof error.errors === 'object');
  },

  // Check if error is an authentication error
  isAuthError: (error: any): boolean => {
    return error.status === 401 || error.status === 403;
  },

  // Check if error is a network error
  isNetworkError: (error: any): boolean => {
    return error.code === 'NETWORK_ERROR' || !error.status;
  },

  // Retry function with exponential backoff
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Don't retry certain types of errors
        if (utils.isValidationError(error) || utils.isAuthError(error)) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  },

  // Debounce function for API calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Create abort controller for cancellable requests
  createCancellableRequest: <T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): {
    request: Promise<T>;
    cancel: () => void;
  } => {
    const controller = new AbortController();

    return {
      request: requestFn(controller.signal),
      cancel: () => controller.abort(),
    };
  },
};

// Export constants for common use
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TTL: {
    SHORT: 60 * 1000, // 1 minute
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },
} as const;
