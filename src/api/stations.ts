import apiClient from './client';

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
}

export interface StationCreate {
  name: string;
  location: string;
  detection_mode?: string;
  sop_name?: string;
  camera_ids?: number[];
  description?: string;
}

export const stationsApi = {
  list: () => apiClient.get<Station[]>('/stations/').then(r => r.data),
  get: (id: string) => apiClient.get<Station>(`/stations/${id}`).then(r => r.data),
  create: (data: StationCreate) => apiClient.post<Station>('/stations/', data).then(r => r.data),
  update: (id: string, data: Partial<Station>) => apiClient.put<Station>(`/stations/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/stations/${id}`).then(r => r.data),
};
