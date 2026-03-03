/**
 * 告警 API
 */
import { api } from './client';

export interface Alert {
  id: number;
  device_id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  image_path?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AlertListParams {
  device_id?: number;
  is_read?: boolean;
  severity?: string;
  skip?: number;
  limit?: number;
}

export const alertsApi = {
  list: (params?: AlertListParams) =>
    api.get<Alert[]>('/api/v1/alerts/', params as Record<string, string | number>),

  create: (data: Partial<Alert>) =>
    api.post<Alert>('/api/v1/alerts/', data),

  markRead: (id: number) =>
    api.put<{ message: string }>(`/api/v1/alerts/${id}/read`),

  resolve: (id: number) =>
    api.put<{ message: string }>(`/api/v1/alerts/${id}/resolve`),
};
