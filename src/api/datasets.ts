/**
 * 数据集 + 标注 API
 * 对齐二牛后端接口（用 name 作为 id，不是数字）
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface Dataset {
  name: string;
  description?: string;
  labels: string[];       // 类别标签列表
  image_count: number;
  label_count: number;
}

export interface DatasetImage {
  filename: string;
  url: string;            // 可访问的图片 URL（含 API_BASE）
  has_labels: boolean;
}

export interface YoloLabel {
  class_id: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export const datasetsApi = {
  list: () => apiRequest<Dataset[]>('/api/v1/datasets/'),

  create: (name: string, description?: string, labels?: string[]) =>
    apiRequest<Dataset>('/api/v1/datasets/', {
      method: 'POST',
      body: JSON.stringify({ name, description, labels: labels ?? ['person', 'car', 'fire', 'knife'] }),
    }),

  listImages: (datasetName: string) =>
    apiRequest<{ dataset: string; images: DatasetImage[]; count: number }>(
      `/api/v1/datasets/${datasetName}/images`
    ),

  uploadImage: async (datasetName: string, file: File): Promise<DatasetImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/v1/datasets/${datasetName}/images`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getLabels: (datasetName: string, imgFilename: string) =>
    apiRequest<{ image: string; labels: YoloLabel[]; count: number }>(
      `/api/v1/datasets/${datasetName}/labels/${imgFilename}`
    ),

  saveLabels: (datasetName: string, imgFilename: string, labels: YoloLabel[]) =>
    apiRequest<{ message: string; count: number }>(
      `/api/v1/datasets/${datasetName}/labels/${imgFilename}`,
      { method: 'POST', body: JSON.stringify(labels) }
    ),
};
