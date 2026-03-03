/**
 * 数据集 + 标注 API
 */
import { api } from './client';

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  image_count: number;
  labeled_count: number;
  created_at: string;
}

export interface DatasetImage {
  id: string;          // 文件名（无扩展名）或 UUID
  filename: string;
  url: string;         // 可访问的图片 URL
  label_count: number;
  created_at?: string;
}

export interface YoloLabel {
  class_id: number;
  cx: number;   // 中心 x（归一化 0-1）
  cy: number;   // 中心 y（归一化 0-1）
  w: number;    // 宽（归一化）
  h: number;    // 高（归一化）
}

export const datasetsApi = {
  list: () => api.get<Dataset[]>('/api/v1/datasets/'),

  create: (name: string, description?: string) =>
    api.post<Dataset>('/api/v1/datasets/', { name, description }),

  uploadImage: (datasetId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token');
    return fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/datasets/${datasetId}/images`,
      { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }
    ).then(r => r.json()) as Promise<DatasetImage>;
  },

  listImages: (datasetId: number) =>
    api.get<DatasetImage[]>(`/api/v1/datasets/${datasetId}/images`),

  getLabels: (datasetId: number, imgId: string) =>
    api.get<YoloLabel[]>(`/api/v1/datasets/${datasetId}/images/${imgId}/labels`),

  saveLabels: (datasetId: number, imgId: string, labels: YoloLabel[]) =>
    api.post<{ message: string }>(`/api/v1/datasets/${datasetId}/images/${imgId}/labels`, labels),
};
