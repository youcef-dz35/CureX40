import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { InsuranceClaim, ClaimStatus, FraudRisk, ClaimDocument } from '../../types';

export interface InsuranceApiService {
  getClaims(params?: ClaimQueryParams): Promise<PaginatedResponse<InsuranceClaim>>;
  getClaim(id: string): Promise<InsuranceClaim>;
  submitClaim(data: SubmitClaimData): Promise<InsuranceClaim>;
  updateClaim(id: string, data: UpdateClaimData): Promise<InsuranceClaim>;
  processClaimPayment(claimId: string): Promise<PaymentProcessResult>;
  getClaimDocuments(claimId: string): Promise<ClaimDocument[]>;
  uploadClaimDocument(claimId: string, file: File, documentType: string): Promise<ClaimDocument>;
  validateInsurance(policyNumber: string, patientInfo: PatientInfo): Promise<InsuranceValidationResult>;
  checkCoverage(medicationId: string, insuranceId: string): Promise<CoverageResult>;
  getFraudRisk(claimId: string): Promise<FraudRisk>;
  getClaimHistory(patientId?: string): Promise<InsuranceClaim[]>;
  estimateCoverage(medications: MedicationCoverageRequest[]): Promise<CoverageEstimate>;
}

export interface ClaimQueryParams {
  page?: number;
  per_page?: number;
  status?: ClaimStatus;
  patient_id?: string;
  provider_id?: string;
  insurance_company?: string;
  from_date?: string;
  to_date?: string;
  amount_min?: number;
  amount_max?: number;
  sort_by?: 'created_at' | 'amount' | 'status' | 'processed_date';
  sort_order?: 'asc' | 'desc';
}

export interface SubmitClaimData {
  patient_id: string;
  prescription_id: string;
  pharmacy_id: string;
  insurance_policy_number: string;
  insurance_group_number?: string;
  claim_amount: number;
  medications: {
    medication_id: string;
    quantity: number;
    unit_cost: number;
    ndc_number: string;
    days_supply: number;
  }[];
  diagnosis_codes: string[];
  prescriber_npi: string;
  date_of_service: string;
  supporting_documents?: string[];
}

export interface UpdateClaimData {
  status?: ClaimStatus;
  adjudication_amount?: number;
  denial_reason?: string;
  payment_date?: string;
  notes?: string;
  reviewer_id?: string;
}

export interface PaymentProcessResult {
  success: boolean;
  payment_id: string;
  amount_paid: number;
  payment_method: string;
  transaction_id?: string;
  estimated_payment_date: string;
  reference_number: string;
}

export interface PatientInfo {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  member_id?: string;
}

export interface InsuranceValidationResult {
  valid: boolean;
  policy_active: boolean;
  member_info?: {
    member_id: string;
    member_name: string;
    plan_name: string;
    group_number: string;
    effective_date: string;
    termination_date?: string;
  };
  coverage_details?: {
    prescription_coverage: boolean;
    copay_amount: number;
    deductible_remaining: number;
    out_of_pocket_max: number;
    out_of_pocket_remaining: number;
  };
  errors?: string[];
}

export interface CoverageResult {
  covered: boolean;
  copay_amount: number;
  coinsurance_percentage?: number;
  deductible_applies: boolean;
  prior_authorization_required: boolean;
  quantity_limits?: {
    max_quantity_per_fill: number;
    max_fills_per_period: number;
    period_days: number;
  };
  step_therapy_required: boolean;
  alternative_medications?: {
    medication_id: string;
    name: string;
    covered: boolean;
    copay_amount: number;
  }[];
  coverage_tier: number;
  formulary_status: 'preferred' | 'non-preferred' | 'not-covered';
}

export interface MedicationCoverageRequest {
  medication_id: string;
  quantity: number;
  days_supply: number;
  pharmacy_id?: string;
}

export interface CoverageEstimate {
  total_retail_cost: number;
  total_insurance_coverage: number;
  total_patient_responsibility: number;
  medications: {
    medication_id: string;
    medication_name: string;
    retail_cost: number;
    insurance_coverage: number;
    patient_cost: number;
    copay_amount: number;
    coverage_percentage: number;
    covered: boolean;
    notes?: string;
  }[];
  summary: {
    covered_medications: number;
    uncovered_medications: number;
    total_copay: number;
    total_coinsurance: number;
    deductible_applied: number;
  };
}

class InsuranceService implements InsuranceApiService {
  /**
   * Get paginated list of insurance claims
   */
  async getClaims(params?: ClaimQueryParams): Promise<PaginatedResponse<InsuranceClaim>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/insurance/claims?${queryString}` : '/insurance/claims';

      const response = await apiClient.get<PaginatedResponse<InsuranceClaim>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single insurance claim by ID
   */
  async getClaim(id: string): Promise<InsuranceClaim> {
    try {
      const response = await apiClient.get<ApiResponse<InsuranceClaim>>(`/insurance/claims/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Submit new insurance claim
   */
  async submitClaim(data: SubmitClaimData): Promise<InsuranceClaim> {
    try {
      const response = await apiClient.post<ApiResponse<InsuranceClaim>>('/insurance/claims', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update insurance claim
   */
  async updateClaim(id: string, data: UpdateClaimData): Promise<InsuranceClaim> {
    try {
      const response = await apiClient.put<ApiResponse<InsuranceClaim>>(`/insurance/claims/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Process claim payment
   */
  async processClaimPayment(claimId: string): Promise<PaymentProcessResult> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentProcessResult>>(
        `/insurance/claims/${claimId}/process-payment`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get claim documents
   */
  async getClaimDocuments(claimId: string): Promise<ClaimDocument[]> {
    try {
      const response = await apiClient.get<ApiResponse<ClaimDocument[]>>(`/insurance/claims/${claimId}/documents`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Upload claim document
   */
  async uploadClaimDocument(claimId: string, file: File, documentType: string): Promise<ClaimDocument> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);

      const response = await apiClient.post<ApiResponse<ClaimDocument>>(
        `/insurance/claims/${claimId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Validate insurance policy
   */
  async validateInsurance(policyNumber: string, patientInfo: PatientInfo): Promise<InsuranceValidationResult> {
    try {
      const response = await apiClient.post<ApiResponse<InsuranceValidationResult>>('/insurance/validate', {
        policy_number: policyNumber,
        patient_info: patientInfo,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check medication coverage
   */
  async checkCoverage(medicationId: string, insuranceId: string): Promise<CoverageResult> {
    try {
      const response = await apiClient.post<ApiResponse<CoverageResult>>('/insurance/coverage/check', {
        medication_id: medicationId,
        insurance_id: insuranceId,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get fraud risk assessment for claim
   */
  async getFraudRisk(claimId: string): Promise<FraudRisk> {
    try {
      const response = await apiClient.get<ApiResponse<FraudRisk>>(`/insurance/claims/${claimId}/fraud-risk`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get claim history
   */
  async getClaimHistory(patientId?: string): Promise<InsuranceClaim[]> {
    try {
      const params = patientId ? { patient_id: patientId } : {};
      const queryString = buildQueryParams(params);
      const url = queryString ? `/insurance/claims/history?${queryString}` : '/insurance/claims/history';

      const response = await apiClient.get<ApiResponse<InsuranceClaim[]>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Estimate medication coverage
   */
  async estimateCoverage(medications: MedicationCoverageRequest[]): Promise<CoverageEstimate> {
    try {
      const response = await apiClient.post<ApiResponse<CoverageEstimate>>('/insurance/coverage/estimate', {
        medications,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the insurance service instance
export const insuranceService = new InsuranceService();
export default insuranceService;
