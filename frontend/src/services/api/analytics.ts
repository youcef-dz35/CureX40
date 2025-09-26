import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';

export interface AnalyticsApiService {
  getUserAnalytics(userId?: string, period?: string): Promise<UserAnalytics>;
  getPharmacyAnalytics(pharmacyId: string, period?: string): Promise<PharmacyAnalytics>;
  getSystemAnalytics(period?: string): Promise<SystemAnalytics>;
  getMedicationAnalytics(medicationId?: string, period?: string): Promise<MedicationAnalytics>;
  getOrderAnalytics(params?: OrderAnalyticsParams): Promise<OrderAnalytics>;
  getPrescriptionAnalytics(params?: PrescriptionAnalyticsParams): Promise<PrescriptionAnalytics>;
  getRevenueAnalytics(params?: RevenueAnalyticsParams): Promise<RevenueAnalytics>;
  getCustomerAnalytics(params?: CustomerAnalyticsParams): Promise<CustomerAnalytics>;
  getInventoryAnalytics(pharmacyId?: string, period?: string): Promise<InventoryAnalytics>;
  getComplianceAnalytics(params?: ComplianceAnalyticsParams): Promise<ComplianceAnalytics>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackPageView(data: PageViewData): Promise<void>;
  getEventAnalytics(params?: EventAnalyticsParams): Promise<EventAnalytics>;
  generateReport(reportType: string, params: ReportParams): Promise<AnalyticsReport>;
  exportData(exportType: string, params: ExportParams): Promise<ExportResult>;
}

export interface UserAnalytics {
  user_id: string;
  period: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  prescription_count: number;
  favorite_medications: {
    medication_id: string;
    medication_name: string;
    order_count: number;
    total_quantity: number;
  }[];
  preferred_pharmacies: {
    pharmacy_id: string;
    pharmacy_name: string;
    order_count: number;
    total_spent: number;
  }[];
  order_frequency: {
    date: string;
    order_count: number;
  }[];
  savings_data: {
    total_savings: number;
    insurance_savings: number;
    discount_savings: number;
    generic_savings: number;
  };
  health_metrics: {
    adherence_rate: number;
    refill_frequency: number;
    medication_consistency: number;
  };
}

export interface PharmacyAnalytics {
  pharmacy_id: string;
  period: string;
  revenue: {
    total: number;
    average_per_day: number;
    growth_rate: number;
    comparison_period: number;
  };
  orders: {
    total: number;
    average_per_day: number;
    completion_rate: number;
    cancellation_rate: number;
  };
  customers: {
    total: number;
    new_customers: number;
    returning_customers: number;
    retention_rate: number;
  };
  inventory: {
    total_medications: number;
    low_stock_items: number;
    expired_items: number;
    turnover_rate: number;
  };
  top_medications: {
    medication_id: string;
    medication_name: string;
    quantity_sold: number;
    revenue: number;
  }[];
  performance_metrics: {
    average_fulfillment_time: number;
    customer_satisfaction: number;
    error_rate: number;
    compliance_score: number;
  };
}

export interface SystemAnalytics {
  period: string;
  user_metrics: {
    total_users: number;
    active_users: number;
    new_registrations: number;
    user_retention_rate: number;
  };
  transaction_metrics: {
    total_transactions: number;
    total_revenue: number;
    average_transaction_value: number;
    transaction_growth_rate: number;
  };
  pharmacy_metrics: {
    total_pharmacies: number;
    active_pharmacies: number;
    average_pharmacy_rating: number;
    pharmacy_utilization_rate: number;
  };
  medication_metrics: {
    total_medications: number;
    most_prescribed: string[];
    shortage_alerts: number;
    price_fluctuations: number;
  };
  system_performance: {
    average_response_time: number;
    uptime_percentage: number;
    error_rate: number;
    api_calls_per_day: number;
  };
}

export interface MedicationAnalytics {
  medication_id?: string;
  period: string;
  prescription_data: {
    total_prescriptions: number;
    unique_patients: number;
    average_quantity: number;
    refill_rate: number;
  };
  pricing_data: {
    average_price: number;
    price_trend: 'increasing' | 'decreasing' | 'stable';
    price_variations: {
      pharmacy_id: string;
      pharmacy_name: string;
      price: number;
    }[];
  };
  availability_data: {
    in_stock_pharmacies: number;
    out_of_stock_pharmacies: number;
    average_stock_level: number;
  };
  usage_patterns: {
    peak_months: string[];
    seasonal_trends: {
      month: string;
      prescription_count: number;
    }[];
    demographic_breakdown: {
      age_group: string;
      gender: string;
      percentage: number;
    }[];
  };
}

export interface OrderAnalyticsParams {
  period?: string;
  pharmacy_id?: string;
  status?: string;
  user_id?: string;
}

export interface OrderAnalytics {
  period: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  average_order_value: number;
  order_trends: {
    date: string;
    order_count: number;
    revenue: number;
  }[];
  delivery_analytics: {
    average_delivery_time: number;
    on_time_delivery_rate: number;
    delivery_method_breakdown: {
      method: string;
      count: number;
      percentage: number;
    }[];
  };
  payment_analytics: {
    payment_method_breakdown: {
      method: string;
      count: number;
      total_amount: number;
    }[];
    average_processing_time: number;
    success_rate: number;
  };
}

export interface PrescriptionAnalyticsParams {
  period?: string;
  doctor_id?: string;
  pharmacy_id?: string;
  patient_id?: string;
}

export interface PrescriptionAnalytics {
  period: string;
  total_prescriptions: number;
  verified_prescriptions: number;
  filled_prescriptions: number;
  verification_time: {
    average: number;
    median: number;
    percentile_95: number;
  };
  prescription_sources: {
    source: string;
    count: number;
    percentage: number;
  }[];
  medication_categories: {
    category: string;
    prescription_count: number;
    percentage: number;
  }[];
  refill_patterns: {
    average_refills_per_prescription: number;
    timely_refill_rate: number;
    early_refill_rate: number;
    late_refill_rate: number;
  };
}

export interface RevenueAnalyticsParams {
  period?: string;
  pharmacy_id?: string;
  breakdown_by?: 'day' | 'week' | 'month';
}

export interface RevenueAnalytics {
  period: string;
  total_revenue: number;
  revenue_growth: number;
  revenue_breakdown: {
    period: string;
    revenue: number;
    orders: number;
  }[];
  revenue_sources: {
    source: 'prescriptions' | 'otc' | 'services' | 'insurance';
    amount: number;
    percentage: number;
  }[];
  profit_margins: {
    gross_profit: number;
    net_profit: number;
    profit_margin_percentage: number;
  };
  top_revenue_generators: {
    type: 'medication' | 'service';
    id: string;
    name: string;
    revenue: number;
  }[];
}

export interface CustomerAnalyticsParams {
  period?: string;
  pharmacy_id?: string;
  segment?: string;
}

export interface CustomerAnalytics {
  period: string;
  customer_metrics: {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    churn_rate: number;
  };
  customer_segments: {
    segment: string;
    count: number;
    percentage: number;
    average_order_value: number;
  }[];
  customer_lifetime_value: {
    average_clv: number;
    high_value_customers: number;
    clv_distribution: {
      range: string;
      count: number;
    }[];
  };
  satisfaction_metrics: {
    average_rating: number;
    nps_score: number;
    satisfaction_distribution: {
      rating: number;
      count: number;
    }[];
  };
}

export interface InventoryAnalytics {
  pharmacy_id?: string;
  period: string;
  inventory_metrics: {
    total_medications: number;
    total_value: number;
    turnover_rate: number;
    days_of_supply: number;
  };
  stock_levels: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    overstocked: number;
  };
  expiry_tracking: {
    expired_items: number;
    expiring_soon: number;
    waste_value: number;
  };
  demand_forecasting: {
    medication_id: string;
    medication_name: string;
    predicted_demand: number;
    current_stock: number;
    recommended_reorder: number;
  }[];
}

export interface ComplianceAnalyticsParams {
  period?: string;
  pharmacy_id?: string;
  regulation_type?: string;
}

export interface ComplianceAnalytics {
  period: string;
  overall_compliance_score: number;
  compliance_categories: {
    category: string;
    score: number;
    status: 'compliant' | 'warning' | 'non_compliant';
  }[];
  violations: {
    total: number;
    resolved: number;
    pending: number;
    critical: number;
  };
  audit_history: {
    date: string;
    audit_type: string;
    score: number;
    violations_found: number;
  }[];
  improvement_trends: {
    date: string;
    compliance_score: number;
  }[];
}

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface PageViewData {
  page_url: string;
  page_title?: string;
  user_id?: string;
  session_id?: string;
  referrer?: string;
  timestamp?: string;
}

export interface EventAnalyticsParams {
  period?: string;
  event_name?: string;
  user_id?: string;
}

export interface EventAnalytics {
  period: string;
  total_events: number;
  unique_users: number;
  events_breakdown: {
    event_name: string;
    count: number;
    unique_users: number;
  }[];
  user_engagement: {
    average_session_duration: number;
    bounce_rate: number;
    pages_per_session: number;
  };
  conversion_metrics: {
    conversion_rate: number;
    conversion_funnel: {
      step: string;
      count: number;
      conversion_rate: number;
    }[];
  };
}

export interface ReportParams {
  period?: string;
  pharmacy_id?: string;
  user_id?: string;
  filters?: Record<string, any>;
  format?: 'json' | 'csv' | 'pdf';
}

export interface AnalyticsReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  parameters: ReportParams;
  data: any;
  summary: {
    total_records: number;
    key_metrics: Record<string, number>;
    insights: string[];
  };
  download_url?: string;
}

export interface ExportParams {
  data_type: string;
  period?: string;
  filters?: Record<string, any>;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  include_metadata?: boolean;
}

export interface ExportResult {
  export_id: string;
  status: 'processing' | 'completed' | 'failed';
  download_url?: string;
  file_size?: number;
  expires_at?: string;
  error_message?: string;
}

class AnalyticsService implements AnalyticsApiService {
  /**
   * Get user analytics
   */
  async getUserAnalytics(userId?: string, period: string = '30d'): Promise<UserAnalytics> {
    try {
      const params: any = { period };
      if (userId) params.user_id = userId;

      const queryString = buildQueryParams(params);
      const response = await apiClient.get<ApiResponse<UserAnalytics>>(`/analytics/users?${queryString}`);
      return response.data.data;
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
        `/analytics/pharmacies/${pharmacyId}?period=${period}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get system-wide analytics
   */
  async getSystemAnalytics(period: string = '30d'): Promise<SystemAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<SystemAnalytics>>(`/analytics/system?period=${period}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get medication analytics
   */
  async getMedicationAnalytics(medicationId?: string, period: string = '30d'): Promise<MedicationAnalytics> {
    try {
      const params: any = { period };
      if (medicationId) params.medication_id = medicationId;

      const queryString = buildQueryParams(params);
      const response = await apiClient.get<ApiResponse<MedicationAnalytics>>(`/analytics/medications?${queryString}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(params?: OrderAnalyticsParams): Promise<OrderAnalytics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/analytics/orders?${queryString}` : '/analytics/orders';

      const response = await apiClient.get<ApiResponse<OrderAnalytics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get prescription analytics
   */
  async getPrescriptionAnalytics(params?: PrescriptionAnalyticsParams): Promise<PrescriptionAnalytics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/analytics/prescriptions?${queryString}` : '/analytics/prescriptions';

      const response = await apiClient.get<ApiResponse<PrescriptionAnalytics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(params?: RevenueAnalyticsParams): Promise<RevenueAnalytics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/analytics/revenue?${queryString}` : '/analytics/revenue';

      const response = await apiClient.get<ApiResponse<RevenueAnalytics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(params?: CustomerAnalyticsParams): Promise<CustomerAnalytics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/analytics/customers?${queryString}` : '/analytics/customers';

      const response = await apiClient.get<ApiResponse<CustomerAnalytics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(pharmacyId?: string, period: string = '30d'): Promise<InventoryAnalytics> {
    try {
      const params: any = { period };
      if (pharmacyId) params.pharmacy_id = pharmacyId;

      const queryString = buildQueryParams(params);
      const response = await apiClient.get<ApiResponse<InventoryAnalytics>>(`/analytics/inventory?${queryString}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get compliance analytics
   */
  async getComplianceAnalytics(params?: ComplianceAnalyticsParams): Promise<ComplianceAnalytics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/analytics/compliance?${queryString}` : '/analytics/compliance';

      const response = await apiClient.get<ApiResponse<ComplianceAnalytics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Track analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await apiClient.post('/analytics/events', {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      // Don't throw error for analytics tracking to avoid disrupting user experience
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(data: PageViewData): Promise<void> {
    try {
      await apiClient.post('/analytics/page-views', {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      // Don't throw error for analytics tracking
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(params?: EventAnalyticsParams): Promise<EventAnalytics> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/analytics/events?${queryString}` : '/analytics/events';

      const response = await apiClient.get<ApiResponse<EventAnalytics>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(reportType: string, params: ReportParams): Promise<AnalyticsReport> {
    try {
      const response = await apiClient.post<ApiResponse<AnalyticsReport>>('/analytics/reports', {
        report_type: reportType,
        ...params,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Export analytics data
   */
  async exportData(exportType: string, params: ExportParams): Promise<ExportResult> {
    try {
      const response = await apiClient.post<ApiResponse<ExportResult>>('/analytics/export', {
        export_type: exportType,
        ...params,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the analytics service instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
