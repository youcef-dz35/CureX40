import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { storage } from '../../utils';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Build full API URL
export const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get<string>('curex40-token', '');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for sanctum
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        // Try to refresh token
        const refreshToken = storage.get<string>('curex40-refresh-token', '');

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          const newToken = response.data.data.token;
          storage.set('curex40-token', newToken);

          // Update the authorization header and retry the request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        storage.remove('curex40-token');
        storage.remove('curex40-user');
        storage.remove('curex40-refresh-token');

        // Trigger logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
        status: error.response.status,
      });
    }

    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  status: number;
  message?: string;
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  success: false;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
  code?: string;
}

// Utility function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    const responseData = error.response.data;
    return {
      success: false,
      status: error.response.status,
      message: responseData.message || 'An error occurred',
      errors: responseData.errors,
      error: responseData.error,
    };
  }

  if (error.code) {
    return {
      success: false,
      status: 0,
      message: error.message,
      code: error.code,
    };
  }

  return {
    success: false,
    status: 0,
    message: error.message || 'An unexpected error occurred',
  };
};

// Retry mechanism for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (attempts > 1) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return retryRequest(requestFn, attempts - 1);
    }
    throw error;
  }
};

// Helper function to build query parameters
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(`${key}[]`, item));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

// File upload helper
export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};

// Health check endpoint
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default apiClient;
