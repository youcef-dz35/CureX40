import { apiClient, ApiResponse, handleApiError } from './config';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../../types';

export interface AuthApiService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(data: ResetPasswordData): Promise<{ message: string }>;
  verifyEmail(token: string): Promise<{ message: string }>;
  resendVerification(): Promise<{ message: string }>;
  updateProfile(data: UpdateProfileData): Promise<User>;
  changePassword(data: ChangePasswordData): Promise<{ message: string }>;
  enable2FA(): Promise<{ qr_code: string; backup_codes: string[] }>;
  verify2FA(code: string): Promise<{ message: string }>;
  disable2FA(password: string): Promise<{ message: string }>;
}

export interface ResetPasswordData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_info?: {
    blood_type?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    current_medications?: string[];
  };
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

class AuthService implements AuthApiService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.warn('Logout request failed:', error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/user');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
        email,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', {
        token,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>('/auth/password', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(): Promise<{ qr_code: string; backup_codes: string[] }> {
    try {
      const response = await apiClient.post<ApiResponse<{ qr_code: string; backup_codes: string[] }>>('/auth/2fa/enable');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verify two-factor authentication code
   */
  async verify2FA(code: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/2fa/verify', {
        code,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/2fa/disable', {
        password,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the auth service instance
export const authService = new AuthService();
export default authService;
