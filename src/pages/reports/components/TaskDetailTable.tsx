import { useEffect, useMemo, useState } from 'react';
import { reportsApi, type DeviceStat, type ReportSummary } from '../../../api/reports';
import { stationsApi, type Station } from '../../../api/stations';

interface TaskDetailTableProps {
  searchQuery: string;
}

interface TableRow {
  id: string;
  taskId: string;
  taskName: string;
  station: string;
  operator: string;
  startTime: string;
  duration: string;
  compliance: number;
  status: 'completed' | 'running' | 'failed';
}

export default function TaskDetailTable({ searchQuery }: TaskDetailTableProps) {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.summary('today').catch((err) => {
        console.error('Failed to load report summary:', err);
        return null;
      }),
      reportsApi.deviceStats().catch((err) => {
        console.error('Failed to load device stats:', err);
        return [];
      }),
      stationsApi.list().catch((err) => {
        console.error('Failed to load stations:', err);
        return [];
      }),
    ]).then(([summaryData, statsData, stationData]) => {
      setSummary(summaryData as ReportSummary | null);
      setDeviceStats(statsData as DeviceStat[]);
      setStations(stationData as Station[]);
    }).finally(() => setLoading(false));
  }, []);

  const rows = useMemo<TableRow[]>(() => {
    if (stations.length === 0) return [];
    const alertMap = new Map(deviceStats.map(item => [item.device, item.alert_count]));
    return stations.map((station, index) => {
      const alerts = alertMap.get(station.name) ?? station.alert_count ?? 0;
      const compliance = station.compliance7d ?? summary?.compliance_rate ?? 0;
      return {
        id: `${station.id ?? station.name}`,
        taskId: `TASK-${String(index + 1).padStart(3, '0')}`,
        taskName: `${station.name} 巡检任务`,
        station: station.name,
        operator: '-',
        startTime: new Date().toLocaleString('zh-CN'),
        duration: '-',
        compliance,
        status: alerts > 5 ? 'failed' : alerts > 0 ? 'running' : 'completed',
      };
    });
  }, [stations, deviceStats, summary]);

  const filtered = rows.filter(t => {
    const q = searchQuery.toLowerCase();
    return t.taskName.toLowerCase().includes(q) ||
           t.station.toLowerCase().includes(q) ||
           t.operator.toLowerCase().includes(q) ||
           t.id.toLowerCase().includes(q);
  });

  const statusConfig = {
    completed: {
      label: '已完成',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: 'ri-checkbox-circle-fill'
    },
    running: {
      label: '进行中',
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      icon: 'ri-play-circle-fill'
    },
    failed: {
      label: '失败',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: 'ri-close-circle-fill'
    },
  } as const;

  if (loading) {
    return <div className="py-10 text-center text-[12px] text-gray-400"><i className="ri-loader-4-line animate-spin text-[18px] mr-2"></i>加载中...</div>;
  }

  if (filtered.length === 0) {
    return <div className="py-10 text-center text-[12px] text-gray-400">暂无任务明细</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f8f9fb] border-b border-gray-100">
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">任务名称</th>
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">工位</th>
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">操作员</th>
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">开始时间</th>
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">用时</th>
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">合规率</th>
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">状态</th>
            <th className="text-center py-3 px-4 text-[12px] font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((task) => {
            const config = statusConfig[task.status];
            return (
              <tr
                key={task.id}
                className="border-b border-gray-50 hover:bg-[#f4f3ff] transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <i className="ri-file-list-3-line text-white text-[14px]"></i>
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-gray-900">{task.taskName}</div>
                      <div className="text-[11px] text-gray-400">{task.taskId}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4"><span className="text-[13px] text-gray-600">{task.station}</span></td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-medium text-white">{task.operator.charAt(0) || '-'}</span>
                    </div>
                    <span className="text-[13px] text-gray-600">{task.operator}</span>
                  </div>
                </td>
                <td className="py-3 px-4"><span className="text-[12px] text-gray-500">{task.startTime}</span></td>
                <td className="py-3 px-4"><span className="text-[13px] text-gray-600">{task.duration}</span></td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[60px]">
                      <div
                        className={`h-full rounded-full ${
                          task.compliance >= 95 ? 'bg-emerald-500' :
                          task.compliance >= 85 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${task.compliance}%` }}
                      ></div>
                    </div>
                    <span className="text-[12px] font-medium text-gray-600">{task.compliance}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border ${config.color}`}>
                    <i className={`${config.icon} text-[12px]`}></i>
                    {config.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-colors cursor-pointer" title="查看详情">
                      <i className="ri-eye-line text-[14px]"></i>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer" title="下载报告">
                      <i className="ri-download-line text-[14px]"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between py-4 px-4 border-t border-gray-100">
        <div className="text-[12px] text-gray-500">显示 {filtered.length} 条记录</div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"><i className="ri-arrow-left-s-line text-[16px]"></i></button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#7c3aed] text-white font-medium text-[12px] cursor-pointer">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"><i className="ri-arrow-right-s-line text-[16px]"></i></button>
        </div>
      </div>
    </div>
  );
}
