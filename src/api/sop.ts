import { api } from './client';

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
  list: () => api.get<Sop[]>('/api/v1/sop/'),
  get: (id: string) => api.get<Sop>(`/api/v1/sop/${id}`),
  create: (data: SopCreate) => api.post<Sop>('/api/v1/sop/', data),
  update: (id: string, data: Partial<Sop>) => api.put<Sop>(`/api/v1/sop/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/sop/${id}`),
};
