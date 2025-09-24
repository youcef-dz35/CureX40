/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';
import { storage } from '../utils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
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

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    storage.remove('curex40-token');
    storage.remove('curex40-user');
    storage.remove('curex40-refresh-token');

    // Call logout endpoint to invalidate token on server
    if (token) {
      fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Error during logout:', error);
      });
    }
  }, [token]);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Validate token and refresh user data
    const validateAndRefreshAuth = async (authToken: string) => {
      try {
        const response = await fetch('/api/v1/auth/user', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.data);
          storage.set('curex40-user', userData.data);
        } else {
          // Token is invalid, logout
          logout();
        }
      } catch (error) {
        console.error('Error validating auth:', error);
        logout();
      }
    };

    const initAuth = () => {
      try {
        const savedToken = storage.get<string>('curex40-token', '');
        const savedUser = storage.get<User | null>('curex40-user', null);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          // Validate token and refresh user data
          validateAndRefreshAuth(savedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        logout();
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
        logout();
        return;
      }

      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        logout();
        return;
      }

      const data: AuthResponse = await response.json();

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
      logout();
    }
  }, [logout]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();

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
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const authData: AuthResponse = await response.json();

      // Auto-login after successful registration
      setUser(authData.user);
      setToken(authData.token);
      storage.set('curex40-token', authData.token);
      storage.set('curex40-user', authData.user);

      if (authData.refreshToken) {
        storage.set('curex40-refresh-token', authData.refreshToken);
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

  // Set up axios interceptor for token refresh on 401 responses
  useEffect(() => {
    if (token) {
      // Note: This is a simplified interceptor setup
      // In a real app, you'd set this up with your HTTP client (axios, etc.)
      return () => {
        // Cleanup interceptor
      };
    }
  }, [token, refreshToken]);

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
