import { useEffect, useRef, useState } from 'react';
import TrainingChart from './TrainingChart';

// 任务类型定义（不再依赖 mock）
export interface TrainingTask {
  id: string;
  name: string;
  datasetId: string;
  datasetName: string;
  baseModel: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'stopped';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  startTime: string;
  endTime?: string;
  duration: string;
  params: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    imgSize: number;
    optimizer: string;
    device: string;
  };
  metrics?: {
    mAP50: number;
    mAP5095: number;
    precision: number;
    recall: number;
    boxLoss: number;
    clsLoss: number;
  };
  logs: string[];
  lossHistory: { epoch: number; trainLoss: number; valLoss: number; mAP50: number }[];
}

interface TaskDetailPanelProps {
  task: TrainingTask;
  onStop: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const statusConfig = {
  running: { label: '训练中', className: 'text-blue-600 bg-blue-50' },
  completed: { label: '已完成', className: 'text-emerald-600 bg-emerald-50' },
  failed: { label: '失败', className: 'text-red-600 bg-red-50' },
  pending: { label: '等待中', className: 'text-gray-600 bg-gray-50' },
};

type TabKey = 'overview' | 'logs' | 'chart';

export default function TaskDetailPanel({ task, onStop, onDelete }: TaskDetailPanelProps) {
  const [tab, setTab] = useState<TabKey>('overview');
  const logRef = useRef<HTMLDivElement>(null);
  const cfg = statusConfig[task.status] ?? { label: task.status, color: 'text-gray-600', bg: 'bg-gray-100' };

  useEffect(() => {
    if (tab === 'logs' && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [tab, task.logs]);

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: '概览', icon: 'ri-dashboard-line' },
    { key: 'chart', label: '训练曲线', icon: 'ri-line-chart-line' },
    { key: 'logs', label: '训练日志', icon: 'ri-terminal-box-line' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#f0f1f3] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#f0f1f3]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold text-gray-900 truncate">{task.name}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{task.datasetName}</p>
          </div>
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${cfg.color} ${cfg.bg}`}>
            {task.status === 'running' && <i className="ri-loader-4-line animate-spin text-[11px]"></i>}
            {cfg.label}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-500">
              {task.status === 'queued' ? '等待 GPU 资源...' : `Epoch ${task.currentEpoch} / ${task.totalEpochs}`}
            </span>
            <span className="text-[12px] font-semibold text-gray-700">{task.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                task.status === 'running' ? 'bg-blue-400' : 
                task.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          {task.status === 'running' && (
            <button
              onClick={() => onStop(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-stop-circle-line text-[12px]"></i>
              停止训练
            </button>
          )}
          {(task.status === 'completed' || task.status === 'failed' || task.status === 'stopped') && (
            <button
              onClick={() => onDelete(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line text-[12px]"></i>
              删除任务
            </button>
          )}
          {task.status === 'completed' && (
            <>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-download-line text-[12px]"></i>
                best.pt
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-download-line text-[12px]"></i>
                last.pt
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#f0f1f3]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key
                ? 'text-[#0052d9] border-[#0052d9] font-medium'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <i className={`${t.icon} text-[12px]`}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Metrics */}
            {task.metrics && (
              <div>
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">最终指标</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'mAP50', value: (task.metrics.mAP50 * 100).toFixed(1) + '%', color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'mAP50-95', value: (task.metrics.mAP5095 * 100).toFixed(1) + '%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Precision', value: (task.metrics.precision * 100).toFixed(1) + '%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Recall', value: (task.metrics.recall * 100).toFixed(1) + '%', color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map(m => (
                    <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
                      <div className={`text-[18px] font-bold ${m.color}`}>{m.value}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Training Params */}
            <div>
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">训练参数</h3>
              <div className="bg-[#f8f9fa] rounded-xl p-3 space-y-2">
                {[
                  { label: '基础模型', value: task.baseModel },
                  { label: 'Epochs', value: task.params.epochs },
                  { label: 'Batch Size', value: task.params.batchSize },
                  { label: '学习率', value: task.params.learningRate },
                  { label: '图片尺寸', value: `${task.params.imgSize}px` },
                  { label: '优化器', value: task.params.optimizer },
                  { label: '设备', value: task.params.device },
                ].map(p => (
                  <div key={p.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{p.label}</span>
                    <span className="text-[11px] font-medium text-gray-700">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Info */}
            <div>
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">时间信息</h3>
              <div className="bg-[#f8f9fa] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">开始时间</span>
                  <span className="text-[11px] font-medium text-gray-700">{task.startTime}</span>
                </div>
                {task.endTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">结束时间</span>
                    <span className="text-[11px] font-medium text-gray-700">{task.endTime}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">耗时</span>
                  <span className="text-[11px] font-medium text-gray-700">{task.duration}</span>
                </div>
              </div>
            </div>

            {/* Weight files */}
            {task.status === 'completed' && (
              <div>
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">权重文件</h3>
                <div className="space-y-2">
                  {[
                    { name: 'best.pt', desc: '最佳验证集权重', size: '49.7 MB' },
                    { name: 'last.pt', desc: '最后一轮权重', size: '49.7 MB' },
                  ].map(f => (
                    <div key={f.name} className="flex items-center justify-between bg-[#f8f9fa] rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <i className="ri-file-3-line text-lg text-emerald-500"></i>
                        </div>
                        <div>
                          <p className="text-[11.5px] font-medium text-gray-700">{f.name}</p>
                          <p className="text-[10px] text-gray-400">{f.desc} · {f.size}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group flex items-center justify-center w-8 h-8">
                        <i className="ri-download-2-line text-gray-400 group-hover:text-emerald-500"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'chart' && (
          <div className="space-y-3">
            <div className="bg-[#f8f9fa] rounded-xl p-3">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Loss &amp; mAP 曲线</h3>
              <TrainingChart data={task.lossHistory} totalEpochs={task.totalEpochs} />
            </div>
            {task.metrics && (
              <div className="bg-[#f8f9fa] rounded-xl p-3">
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">混淆矩阵（模拟）</h3>
                <ConfusionMatrix />
              </div>
            )}
          </div>
        )}

        {tab === 'logs' && (
          <div
            ref={logRef}
            className="bg-gray-900 rounded-xl p-3 h-full min-h-[300px] overflow-y-auto font-mono"
          >
            {task.logs.map((line, i) => (
              <div
                key={i}
                className={`text-[10.5px] leading-5 ${
                  line.includes('ERROR')
                    ? 'text-red-400'
                    : line.includes('完成') || line.includes('已保存')
                    ? 'text-emerald-400'
                    : line.includes('初始化') || line.includes('加载')
                    ? 'text-amber-300'
                    : 'text-gray-300'
                }`}
              >
                {line}
              </div>
            ))}
            {task.status === 'running' && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-emerald-400 text-[10.5px] animate-pulse">▋</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfusionMatrix() {
  const classes = ['wrench', 'bolt', 'glove', 'helmet', 'hand', 'tool_box', 'engine', 'cable'];
  const matrix = [
    [312, 3, 1, 0, 2, 0, 1, 0],
    [2, 298, 0, 1, 0, 1, 0, 0],
    [1, 0, 287, 2, 3, 0, 0, 1],
    [0, 1, 2, 341, 0, 0, 1, 0],
    [3, 0, 4, 0, 276, 2, 0, 1],
    [0, 1, 0, 0, 1, 198, 2, 0],
    [1, 0, 0, 1, 0, 2, 223, 1],
    [0, 0, 1, 0, 1, 0, 1, 187],
  ];
  const maxVal = Math.max(...matrix.flat());

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex">
          <div className="w-14"></div>
          {classes.map(c => (
            <div key={c} className="w-10 text-center text-[8px] text-gray-400 truncate px-0.5">
              {c}
            </div>
          ))}
        </div>
        {matrix.map((row, ri) => (
          <div key={ri} className="flex items-center">
            <div className="w-14 text-[8px] text-gray-400 truncate pr-1 text-right">{classes[ri]}</div>
            {row.map((val, ci) => {
              const intensity = val / maxVal;
              const bg =
                ri === ci
                  ? `rgba(16,185,129,${0.2 + intensity * 0.7})`
                  : val > 0
                  ? `rgba(239,68,68,${intensity * 0.6})`
                  : 'transparent';
              return (
                <div
                  key={ci}
                  className="w-10 h-8 flex items-center justify-center text-[9px] font-medium rounded-sm m-px"
                  style={{ background: bg, color: intensity > 0.5 ? '#fff' : '#374151' }}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
