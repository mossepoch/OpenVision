import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  station: string;
  status: string;
  compliance: number;
  currentStep: string;
  progress: number;
  operator: string;
}

interface Props {
  tasks: Task[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; text: string }> = {
  running: {
    label: '运行中',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: 'ri-play-circle-fill',
    text: 'text-emerald-600',
  },
  '运行中': {
    label: '运行中',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: 'ri-play-circle-fill',
    text: 'text-emerald-600',
  },
  completed: {
    label: '已完成',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: 'ri-checkbox-circle-fill',
    text: 'text-emerald-600',
  },
  '已完成': {
    label: '已完成',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: 'ri-checkbox-circle-fill',
    text: 'text-emerald-600',
  },
  pending: {
    label: '待执行',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    icon: 'ri-time-line',
    text: 'text-gray-500',
  },
  '待执行': {
    label: '待执行',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    icon: 'ri-time-line',
    text: 'text-gray-500',
  },
  error: {
    label: '异常',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: 'ri-error-warning-fill',
    text: 'text-orange-600',
  },
  warning: {
    label: '异常',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: 'ri-error-warning-fill',
    text: 'text-orange-600',
  },
  '异常': {
    label: '异常',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: 'ri-error-warning-fill',
    text: 'text-orange-600',
  },
};

const OPERATOR_COLORS = ['#7c3aed', '#10b981', '#f97316', '#06b6d4', '#e11d48'];

function OperatorAvatar({ name, index }: { name: string; index: number }) {
  const color = OPERATOR_COLORS[index % OPERATOR_COLORS.length];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 1)}
    </div>
  );
}

export default function RunningTasksSection({ tasks }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.ceil(tasks.length / pageSize) || 1;
  const paginated = tasks.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">运行中任务</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">实时任务</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-calendar-line text-[13px]"></i>
            选择日期
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-equalizer-line text-[13px]"></i>
            筛选
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] text-white font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            查看更多
            <i className="ri-arrow-right-s-line text-[14px]"></i>
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-400">任务名称</th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-400">状态</th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-400">操作员</th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-400">
              <div className="flex items-center gap-1 cursor-pointer select-none">
                进度
                <i className="ri-arrow-down-s-fill text-[13px] text-gray-400"></i>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-400">合规率</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((task, idx) => {
            const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG['运行中'];
            return (
              <tr
                key={task.id}
                className={`hover:bg-[#f4f3ff]/30 transition-colors cursor-pointer ${
                  idx < paginated.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                {/* Name */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#f4f3ff] flex items-center justify-center flex-shrink-0">
                      <i className="ri-settings-3-line text-[#7c3aed] text-[14px]"></i>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-900 leading-tight">{task.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{task.station}</div>
                    </div>
                  </div>
                </td>

                {/* Status badge */}
                <td className="px-4 py-3.5">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </td>

                {/* Operator */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <OperatorAvatar name={task.operator} index={idx} />
                    <div>
                      <div className="text-[13px] font-medium text-gray-800">{task.operator}</div>
                      <div className="text-[11px] text-gray-400">{task.currentStep.split(':')[0]}</div>
                    </div>
                  </div>
                </td>

                {/* Progress */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-[72px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${task.progress}%`, background: 'linear-gradient(to right, #7c3aed, #a78bfa)' }}
                      />
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">{task.progress}%</span>
                  </div>
                </td>

                {/* Compliance */}
                <td className="px-4 py-3.5">
                  <span className={`text-[13px] font-bold ${
                    task.compliance >= 95 ? 'text-emerald-600' :
                    task.compliance >= 90 ? 'text-[#7c3aed]' : 'text-orange-500'
                  }`}>
                    {task.compliance}%
                  </span>
                </td>

                {/* More */}
                <td className="px-4 py-3.5">
                  <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                    <i className="ri-more-2-fill text-gray-400 text-[14px]"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
        <span className="text-[12px] text-gray-400">显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, tasks.length)} 共 {tasks.length} 条</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <i className="ri-arrow-left-s-line text-[14px]"></i>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                p === page
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
              style={p === page ? { background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' } : {}}
            >
              {p}
            </button>
          ))}
          {totalPages > 3 && page < totalPages - 1 && (
            <span className="text-[12px] text-gray-400 px-1">...</span>
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <i className="ri-arrow-right-s-line text-[14px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
