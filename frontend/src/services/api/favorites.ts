import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { Medication } from '../../types';

export interface FavoriteMedication {
  id: string;
  medication_id: string;
  name: string;
  brand: string;
  strength: string;
  dosage_form: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  added_at: string;
  last_ordered?: string;
  times_ordered: number;
}

export interface FavoritesQueryParams {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  sort_by?: 'name' | 'price' | 'added_at' | 'times_ordered';
  sort_order?: 'asc' | 'desc';
}

export interface FavoritesApiService {
  getFavorites(params?: FavoritesQueryParams): Promise<PaginatedResponse<FavoriteMedication>>;
  addToFavorites(medicationId: string): Promise<FavoriteMedication>;
  removeFromFavorites(medicationId: string): Promise<void>;
  isFavorite(medicationId: string): Promise<boolean>;
  getFavoritesSummary(): Promise<{
    total_favorites: number;
    in_stock: number;
    previously_ordered: number;
    categories: string[];
  }>;
}

class FavoritesService implements FavoritesApiService {
  /**
   * Get user's favorite medications
   */
  async getFavorites(params?: FavoritesQueryParams): Promise<PaginatedResponse<FavoriteMedication>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/favorites?${queryString}` : '/favorites';

      const response = await apiClient.get<PaginatedResponse<FavoriteMedication>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Add medication to favorites
   */
  async addToFavorites(medicationId: string): Promise<FavoriteMedication> {
    try {
      const response = await apiClient.post<ApiResponse<FavoriteMedication>>('/favorites', {
        medication_id: medicationId
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Remove medication from favorites
   */
  async removeFromFavorites(medicationId: string): Promise<void> {
    try {
      await apiClient.delete(`/favorites/${medicationId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check if medication is in favorites
   */
  async isFavorite(medicationId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ is_favorite: boolean }>>(`/favorites/check/${medicationId}`);
      return response.data.data.is_favorite;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get favorites summary statistics
   */
  async getFavoritesSummary(): Promise<{
    total_favorites: number;
    in_stock: number;
    previously_ordered: number;
    categories: string[];
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{
        total_favorites: number;
        in_stock: number;
        previously_ordered: number;
        categories: string[];
      }>>('/favorites/summary');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the favorites service instance
export const favoritesService = new FavoritesService();
export default favoritesService;
