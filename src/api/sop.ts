import apiClient from './client';

export interface Sop {
  id: string;
  name: string;
  description: string;
  mode: string;
  output_granularity: string;
  steps: any[];
  status: string;
  created_at: string;
}

export interface SopCreate {
  name: string;
  description?: string;
  mode?: string;
  output_granularity?: string;
  steps?: any[];
}

export const sopApi = {
  list: () => apiClient.get<Sop[]>('/sop/').then(r => r.data),
  get: (id: string) => apiClient.get<Sop>(`/sop/${id}`).then(r => r.data),
  create: (data: SopCreate) => apiClient.post<Sop>('/sop/', data).then(r => r.data),
  update: (id: string, data: Partial<Sop>) => apiClient.put<Sop>(`/sop/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/sop/${id}`).then(r => r.data),
};
