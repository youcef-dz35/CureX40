import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { NationalHealthMetrics, RegionMetrics, SupplyChainAlert, AlertType, AlertSeverity } from '../../types';

export interface GovernmentApiService {
  getHealthMetrics(params?: HealthMetricsQueryParams): Promise<NationalHealthMetrics>;
  getRegionMetrics(regionId: string, params?: RegionMetricsQueryParams): Promise<RegionMetrics>;
  getSupplyChainAlerts(params?: AlertQueryParams): Promise<PaginatedResponse<SupplyChainAlert>>;
  createAlert(data: CreateAlertData): Promise<SupplyChainAlert>;
  updateAlert(id: string, data: UpdateAlertData): Promise<SupplyChainAlert>;
  acknowledgeAlert(id: string): Promise<void>;
  getDrugShortages(): Promise<DrugShortage[]>;
  reportDrugShortage(data: DrugShortageReport): Promise<DrugShortage>;
  getComplianceReports(params?: ComplianceQueryParams): Promise<PaginatedResponse<ComplianceReport>>;
  generateComplianceReport(pharmacyId: string, period: string): Promise<ComplianceReport>;
  getRegulationUpdates(params?: RegulationQueryParams): Promise<PaginatedResponse<RegulationUpdate>>;
  publishRegulationUpdate(data: RegulationUpdateData): Promise<RegulationUpdate>;
}

export interface HealthMetricsQueryParams {
  period?: string;
  region?: string;
  metric_type?: string;
  include_predictions?: boolean;
}

export interface RegionMetricsQueryParams {
  period?: string;
  include_demographics?: boolean;
  include_trends?: boolean;
}

export interface AlertQueryParams {
  page?: number;
  per_page?: number;
  alert_type?: AlertType;
  severity?: AlertSeverity;
  region?: string;
  acknowledged?: boolean;
  from_date?: string;
  to_date?: string;
  sort_by?: 'created_at' | 'severity' | 'alert_type';
  sort_order?: 'asc' | 'desc';
}

export interface CreateAlertData {
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  affected_regions: string[];
  affected_medications?: string[];
  estimated_duration?: string;
  recommended_actions: string[];
  contact_information?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface UpdateAlertData {
  severity?: AlertSeverity;
  description?: string;
  status?: 'active' | 'resolved' | 'monitoring';
  estimated_duration?: string;
  recommended_actions?: string[];
}

export interface DrugShortage {
  id: string;
  medication_id: string;
  medication_name: string;
  ndc_numbers: string[];
  shortage_type: 'supply' | 'manufacturing' | 'regulatory' | 'quality';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  affected_regions: string[];
  estimated_shortage_start: string;
  estimated_resolution?: string;
  current_supply_percentage: number;
  alternative_medications: {
    medication_id: string;
    name: string;
    availability_score: number;
  }[];
  manufacturer_updates: {
    manufacturer: string;
    update: string;
    date: string;
  }[];
  status: 'active' | 'resolved' | 'monitoring';
  created_at: string;
  updated_at: string;
}

export interface DrugShortageReport {
  medication_id: string;
  shortage_type: 'supply' | 'manufacturing' | 'regulatory' | 'quality';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  affected_regions: string[];
  estimated_shortage_start: string;
  estimated_resolution?: string;
  current_supply_percentage: number;
  description: string;
  reported_by: string;
  contact_info: {
    name: string;
    organization: string;
    phone: string;
    email: string;
  };
}

export interface ComplianceQueryParams {
  page?: number;
  per_page?: number;
  pharmacy_id?: string;
  compliance_type?: string;
  status?: 'compliant' | 'non_compliant' | 'pending_review';
  from_date?: string;
  to_date?: string;
  sort_by?: 'created_at' | 'compliance_score' | 'pharmacy_name';
  sort_order?: 'asc' | 'desc';
}

export interface ComplianceReport {
  id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  report_period: {
    start_date: string;
    end_date: string;
  };
  compliance_score: number;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  categories: {
    category: string;
    score: number;
    max_score: number;
    status: 'pass' | 'fail' | 'warning';
    findings: string[];
    recommendations: string[];
  }[];
  violations: {
    violation_type: string;
    severity: 'minor' | 'major' | 'critical';
    description: string;
    regulation_reference: string;
    fine_amount?: number;
    corrective_action_required: boolean;
    deadline?: string;
  }[];
  certifications: {
    certification_type: string;
    status: 'valid' | 'expired' | 'suspended';
    expiry_date?: string;
    renewal_required: boolean;
  }[];
  inspector_notes?: string;
  generated_by: string;
  generated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface RegulationQueryParams {
  page?: number;
  per_page?: number;
  category?: string;
  effective_date_from?: string;
  effective_date_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  sort_by?: 'effective_date' | 'priority' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface RegulationUpdate {
  id: string;
  title: string;
  category: string;
  description: string;
  full_text: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effective_date: string;
  compliance_deadline?: string;
  affected_stakeholders: string[];
  key_changes: string[];
  required_actions: string[];
  resources: {
    title: string;
    url: string;
    type: 'document' | 'form' | 'guidance' | 'faq';
  }[];
  contact_information: {
    department: string;
    phone: string;
    email: string;
  };
  published_by: string;
  published_at: string;
  updated_at?: string;
}

export interface RegulationUpdateData {
  title: string;
  category: string;
  description: string;
  full_text: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effective_date: string;
  compliance_deadline?: string;
  affected_stakeholders: string[];
  key_changes: string[];
  required_actions: string[];
  resources?: {
    title: string;
    url: string;
    type: 'document' | 'form' | 'guidance' | 'faq';
  }[];
  contact_information: {
    department: string;
    phone: string;
    email: string;
  };
}

class GovernmentService implements GovernmentApiService {
  /**
   * Get national health metrics
   */
  async getHealthMetrics(params?: HealthMetricsQueryParams): Promise<NationalHealthMetrics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/government/health-metrics?${queryString}` : '/government/health-metrics';

      const response = await apiClient.get<ApiResponse<NationalHealthMetrics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get regional health metrics
   */
  async getRegionMetrics(regionId: string, params?: RegionMetricsQueryParams): Promise<RegionMetrics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString
        ? `/government/regions/${regionId}/metrics?${queryString}`
        : `/government/regions/${regionId}/metrics`;

      const response = await apiClient.get<ApiResponse<RegionMetrics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get supply chain alerts
   */
  async getSupplyChainAlerts(params?: AlertQueryParams): Promise<PaginatedResponse<SupplyChainAlert>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/government/alerts?${queryString}` : '/government/alerts';

      const response = await apiClient.get<PaginatedResponse<SupplyChainAlert>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new supply chain alert
   */
  async createAlert(data: CreateAlertData): Promise<SupplyChainAlert> {
    try {
      const response = await apiClient.post<ApiResponse<SupplyChainAlert>>('/government/alerts', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update supply chain alert
   */
  async updateAlert(id: string, data: UpdateAlertData): Promise<SupplyChainAlert> {
    try {
      const response = await apiClient.put<ApiResponse<SupplyChainAlert>>(`/government/alerts/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(id: string): Promise<void> {
    try {
      await apiClient.post(`/government/alerts/${id}/acknowledge`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get drug shortages
   */
  async getDrugShortages(): Promise<DrugShortage[]> {
    try {
      const response = await apiClient.get<ApiResponse<DrugShortage[]>>('/government/drug-shortages');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Report drug shortage
   */
  async reportDrugShortage(data: DrugShortageReport): Promise<DrugShortage> {
    try {
      const response = await apiClient.post<ApiResponse<DrugShortage>>('/government/drug-shortages', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get compliance reports
   */
  async getComplianceReports(params?: ComplianceQueryParams): Promise<PaginatedResponse<ComplianceReport>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/government/compliance-reports?${queryString}` : '/government/compliance-reports';

      const response = await apiClient.get<PaginatedResponse<ComplianceReport>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(pharmacyId: string, period: string): Promise<ComplianceReport> {
    try {
      const response = await apiClient.post<ApiResponse<ComplianceReport>>(
        '/government/compliance-reports/generate',
        {
          pharmacy_id: pharmacyId,
          period,
        }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get regulation updates
   */
  async getRegulationUpdates(params?: RegulationQueryParams): Promise<PaginatedResponse<RegulationUpdate>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/government/regulations?${queryString}` : '/government/regulations';

      const response = await apiClient.get<PaginatedResponse<RegulationUpdate>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Publish regulation update
   */
  async publishRegulationUpdate(data: RegulationUpdateData): Promise<RegulationUpdate> {
    try {
      const response = await apiClient.post<ApiResponse<RegulationUpdate>>('/government/regulations', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the government service instance
export const governmentService = new GovernmentService();
export default governmentService;
