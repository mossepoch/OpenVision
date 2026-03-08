const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface Station {
  id: string;
  name: string;
  location: string;
  detection_mode: string;
  sop_name: string;
  camera_ids: number[];
  description: string;
  status: string;
  alert_count: number;
  compliance7d?: number;
  totalTasks?: number;
  sopName?: string;
  cvModelName?: string;
  sopId?: string;
  cvModelId?: string;
  cameras?: number[];
  detectionMode?: string;
}

export const stationsApi = {
  list: () => req<Station[]>('/stations/'),
  get: (id: string) => req<Station>(`/stations/${id}`),
  create: (data: Partial<Station>) =>
    req<Station>('/stations/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Station>) =>
    req<Station>(`/stations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    req<{ message: string }>(`/stations/${id}`, { method: 'DELETE' }),
};
