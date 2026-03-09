import { useState, useEffect, useCallback } from 'react';
import { trainingApi, type TrainingJob, type TrainedModel } from '../../api/training';
import { datasetsApi, type Dataset } from '../../api/datasets';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '等待中', color: 'text-gray-500',   bg: 'bg-gray-100' },
  running: { label: '训练中', color: 'text-blue-600',   bg: 'bg-blue-50' },
  done:    { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  error:   { label: '失败',   color: 'text-red-500',    bg: 'bg-red-50' },
};

export default function TrainingPage() {
  // 数据集列表
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  // 训练参数
  const [params, setParams] = useState({
    dataset_name: '',
    epochs: 10,
    imgsz: 640,
    batch: 16,
    model_base: 'yolov8n.pt',
  });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  // 任务列表
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // 加载数据集
  useEffect(() => {
    datasetsApi.list().then(ds => {
      setDatasets(ds);
      if (ds.length > 0 && !params.dataset_name) {
        setParams(p => ({ ...p, dataset_name: ds[0].name }));
      }
    }).catch(() => {});
  }, []);

  // 加载任务列表 + 模型
  const fetchJobs = useCallback(() => {
    trainingApi.listJobs().then(setJobs).catch(() => {});
    trainingApi.listModels().then(setModels).catch(() => {});
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // 轮询活跃任务进度（5s）
  useEffect(() => {
    if (!activeJobId) return;
    const timer = setInterval(() => {
      trainingApi.getJob(activeJobId).then(job => {
        setJobs(prev => prev.map(j => j.job_id === job.job_id ? job : j));
        if (job.status === 'done' || job.status === 'error') {
          setActiveJobId(null);
          trainingApi.listModels().then(setModels).catch(() => {});
        }
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [activeJobId]);

  const handleStart = async () => {
    if (!params.dataset_name) { setStartError('请选择数据集'); return; }
    setStarting(true);
    setStartError('');
    try {
      const job = await trainingApi.startTrain(params);
      setJobs(prev => [job, ...prev]);
      setActiveJobId(job.job_id);
    } catch (e: unknown) {
      setStartError(e instanceof Error ? e.message : '启动失败');
    } finally {
      setStarting(false);
    }
  };

  const activeJob = jobs.find(j => j.job_id === activeJobId) ?? jobs.find(j => j.status === 'running');

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-[20px] font-bold text-gray-900 mb-1">模型训练</h1>
        <p className="text-[13px] text-gray-400">基于标注数据集训练自定义 YOLO 检测模型</p>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* 左侧：训练配置 */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-[14px] font-bold text-gray-800 mb-4">训练配置</h2>
            <div className="space-y-3">
              {/* 数据集 */}
              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">数据集</label>
                <select
                  value={params.dataset_name}
                  onChange={e => setParams(p => ({ ...p, dataset_name: e.target.value }))}
                  className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 cursor-pointer"
                >
                  <option value="">— 选择数据集 —</option>
                  {datasets.map(d => (
                    <option key={d.name} value={d.name}>{d.name}（{d.image_count} 张）</option>
                  ))}
                </select>
              </div>

              {/* 基础模型 */}
              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">基础模型</label>
                <select
                  value={params.model_base}
                  onChange={e => setParams(p => ({ ...p, model_base: e.target.value }))}
                  className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 cursor-pointer"
                >
                  <option value="yolov8n.pt">YOLOv8n（最快，精度低）</option>
                  <option value="yolov8s.pt">YOLOv8s（均衡）</option>
                  <option value="yolov8m.pt">YOLOv8m（精度高，较慢）</option>
                </select>
              </div>

              {/* Epochs */}
              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">训练轮数 (epochs)</label>
                <input type="number" min={1} max={300} value={params.epochs}
                  onChange={e => setParams(p => ({ ...p, epochs: Number(e.target.value) }))}
                  className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400"
                />
                <p className="text-[11px] text-gray-400 mt-1">推荐 10-100，越多越准但越慢</p>
              </div>

              {/* imgsz */}
              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">图像尺寸 (imgsz)</label>
                <select value={params.imgsz}
                  onChange={e => setParams(p => ({ ...p, imgsz: Number(e.target.value) }))}
                  className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 cursor-pointer"
                >
                  <option value={320}>320（快）</option>
                  <option value={640}>640（推荐）</option>
                  <option value={1280}>1280（高精度，慢）</option>
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">批大小 (batch)</label>
                <input type="number" min={1} max={64} value={params.batch}
                  onChange={e => setParams(p => ({ ...p, batch: Number(e.target.value) }))}
                  className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400"
                />
              </div>

              {startError && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-[12px] text-red-500">
                  ⚠ {startError}
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={starting || !!activeJob}
                className="w-full h-10 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
              >
                {starting ? '启动中...' : activeJob ? '训练进行中...' : '🚀 开始训练'}
              </button>
            </div>
          </div>

          {/* 已训练模型 */}
          {models.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-[14px] font-bold text-gray-800 mb-3">已训练模型</h2>
              <div className="space-y-2">
                {models.map(m => (
                  <div key={m.name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-[12px] font-medium text-gray-700">{m.name}</div>
                      <div className="text-[11px] text-gray-400">{m.size_mb != null ? `${m.size_mb.toFixed(1)} MB` : '未知大小'}</div>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {(m as any).created_at ? new Date((m as any).created_at * 1000).toLocaleDateString('zh-CN') : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：进度 + 历史 */}
        <div className="col-span-3 space-y-4">
          {/* 当前任务进度 */}
          {activeJob && (
            <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-800">训练进度</h2>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_MAP[activeJob.status]?.bg} ${STATUS_MAP[activeJob.status]?.color}`}>
                  {STATUS_MAP[activeJob.status]?.label}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-[12px] text-gray-500 mb-1.5">
                  <span>{activeJob.message}</span>
                  <span className="font-semibold text-violet-600">{activeJob.progress.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${activeJob.progress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[12px]">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-gray-400 mb-0.5">数据集</div>
                  <div className="font-medium text-gray-700">{activeJob.dataset}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-gray-400 mb-0.5">轮数</div>
                  <div className="font-medium text-gray-700">{activeJob.epochs}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-gray-400 mb-0.5">基础模型</div>
                  <div className="font-medium text-gray-700">{activeJob.model_base}</div>
                </div>
              </div>
            </div>
          )}

          {/* 任务历史 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[14px] font-bold text-gray-800">任务历史</h2>
              <button onClick={fetchJobs} className="text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer">刷新</button>
            </div>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <i className="ri-history-line text-[40px] mb-3"></i>
                <p className="text-[13px]">暂无训练任务</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['任务 ID', '数据集', '轮数', '进度', '状态', '时间'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => {
                    const s = STATUS_MAP[job.status] ?? STATUS_MAP.pending;
                    return (
                      <tr key={job.job_id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => job.status === 'running' && setActiveJobId(job.job_id)}
                      >
                        <td className="px-4 py-3 text-[12px] font-mono text-gray-400">{job.job_id.slice(-8)}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{job.dataset}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{job.epochs}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${job.progress}%` }} />
                            </div>
                            <span className="text-[11px] text-gray-400 w-8">{job.progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.color}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(job.started_at * 1000).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
