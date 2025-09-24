/**
 * Custom React hooks for CureX40 frontend application
 * Provides reusable logic for API calls, state management, and common functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ApiResponse,
  PaginationParams,
  PaginationMeta,
  LoadingState,
  Medication,

  Cart,
  CartItem,
  SearchFilters,
} from '../types';

/**
 * Hook for managing API call states
 */
export function useApiCall<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for making HTTP requests with authentication
 */
export function useApiRequest() {
  const { token } = useAuth();

  const request = useCallback(
    async <T>(
      url: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    [token]
  );

  return request;
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  baseUrl: string,
  initialParams: PaginationParams = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PaginationParams>(initialParams);

  const request = useApiRequest();

  const fetchData = useCallback(
    async (newParams?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        const currentParams = { ...params, ...newParams };

        Object.entries(currentParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        const url = `${baseUrl}?${queryParams.toString()}`;
        const response = await request<T[]>(url);

        setData(response.data || []);
        setMeta(response.meta || null);
        setParams(currentParams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, params, request]
  );

  const nextPage = useCallback(() => {
    if (meta?.hasNextPage) {
      fetchData({ page: (meta.page || 1) + 1 });
    }
  }, [meta, fetchData]);

  const previousPage = useCallback(() => {
    if (meta?.hasPreviousPage) {
      fetchData({ page: (meta.page || 1) - 1 });
    }
  }, [meta, fetchData]);

  const goToPage = useCallback(
    (page: number) => {
      fetchData({ page });
    },
    [fetchData]
  );

  const updateParams = useCallback(
    (newParams: Partial<PaginationParams>) => {
      fetchData({ ...newParams, page: 1 });
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    meta,
    loading,
    error,
    params,
    fetchData,
    nextPage,
    previousPage,
    goToPage,
    updateParams,
  };
}

/**
 * Hook for managing local storage state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

/**
 * Hook for managing shopping cart
 */
export function useCart(): Cart & {
  addItem: (medication: Medication, quantity?: number, notes?: string) => void;
  removeItem: (medicationId: string) => void;
  updateQuantity: (medicationId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (medicationId: string) => number;
} {
  const [items, setItems] = useLocalStorage<CartItem[]>('curex40-cart', []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.medication.price * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const addItem = useCallback(
    (medication: Medication, quantity: number = 1, notes?: string) => {
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.medication.id === medication.id);

        if (existingItem) {
          return currentItems.map(item =>
            item.medication.id === medication.id
              ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
              : item
          );
        } else {
          return [...currentItems, { medication, quantity, notes }];
        }
      });
    },
    [setItems]
  );

  const removeItem = useCallback(
    (medicationId: string) => {
      setItems(currentItems => currentItems.filter(item => item.medication.id !== medicationId));
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (medicationId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(medicationId);
        return;
      }

      setItems(currentItems =>
        currentItems.map(item =>
          item.medication.id === medicationId ? { ...item, quantity } : item
        )
      );
    },
    [setItems, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const getItemQuantity = useCallback(
    (medicationId: string) => {
      const item = items.find(item => item.medication.id === medicationId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };
}

/**
 * Hook for managing search and filters
 */
export function useSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState<string>(filters.query || '');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const updateFilter = useCallback((key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const resetToDefaults = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery(initialFilters.query || '');
  }, [initialFilters]);

  // Update query filter when debounced query changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, query: debouncedQuery || undefined }));
  }, [debouncedQuery]);

  return {
    filters,
    searchQuery,
    setSearchQuery,
    updateFilter,
    clearFilters,
    resetToDefaults,
  };
}

/**
 * Hook for async operations with loading states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): LoadingState & {
  data: T | null;
  execute: () => Promise<T | undefined>;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, isLoading, error, execute };
}

/**
 * Hook for window size
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return entry;
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
