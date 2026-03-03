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
  status: 'active' | 'resolved' | 'acknowledged';
  image_path?: string;
  created_at: string;
  resolved_at?: string;
}

export const alertsApi = {
  list: (skip = 0, limit = 50) =>
    api.get<Alert[]>('/api/v1/alerts', { skip, limit }),

  get: (id: number) =>
    api.get<Alert>(`/api/v1/alerts/${id}`),

  create: (data: Partial<Alert>) =>
    api.post<Alert>('/api/v1/alerts', data),
};
