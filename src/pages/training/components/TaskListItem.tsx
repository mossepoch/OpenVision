import { TrainingTask } from '../../../mocks/trainingData';

type TaskStatus = keyof typeof statusConfig;

const statusConfig = {
  queued: {
    label: '排队中',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    icon: 'ri-time-line',
  },
  running: {
    label: '训练中',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-400',
    icon: 'ri-loader-4-line',
  },
  completed: {
    label: '已完成',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-400',
    icon: 'ri-checkbox-circle-line',
  },
  failed: {
    label: '失败',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-400',
    icon: 'ri-close-circle-line',
  },
  stopped: {
    label: '已停止',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    icon: 'ri-stop-circle-line',
  },
} as const;

interface TaskListItemProps {
  task: TrainingTask & { status: TaskStatus };
  isSelected: boolean;
  onSelect: (task: TrainingTask) => void;
  onStop: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskListItem({
  task,
  isSelected,
  onSelect,
  onStop,
  onDelete,
}: TaskListItemProps) {
  const cfg = statusConfig[task.status] ?? {
    label: task.status,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    icon: '',
  };

  const progressColor =
    task.status === 'failed'
      ? 'bg-red-400'
      : task.status === 'completed'
      ? 'bg-emerald-500'
      : task.status === 'running'
      ? 'bg-purple-600'
      : 'bg-gray-300';

  return (
    <div
      onClick={() => onSelect(task)}
      className={`rounded-xl border cursor-pointer transition-all duration-150 overflow-hidden ${
        isSelected
          ? 'border-purple-300 shadow-md bg-white ring-2 ring-purple-100'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="p-3">
        {/* 第一行：任务名 + 状态徽标 */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 truncate leading-snug">
              {task.name}
            </p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
              <i className="ri-database-2-line text-[10px]"></i>
              {task.datasetName}
            </p>
          </div>

          <span
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-medium whitespace-nowrap border
              ${cfg.color} ${cfg.bg} ${cfg.border}
            `}
          >
            <i
              className={`${cfg.icon} text-[10px] ${task.status === 'running' ? 'animate-spin' : ''}`}
            ></i>
            {cfg.label}
          </span>
        </div>

        {/* 进度区域 */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] text-gray-400">
              {task.status === 'queued'
                ? '等待 GPU 资源'
                : `Epoch ${task.currentEpoch} / ${task.totalEpochs}`}
            </span>
            <span
              className={`text-[11px] font-bold tabular-nums ${
                task.status === 'completed'
                  ? 'text-emerald-500'
                  : task.status === 'failed'
                  ? 'text-red-400'
                  : 'text-gray-600'
              }`}
            >
              {task.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* 底部：元信息 + 操作按钮 */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-[10.5px] text-gray-400">
              <i className="ri-cpu-line text-[10px] text-gray-300"></i>
              {task.baseModel}
            </span>
            <span className="w-px h-3 bg-gray-200"></span>
            <span className="flex items-center gap-1 text-[10.5px] text-gray-400">
              <i className="ri-time-line text-[10px] text-gray-300"></i>
              {task.duration}
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {task.status === 'running' && (
              <button
                onClick={() => onStop(task.id)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                title="停止训练"
              >
                <i className="ri-stop-line text-[12px]"></i>
              </button>
            )}
            {(task.status === 'completed' ||
              task.status === 'failed' ||
              task.status === 'stopped') && (
              <button
                onClick={() => onDelete(task.id)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                title="删除任务"
              >
                <i className="ri-delete-bin-line text-[12px]"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}