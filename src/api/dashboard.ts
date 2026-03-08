/**
 * Dashboard 统计 API
 */
import { api } from './client';

export interface DashboardData {
  devices: {
    total: number;
    online: number;
    offline: number;
    online_rate: number;
  };
  alerts: {
    total: number;
    unread: number;
    critical: number;
  };
  recent_alerts: {
    id: number;
    device_id: number;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    created_at: string;
  }[];
}

export const dashboardApi = {
  get: () => api.get<DashboardData>('/api/v1/dashboard'),
};
