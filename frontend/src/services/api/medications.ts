import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { Medication, MedicationForm, MedicationCategory, SearchFilters } from '../../types';

export interface MedicationApiService {
  getMedications(params?: MedicationQueryParams): Promise<PaginatedResponse<Medication>>;
  getMedication(id: string): Promise<Medication>;
  createMedication(data: CreateMedicationData): Promise<Medication>;
  updateMedication(id: string, data: UpdateMedicationData): Promise<Medication>;
  deleteMedication(id: string): Promise<void>;
  searchMedications(query: string, filters?: SearchFilters): Promise<Medication[]>;
  getMedicationByBarcode(barcode: string): Promise<Medication>;
  checkInteractions(medicationIds: string[]): Promise<MedicationInteraction[]>;
  getAlternatives(medicationId: string): Promise<Medication[]>;
  getMedicationStock(medicationId: string, pharmacyId?: string): Promise<MedicationStock[]>;
  reserveMedication(medicationId: string, quantity: number, pharmacyId: string): Promise<ReservationResult>;
}

export interface MedicationQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: MedicationCategory;
  form?: MedicationForm;
  prescription_required?: boolean;
  in_stock?: boolean;
  pharmacy_id?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'name' | 'price' | 'created_at' | 'stock_quantity';
  sort_order?: 'asc' | 'desc';
}

export interface CreateMedicationData {
  name: string;
  generic_name?: string;
  brand_name?: string;
  description: string;
  category: MedicationCategory;
  form: MedicationForm;
  strength: string;
  dosage_instructions: string;
  active_ingredients: string[];
  inactive_ingredients?: string[];
  contraindications?: string[];
  side_effects?: string[];
  warnings?: string[];
  storage_instructions?: string;
  manufacturer: string;
  ndc_number?: string;
  barcode?: string;
  price: number;
  prescription_required: boolean;
  controlled_substance?: boolean;
  schedule?: string;
  therapeutic_class?: string;
  drug_class?: string;
  route_of_administration?: string;
  pregnancy_category?: string;
  age_restrictions?: {
    min_age?: number;
    max_age?: number;
  };
  dosage_forms_available?: string[];
  package_sizes?: string[];
  expiration_date?: string;
  lot_number?: string;
  images?: string[];
}

export interface UpdateMedicationData extends Partial<CreateMedicationData> {
  is_active?: boolean;
}

export interface MedicationInteraction {
  medication1_id: string;
  medication1_name: string;
  medication2_id: string;
  medication2_name: string;
  interaction_type: 'major' | 'moderate' | 'minor';
  severity: 'contraindicated' | 'serious' | 'significant' | 'minor';
  description: string;
  mechanism: string;
  management: string;
  references?: string[];
}

export interface MedicationStock {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address: string;
  quantity_available: number;
  price: number;
  last_updated: string;
  estimated_delivery?: string;
  pickup_available: boolean;
  delivery_available: boolean;
  distance_km?: number;
}

export interface ReservationResult {
  reservation_id: string;
  medication_id: string;
  pharmacy_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  reserved_until: string;
  pickup_instructions?: string;
}

class MedicationService implements MedicationApiService {
  /**
   * Get paginated list of medications
   */
  async getMedications(params?: MedicationQueryParams): Promise<PaginatedResponse<Medication>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/medications?${queryString}` : '/medications';

      const response = await apiClient.get<PaginatedResponse<Medication>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single medication by ID
   */
  async getMedication(id: string): Promise<Medication> {
    try {
      const response = await apiClient.get<ApiResponse<Medication>>(`/medications/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new medication
   */
  async createMedication(data: CreateMedicationData): Promise<Medication> {
    try {
      const response = await apiClient.post<ApiResponse<Medication>>('/medications', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update existing medication
   */
  async updateMedication(id: string, data: UpdateMedicationData): Promise<Medication> {
    try {
      const response = await apiClient.put<ApiResponse<Medication>>(`/medications/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete medication
   */
  async deleteMedication(id: string): Promise<void> {
    try {
      await apiClient.delete(`/medications/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search medications with filters
   */
  async searchMedications(query: string, filters?: SearchFilters): Promise<Medication[]> {
    try {
      const params = {
        search: query,
        ...filters,
      };

      const queryString = buildQueryParams(params);
      const response = await apiClient.get<ApiResponse<Medication[]>>(`/medications/search?${queryString}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get medication by barcode
   */
  async getMedicationByBarcode(barcode: string): Promise<Medication> {
    try {
      const response = await apiClient.get<ApiResponse<Medication>>(`/medications/barcode/${barcode}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check drug interactions between medications
   */
  async checkInteractions(medicationIds: string[]): Promise<MedicationInteraction[]> {
    try {
      const response = await apiClient.post<ApiResponse<MedicationInteraction[]>>('/medications/interactions', {
        medication_ids: medicationIds,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get alternative medications
   */
  async getAlternatives(medicationId: string): Promise<Medication[]> {
    try {
      const response = await apiClient.get<ApiResponse<Medication[]>>(`/medications/${medicationId}/alternatives`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get medication stock across pharmacies
   */
  async getMedicationStock(medicationId: string, pharmacyId?: string): Promise<MedicationStock[]> {
    try {
      const params = pharmacyId ? { pharmacy_id: pharmacyId } : {};
      const queryString = buildQueryParams(params);
      const url = queryString
        ? `/medications/${medicationId}/stock?${queryString}`
        : `/medications/${medicationId}/stock`;

      const response = await apiClient.get<ApiResponse<MedicationStock[]>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reserve medication at specific pharmacy
   */
  async reserveMedication(medicationId: string, quantity: number, pharmacyId: string): Promise<ReservationResult> {
    try {
      const response = await apiClient.post<ApiResponse<ReservationResult>>(`/medications/${medicationId}/reserve`, {
        quantity,
        pharmacy_id: pharmacyId,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the medication service instance
export const medicationService = new MedicationService();
export default medicationService;
