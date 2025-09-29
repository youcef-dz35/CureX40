import { apiClient } from './api';

export interface HealthRecord {
  id: string;
  user_id: string;
  type: 'prescription' | 'lab_result' | 'imaging' | 'consultation' | 'vaccination' | 'other';
  title: string;
  description?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  metadata?: any;
  provider_id?: string;
  provider_name?: string;
  record_date: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthRecordData {
  type: 'prescription' | 'lab_result' | 'imaging' | 'consultation' | 'vaccination' | 'other';
  title: string;
  description?: string;
  provider_name?: string;
  record_date: string;
  file?: File;
}

export interface UpdateHealthRecordData {
  type?: 'prescription' | 'lab_result' | 'imaging' | 'consultation' | 'vaccination' | 'other';
  title?: string;
  description?: string;
  provider_name?: string;
  record_date?: string;
  file?: File;
}

class HealthRecordService {
  /**
   * Get all health records for the authenticated user
   */
  async getHealthRecords(params?: {
    page?: number;
    per_page?: number;
    type?: string;
  }): Promise<{ data: HealthRecord[]; meta: any }> {
    const response = await apiClient.get('/health-records', { params });
    return response.data;
  }

  /**
   * Create a new health record
   */
  async createHealthRecord(data: CreateHealthRecordData): Promise<HealthRecord> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('title', data.title);
    formData.append('record_date', data.record_date);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.provider_name) {
      formData.append('provider_name', data.provider_name);
    }
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiClient.post('/health-records', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  /**
   * Get a specific health record
   */
  async getHealthRecord(id: string): Promise<HealthRecord> {
    const response = await apiClient.get(`/health-records/${id}`);
    return response.data.data;
  }

  /**
   * Update a health record
   */
  async updateHealthRecord(id: string, data: UpdateHealthRecordData): Promise<HealthRecord> {
    const formData = new FormData();
    
    if (data.type) formData.append('type', data.type);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.provider_name) formData.append('provider_name', data.provider_name);
    if (data.record_date) formData.append('record_date', data.record_date);
    if (data.file) formData.append('file', data.file);

    const response = await apiClient.put(`/health-records/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  /**
   * Delete a health record
   */
  async deleteHealthRecord(id: string): Promise<void> {
    await apiClient.delete(`/health-records/${id}`);
  }

  /**
   * Download a health record file
   */
  async downloadHealthRecordFile(id: string): Promise<Blob> {
    const response = await apiClient.get(`/health-records/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const healthRecordService = new HealthRecordService();
