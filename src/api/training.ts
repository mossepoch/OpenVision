/**
 * 模型训练 API
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  const base = { 'Content-Type': 'application/json' };
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(), ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface TrainingJob {
  job_id: string;
  dataset: string;
  model_base: string;
  epochs: number;
  status: 'pending' | 'running' | 'done' | 'error';
  progress: number;   // 0-100
  message: string;
  started_at: number;
  finished_at: number | null;
  output_model: string | null;
}

export interface TrainedModel {
  name: string;
  path: string;
  size_mb: number;
  created_at: number;
}

export interface TrainParams {
  dataset_name: string;
  epochs?: number;
  imgsz?: number;
  batch?: number;
  model_base?: string;
}

export const trainingApi = {
  startTrain: (params: TrainParams) =>
    req<TrainingJob>('/api/v1/training/train', {
      method: 'POST',
      body: JSON.stringify({ epochs: 10, imgsz: 640, batch: 16, model_base: 'yolov8n.pt', ...params }),
    }),

  listJobs: () => req<TrainingJob[]>('/api/v1/training/jobs'),

  getJob: (jobId: string) => req<TrainingJob>(`/api/v1/training/jobs/${jobId}`),

  listModels: () => req<TrainedModel[]>('/api/v1/training/models'),
};
