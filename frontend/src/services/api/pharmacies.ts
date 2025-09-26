import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { Pharmacy, PharmacyService as PharmacyServiceEnum, Address, Coordinates, OperatingHours } from '../../types';

export interface PharmacyApiService {
  getPharmacies(params?: PharmacyQueryParams): Promise<PaginatedResponse<Pharmacy>>;
  getPharmacy(id: string): Promise<Pharmacy>;
  searchPharmacies(query: string, location?: Coordinates): Promise<Pharmacy[]>;
  getNearbyPharmacies(location: Coordinates, radius?: number): Promise<Pharmacy[]>;
  getPharmacyServices(pharmacyId: string): Promise<PharmacyServiceEnum[]>;
  getPharmacyHours(pharmacyId: string): Promise<OperatingHours>;
  checkMedicationAvailability(pharmacyId: string, medicationId: string): Promise<MedicationAvailability>;
  getPharmacyInventory(pharmacyId: string, params?: InventoryQueryParams): Promise<PaginatedResponse<PharmacyInventory>>;
  reserveMedication(pharmacyId: string, medicationId: string, quantity: number): Promise<ReservationResult>;
  getPharmacyReviews(pharmacyId: string, params?: ReviewQueryParams): Promise<PaginatedResponse<PharmacyReview>>;
  submitPharmacyReview(pharmacyId: string, review: ReviewData): Promise<PharmacyReview>;
  registerPharmacy(data: RegisterPharmacyData): Promise<Pharmacy>;
  updatePharmacy(id: string, data: UpdatePharmacyData): Promise<Pharmacy>;
  deletePharmacy(id: string): Promise<void>;
  getPharmacyAnalytics(pharmacyId: string, period?: string): Promise<PharmacyAnalytics>;
}

export interface PharmacyQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  services?: PharmacyServiceEnum[];
  open_now?: boolean;
  delivery_available?: boolean;
  accepts_insurance?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sort_by?: 'distance' | 'rating' | 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface InventoryQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  in_stock?: boolean;
  low_stock?: boolean;
  sort_by?: 'name' | 'quantity' | 'price' | 'expiry_date';
  sort_order?: 'asc' | 'desc';
}

export interface ReviewQueryParams {
  page?: number;
  per_page?: number;
  rating?: number;
  sort_by?: 'created_at' | 'rating' | 'helpful';
  sort_order?: 'asc' | 'desc';
}

export interface MedicationAvailability {
  available: boolean;
  quantity: number;
  price: number;
  estimated_pickup_time?: string;
  estimated_delivery_time?: string;
  requires_prescription: boolean;
  in_stock: boolean;
  alternative_medications?: {
    medication_id: string;
    name: string;
    price: number;
    available: boolean;
  }[];
}

export interface PharmacyInventory {
  id: string;
  medication_id: string;
  medication_name: string;
  brand_name?: string;
  generic_name?: string;
  strength: string;
  form: string;
  quantity: number;
  price: number;
  cost_price?: number;
  supplier: string;
  batch_number: string;
  expiry_date: string;
  manufacturer: string;
  ndc_number?: string;
  barcode?: string;
  location_in_pharmacy?: string;
  reorder_level: number;
  last_restocked: string;
  notes?: string;
}

export interface ReservationResult {
  reservation_id: string;
  pharmacy_id: string;
  medication_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  reserved_until: string;
  pickup_instructions?: string;
  confirmation_code?: string;
}

export interface PharmacyReview {
  id: string;
  user_id: string;
  user_name: string;
  pharmacy_id: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  visit_date?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewData {
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  visit_date?: string;
  recommend: boolean;
}

export interface RegisterPharmacyData {
  name: string;
  license_number: string;
  dea_number?: string;
  npi_number?: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  address: Address;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  services: PharmacyServiceEnum[];
  operating_hours: OperatingHours;
  delivery_available: boolean;
  delivery_radius?: number;
  delivery_fee?: number;
  free_delivery_threshold?: number;
  accepts_insurance: boolean;
  accepted_insurance_providers?: string[];
  parking_available: boolean;
  wheelchair_accessible: boolean;
  drive_through_available: boolean;
  emergency_services: boolean;
  consultation_services: boolean;
  vaccination_services: boolean;
  specialty_services?: string[];
  logo?: string;
  images?: string[];
}

export interface UpdatePharmacyData extends Partial<RegisterPharmacyData> {
  is_active?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

export interface PharmacyAnalytics {
  pharmacy_id: string;
  period: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  total_prescriptions_filled: number;
  customer_count: number;
  new_customers: number;
  returning_customers: number;
  average_rating: number;
  total_reviews: number;
  inventory_turnover: number;
  top_selling_medications: {
    medication_name: string;
    quantity_sold: number;
    revenue: number;
  }[];
  daily_stats: {
    date: string;
    orders: number;
    revenue: number;
    prescriptions: number;
    new_customers: number;
  }[];
  customer_satisfaction: {
    very_satisfied: number;
    satisfied: number;
    neutral: number;
    dissatisfied: number;
    very_dissatisfied: number;
  };
}

class PharmacyService implements PharmacyApiService {
  /**
   * Get paginated list of pharmacies
   */
  async getPharmacies(params?: PharmacyQueryParams): Promise<PaginatedResponse<Pharmacy>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/pharmacies?${queryString}` : '/pharmacies';

      const response = await apiClient.get<PaginatedResponse<Pharmacy>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single pharmacy by ID
   */
  async getPharmacy(id: string): Promise<Pharmacy> {
    try {
      const response = await apiClient.get<ApiResponse<Pharmacy>>(`/pharmacies/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search pharmacies by name or location
   */
  async searchPharmacies(query: string, location?: Coordinates): Promise<Pharmacy[]> {
    try {
      const params: any = { search: query };
      if (location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }

      const queryString = buildQueryParams(params);
      const response = await apiClient.get<ApiResponse<Pharmacy[]>>(`/pharmacies/search?${queryString}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get nearby pharmacies based on location
   */
  async getNearbyPharmacies(location: Coordinates, radius: number = 10): Promise<Pharmacy[]> {
    try {
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
      };

      const queryString = buildQueryParams(params);
      const response = await apiClient.get<ApiResponse<Pharmacy[]>>(`/pharmacies/nearby?${queryString}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get services offered by pharmacy
   */
  async getPharmacyServices(pharmacyId: string): Promise<PharmacyServiceEnum[]> {
    try {
      const response = await apiClient.get<ApiResponse<PharmacyServiceEnum[]>>(`/pharmacies/${pharmacyId}/services`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get pharmacy operating hours
   */
  async getPharmacyHours(pharmacyId: string): Promise<OperatingHours> {
    try {
      const response = await apiClient.get<ApiResponse<OperatingHours>>(`/pharmacies/${pharmacyId}/hours`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check medication availability at pharmacy
   */
  async checkMedicationAvailability(pharmacyId: string, medicationId: string): Promise<MedicationAvailability> {
    try {
      const response = await apiClient.get<ApiResponse<MedicationAvailability>>(
        `/pharmacies/${pharmacyId}/medications/${medicationId}/availability`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get pharmacy inventory
   */
  async getPharmacyInventory(pharmacyId: string, params?: InventoryQueryParams): Promise<PaginatedResponse<PharmacyInventory>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString
        ? `/pharmacies/${pharmacyId}/inventory?${queryString}`
        : `/pharmacies/${pharmacyId}/inventory`;

      const response = await apiClient.get<PaginatedResponse<PharmacyInventory>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reserve medication at pharmacy
   */
  async reserveMedication(pharmacyId: string, medicationId: string, quantity: number): Promise<ReservationResult> {
    try {
      const response = await apiClient.post<ApiResponse<ReservationResult>>(
        `/pharmacies/${pharmacyId}/medications/${medicationId}/reserve`,
        { quantity }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get pharmacy reviews
   */
  async getPharmacyReviews(pharmacyId: string, params?: ReviewQueryParams): Promise<PaginatedResponse<PharmacyReview>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString
        ? `/pharmacies/${pharmacyId}/reviews?${queryString}`
        : `/pharmacies/${pharmacyId}/reviews`;

      const response = await apiClient.get<PaginatedResponse<PharmacyReview>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Submit pharmacy review
   */
  async submitPharmacyReview(pharmacyId: string, review: ReviewData): Promise<PharmacyReview> {
    try {
      const response = await apiClient.post<ApiResponse<PharmacyReview>>(
        `/pharmacies/${pharmacyId}/reviews`,
        review
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Register new pharmacy
   */
  async registerPharmacy(data: RegisterPharmacyData): Promise<Pharmacy> {
    try {
      const response = await apiClient.post<ApiResponse<Pharmacy>>('/pharmacies', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update pharmacy information
   */
  async updatePharmacy(id: string, data: UpdatePharmacyData): Promise<Pharmacy> {
    try {
      const response = await apiClient.put<ApiResponse<Pharmacy>>(`/pharmacies/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete pharmacy
   */
  async deletePharmacy(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pharmacies/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get pharmacy analytics
   */
  async getPharmacyAnalytics(pharmacyId: string, period: string = '30d'): Promise<PharmacyAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<PharmacyAnalytics>>(
        `/pharmacies/${pharmacyId}/analytics?period=${period}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the pharmacy service instance
export const pharmacyService = new PharmacyService();
export default pharmacyService;
