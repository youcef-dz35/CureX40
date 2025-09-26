import { apiClient, ApiResponse, PaginatedResponse, handleApiError, buildQueryParams } from './config';
import { SmartShelf, ShelfMedication, ShelfStatus, SensorType, SensorStatus } from '../../types';

export interface SmartShelfApiService {
  getShelves(params?: ShelfQueryParams): Promise<PaginatedResponse<SmartShelf>>;
  getShelf(id: string): Promise<SmartShelf>;
  getShelfMedications(shelfId: string): Promise<ShelfMedication[]>;
  updateShelfInventory(shelfId: string, medications: ShelfInventoryUpdate[]): Promise<SmartShelf>;
  getShelfSensors(shelfId: string): Promise<ShelfSensorData[]>;
  calibrateShelf(shelfId: string): Promise<CalibrationResult>;
  getShelfAlerts(shelfId?: string): Promise<ShelfAlert[]>;
  acknowledgeAlert(alertId: string): Promise<void>;
  getShelfAnalytics(shelfId: string, period?: string): Promise<ShelfAnalytics>;
  syncShelfData(shelfId: string): Promise<SyncResult>;
}

export interface ShelfQueryParams {
  page?: number;
  per_page?: number;
  pharmacy_id?: string;
  status?: ShelfStatus;
  location?: string;
  sort_by?: 'name' | 'status' | 'last_sync' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ShelfInventoryUpdate {
  medication_id: string;
  shelf_position: string;
  quantity: number;
  expiry_date?: string;
  batch_number?: string;
}

export interface ShelfSensorData {
  sensor_id: string;
  sensor_type: SensorType;
  status: SensorStatus;
  value: number;
  unit: string;
  threshold_min?: number;
  threshold_max?: number;
  last_reading: string;
  battery_level?: number;
}

export interface CalibrationResult {
  success: boolean;
  shelf_id: string;
  calibrated_sensors: string[];
  failed_sensors: string[];
  calibration_date: string;
  accuracy_score: number;
  recommendations?: string[];
}

export interface ShelfAlert {
  id: string;
  shelf_id: string;
  shelf_name: string;
  alert_type: 'low_stock' | 'expired_medication' | 'sensor_malfunction' | 'temperature_alert' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  created_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_at?: string;
}

export interface ShelfAnalytics {
  shelf_id: string;
  period: string;
  total_medications: number;
  inventory_accuracy: number;
  sensor_uptime: number;
  dispensing_events: number;
  restocking_events: number;
  alerts_generated: number;
  temperature_data: {
    average: number;
    min: number;
    max: number;
    readings: { timestamp: string; value: number }[];
  };
  humidity_data: {
    average: number;
    min: number;
    max: number;
    readings: { timestamp: string; value: number }[];
  };
  medication_usage: {
    medication_name: string;
    dispensed_quantity: number;
    remaining_quantity: number;
    usage_frequency: number;
  }[];
  efficiency_metrics: {
    average_dispensing_time: number;
    error_rate: number;
    maintenance_hours: number;
    cost_savings: number;
  };
}

export interface SyncResult {
  success: boolean;
  shelf_id: string;
  sync_timestamp: string;
  medications_updated: number;
  sensors_synced: number;
  errors: string[];
  next_sync: string;
}

class SmartShelfService implements SmartShelfApiService {
  /**
   * Get paginated list of smart shelves
   */
  async getShelves(params?: ShelfQueryParams): Promise<PaginatedResponse<SmartShelf>> {
    try {
      const queryString = params ? buildQueryParams(params) : '';
      const url = queryString ? `/smart-shelves?${queryString}` : '/smart-shelves';

      const response = await apiClient.get<PaginatedResponse<SmartShelf>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single smart shelf by ID
   */
  async getShelf(id: string): Promise<SmartShelf> {
    try {
      const response = await apiClient.get<ApiResponse<SmartShelf>>(`/smart-shelves/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get medications on specific shelf
   */
  async getShelfMedications(shelfId: string): Promise<ShelfMedication[]> {
    try {
      const response = await apiClient.get<ApiResponse<ShelfMedication[]>>(`/smart-shelves/${shelfId}/medications`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update shelf inventory
   */
  async updateShelfInventory(shelfId: string, medications: ShelfInventoryUpdate[]): Promise<SmartShelf> {
    try {
      const response = await apiClient.put<ApiResponse<SmartShelf>>(
        `/smart-shelves/${shelfId}/inventory`,
        { medications }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get shelf sensor data
   */
  async getShelfSensors(shelfId: string): Promise<ShelfSensorData[]> {
    try {
      const response = await apiClient.get<ApiResponse<ShelfSensorData[]>>(`/smart-shelves/${shelfId}/sensors`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Calibrate smart shelf sensors
   */
  async calibrateShelf(shelfId: string): Promise<CalibrationResult> {
    try {
      const response = await apiClient.post<ApiResponse<CalibrationResult>>(`/smart-shelves/${shelfId}/calibrate`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get shelf alerts
   */
  async getShelfAlerts(shelfId?: string): Promise<ShelfAlert[]> {
    try {
      const params = shelfId ? { shelf_id: shelfId } : {};
      const queryString = buildQueryParams(params);
      const url = queryString ? `/smart-shelves/alerts?${queryString}` : '/smart-shelves/alerts';

      const response = await apiClient.get<ApiResponse<ShelfAlert[]>>(url);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Acknowledge shelf alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await apiClient.post(`/smart-shelves/alerts/${alertId}/acknowledge`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get shelf analytics
   */
  async getShelfAnalytics(shelfId: string, period: string = '30d'): Promise<ShelfAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<ShelfAnalytics>>(
        `/smart-shelves/${shelfId}/analytics?period=${period}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Sync shelf data with IoT devices
   */
  async syncShelfData(shelfId: string): Promise<SyncResult> {
    try {
      const response = await apiClient.post<ApiResponse<SyncResult>>(`/smart-shelves/${shelfId}/sync`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export the smart shelf service instance
export const smartShelfService = new SmartShelfService();
export default smartShelfService;
