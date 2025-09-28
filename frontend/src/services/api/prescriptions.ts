import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { Prescription, PrescriptionStatus, PrescriptionMedication, VerificationStatus } from '../../types';

export interface PrescriptionApiService {
  getPrescriptions(params?: PrescriptionQueryParams): Promise<PaginatedResponse<Prescription>>;
  getPrescription(id: string): Promise<Prescription>;
  createPrescription(data: CreatePrescriptionData): Promise<Prescription>;
  updatePrescription(id: string, data: UpdatePrescriptionData): Promise<Prescription>;
  uploadPrescription(file: File, additionalData?: any): Promise<Prescription>;
  verifyPrescription(id: string): Promise<{ status: VerificationStatus; message: string }>;
  getPrescriptionMedications(prescriptionId: string): Promise<PrescriptionMedication[]>;
  refillPrescription(id: string): Promise<Prescription>;
  transferPrescription(id: string, newPharmacyId: string): Promise<void>;
  getPrescriptionHistory(params?: PrescriptionQueryParams): Promise<Prescription[]>;
  validatePrescription(prescriptionData: ValidatePrescriptionData): Promise<ValidationResult>;
}

export interface PrescriptionQueryParams {
  page?: number;
  per_page?: number;
  status?: PrescriptionStatus;
  patient_id?: string;
  doctor_id?: string;
  pharmacy_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  verification_status?: VerificationStatus;
  sort_by?: 'created_at' | 'expiry_date' | 'patient_name';
  sort_order?: 'asc' | 'desc';
}

export interface CreatePrescriptionData {
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  doctor_license: string;
  diagnosis: string;
  medications: {
    medication_id: string;
    medication_name: string;
    strength: string;
    quantity: number;
    dosage_instructions: string;
    refills_remaining: number;
    days_supply: number;
  }[];
  special_instructions?: string;
  prescription_date: string;
  expiry_date?: string;
  emergency_prescription?: boolean;
  controlled_substance?: boolean;
}

export interface UpdatePrescriptionData {
  status?: PrescriptionStatus;
  pharmacy_id?: string;
  filled_date?: string;
  refills_used?: number;
  notes?: string;
}

export interface ValidatePrescriptionData {
  prescription_number: string;
  patient_dob?: string;
  patient_name?: string;
  verification_code?: string;
}

export interface ValidationResult {
  valid: boolean;
  prescription?: Prescription;
  errors?: string[];
  warnings?: string[];
  drug_interactions?: {
    medication1: string;
    medication2: string;
    severity: 'minor' | 'moderate' | 'major';
    description: string;
  }[];
}

class PrescriptionService implements PrescriptionApiService {
  /**
   * Get paginated list of prescriptions
   */
  async getPrescriptions(params?: PrescriptionQueryParams): Promise<PaginatedResponse<Prescription>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/prescriptions?${queryString}` : '/prescriptions';

      const response = await apiClient.get<PaginatedResponse<Prescription>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single prescription by ID
   */
  async getPrescription(id: string): Promise<Prescription> {
    try {
      const response = await apiClient.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new prescription
   */
  async createPrescription(data: CreatePrescriptionData): Promise<Prescription> {
    try {
      const response = await apiClient.post<ApiResponse<Prescription>>('/prescriptions', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update existing prescription
   */
  async updatePrescription(id: string, data: UpdatePrescriptionData): Promise<Prescription> {
    try {
      const response = await apiClient.put<ApiResponse<Prescription>>(`/prescriptions/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Upload prescription file
   */
  async uploadPrescription(file: File, additionalData?: any): Promise<Prescription> {
    try {
      const formData = new FormData();
      formData.append('prescription_file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const response = await apiClient.post<ApiResponse<Prescription>>('/prescriptions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verify prescription authenticity
   */
  async verifyPrescription(id: string): Promise<{ status: VerificationStatus; message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ status: VerificationStatus; message: string }>>(
        `/prescriptions/${id}/verify`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get prescription medications
   */
  async getPrescriptionMedications(prescriptionId: string): Promise<PrescriptionMedication[]> {
    try {
      const response = await apiClient.get<ApiResponse<PrescriptionMedication[]>>(
        `/prescriptions/${prescriptionId}/medications`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Refill prescription
   */
  async refillPrescription(id: string): Promise<Prescription> {
    try {
      const response = await apiClient.post<ApiResponse<Prescription>>(`/prescriptions/${id}/refill`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Transfer prescription to another pharmacy
   */
  async transferPrescription(id: string, newPharmacyId: string): Promise<void> {
    try {
      await apiClient.post(`/prescriptions/${id}/transfer`, {
        new_pharmacy_id: newPharmacyId,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get prescription history for patient
   */
  async getPrescriptionHistory(params?: PrescriptionQueryParams): Promise<Prescription[]> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/prescriptions/history?${queryString}` : '/prescriptions/history';

      const response = await apiClient.get<ApiResponse<Prescription[]>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Validate prescription data
   */
  async validatePrescription(prescriptionData: ValidatePrescriptionData): Promise<ValidationResult> {
    try {
      const response = await apiClient.post<ApiResponse<ValidationResult>>(
        '/prescriptions/validate',
        prescriptionData
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the prescription service instance
export const prescriptionService = new PrescriptionService();
export default prescriptionService;
