/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/api/auth';
import { storage } from '../utils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (data: any) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate token on server
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and storage regardless of API response
      setUser(null);
      setToken(null);
      storage.remove('curex40-token');
      storage.remove('curex40-user');
      storage.remove('curex40-refresh-token');
    }
  }, [token]);

  // Handle auth logout event from interceptors
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
      storage.remove('curex40-token');
      storage.remove('curex40-user');
      storage.remove('curex40-refresh-token');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = storage.get<string>('curex40-token', '');
        const savedUser = storage.get<User | null>('curex40-user', null);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);

          // Validate token and refresh user data
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            storage.set('curex40-user', userData);
          } catch (error) {
            console.error('Error validating auth:', error);
            // Token is invalid, logout
            await logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const refreshTokenValue = storage.get<string>('curex40-refresh-token', '');

      if (!refreshTokenValue) {
        await logout();
        return;
      }

      const data: AuthResponse = await authService.refreshToken();

      // Update tokens
      setToken(data.token);
      storage.set('curex40-token', data.token);

      if (data.refreshToken) {
        storage.set('curex40-refresh-token', data.refreshToken);
      }

      // Update user data if provided
      if (data.user) {
        setUser(data.user);
        storage.set('curex40-user', data.user);
      }

      // Set up next token refresh
      if (data.expiresIn) {
        setTimeout(() => {
          refreshToken();
        }, (data.expiresIn - 60) * 1000);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  }, [logout]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const data: AuthResponse = await authService.login(credentials);

      // Store auth data
      setUser(data.user);
      setToken(data.token);
      storage.set('curex40-token', data.token);
      storage.set('curex40-user', data.user);

      // Store refresh token if provided
      if (data.refreshToken) {
        storage.set('curex40-refresh-token', data.refreshToken);
      }

      // Set up token expiration handling
      if (data.expiresIn) {
        setTimeout(() => {
          refreshToken();
        }, (data.expiresIn - 60) * 1000); // Refresh 1 minute before expiry
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const authData: AuthResponse = await authService.register(data);

      // Auto-login after successful registration
      setUser(authData.user);
      setToken(authData.token);
      storage.set('curex40-token', authData.token);
      storage.set('curex40-user', authData.user);

      if (authData.refreshToken) {
        storage.set('curex40-refresh-token', authData.refreshToken);
      }

      // Set up token expiration handling
      if (authData.expiresIn) {
        setTimeout(() => {
          refreshToken();
        }, (authData.expiresIn - 60) * 1000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      storage.set('curex40-user', updatedUser);
    }
  };

  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (data: any): Promise<{ message: string }> => {
    try {
      return await authService.resetPassword(data);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
