/**
 * 设备管理 API
 */
import { api } from './client';

export interface Device {
  id: number;
  name: string;
  protocol: 'rtsp' | 'onvif' | 'http-flv' | 'gb28181';
  url: string;
  username?: string;
  password?: string;
  location?: string;
  status: string;
  detection_enabled: boolean;
  model_id?: number;
  confidence_threshold: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceCreate {
  name: string;
  protocol: string;
  url: string;
  username?: string;
  password?: string;
  location?: string;
  detection_enabled?: boolean;
  model_id?: number;
  confidence_threshold?: number;
}

export interface DeviceUpdate {
  name?: string;
  url?: string;
  username?: string;
  password?: string;
  location?: string;
  status?: string;
  detection_enabled?: boolean;
  model_id?: number;
  confidence_threshold?: number;
}

export const devicesApi = {
  list: (skip = 0, limit = 100) =>
    api.get<Device[]>('/api/v1/devices', { skip, limit }),

  get: (id: number) =>
    api.get<Device>(`/api/v1/devices/${id}`),

  create: (data: DeviceCreate) =>
    api.post<Device>('/api/v1/devices', data),

  update: (id: number, data: DeviceUpdate) =>
    api.put<Device>(`/api/v1/devices/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/api/v1/devices/${id}`),
};
