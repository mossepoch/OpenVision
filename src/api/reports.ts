const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

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
    req<ReportSummary>(`/reports/summary?range=${range}`),
  trend: (days = 7) =>
    req<TrendPoint[]>(`/reports/trend?days=${days}`),
  deviceStats: () =>
    req<DeviceStat[]>('/reports/device-stats'),
};
