import apiClient from './client';

export interface ReportSummary {
  range: string;
  total: number;
  resolved: number;
  pending: number;
  unread: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  hourly: Record<string, number>;
  compliance_rate: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface DeviceStat {
  device: string;
  alert_count: number;
}

export const reportsApi = {
  summary: (range: 'today' | 'week' | 'month' = 'today') =>
    apiClient.get<ReportSummary>(`/reports/summary?range=${range}`).then(r => r.data),
  trend: (days = 7) =>
    apiClient.get<TrendPoint[]>(`/reports/trend?days=${days}`).then(r => r.data),
  deviceStats: () =>
    apiClient.get<DeviceStat[]>('/reports/device-stats').then(r => r.data),
};
