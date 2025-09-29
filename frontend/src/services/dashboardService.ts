import { apiClient } from './api';

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  total_prescriptions: number;
  active_prescriptions: number;
  total_spent: number;
  total_medications?: number;
  low_stock?: number;
  expiring_soon?: number;
  revenue?: number;
  orders?: number;
  prescriptions?: number;
  revenue_change?: number;
  orders_change?: number;
  prescriptions_change?: number;
  // Government dashboard fields
  total_pharmacies?: number;
  active_pharmacies?: number;
  medications_in_stock?: number;
  medications_shortage?: number;
  processed_claims?: number;
  average_wait_time?: number;
  supply_coverage?: number;
  // Insurance dashboard fields
  total_claims?: number;
  pending_claims?: number;
  approved_claims?: number;
  rejected_claims?: number;
  total_claim_value?: number;
  average_claim_value?: number;
  processing_time?: number;
  fraud_detection_rate?: number;
  approval_rate?: number;
  monthly_change?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_orders: any[];
  recent_prescriptions: any[];
  low_stock_medications: any[];
  inventory_summary?: any;
  quick_actions?: any;
  pharmacy_stats?: any[];
  medication_stats?: any[];
  recent_activities?: any[];
}

export interface AnalyticsData {
  orders: {
    total: number;
    by_status: Record<string, number>;
    by_day: Record<string, number>;
    total_revenue: number;
  };
  prescriptions: {
    total: number;
    by_status: Record<string, number>;
    by_day: Record<string, number>;
  };
  revenue: {
    total: number;
    by_day: Record<string, number>;
    by_pharmacy: Record<string, number>;
  };
  inventory: {
    total_medications: number;
    low_stock_count: number;
    expiring_soon_count: number;
    by_category: Record<string, number>;
  };
}

class DashboardService {
  /**
   * Get dashboard data for the authenticated user
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }

  /**
   * Get analytics data for charts and graphs
   */
  async getAnalytics(period: number = 30): Promise<AnalyticsData> {
    const response = await apiClient.get('/dashboard/analytics', {
      params: { period }
    });
    return response.data;
  }

  /**
   * Get pharmacy-specific dashboard data
   */
  async getPharmacyDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }

  /**
   * Get government dashboard data
   */
  async getGovernmentDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }

  /**
   * Get insurance dashboard data
   */
  async getInsuranceDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }

  /**
   * Get patient dashboard data
   */
  async getPatientDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();
