import { useState, useEffect } from 'react';
import { dashboardData } from '../../mocks/dashboardData';
import { complianceTrendData, alertDistribution, stationPerformance, hourlyDistribution } from '../../mocks/reportsData';
import RunningTasksSection from './components/RunningTasksSection';
import RecentAlertsSection from './components/RecentAlertsSection';
import MiniComplianceChart from './components/MiniComplianceChart';
import MiniAlertChart from './components/MiniAlertChart';
import StationRankingSection from './components/StationRankingSection';
import { dashboardApi, type DashboardData } from '../../api/dashboard';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [apiData, setApiData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(setApiData)
      .catch(() => setApiData(null))
      .finally(() => setLoading(false));
  }, []);

  // 优先用后端数据，降级到 mock
  const stats = apiData
    ? {
        onlineDevices: apiData.devices.online,
        totalDevices: apiData.devices.total,
        runningTasks: dashboardData.stats.runningTasks, // 后端还没这个，暂时 mock
        pendingAlerts: apiData.alerts.unread,
        avgCompliance: dashboardData.stats.avgCompliance, // 后端还没这个，暂时 mock
      }
    : dashboardData.stats;

  // 告警列表：优先后端数据，降级到 mock
  const recentAlerts = apiData?.recent_alerts?.length
    ? apiData.recent_alerts.map(a => ({
        id: String(a.id),
        type: a.severity === 'critical' || a.severity === 'high' ? 'error' : 'warning',
        level: a.severity,
        title: a.alert_type,
        description: a.message,
        time: new Date(a.created_at).toLocaleString('zh-CN'),
        station: `设备-${a.device_id}`,
      }))
    : dashboardData.recentAlerts;

  const timeRangeOptions = [
    { key: 'today' as const, label: '今日' },
    { key: 'week' as const, label: '本周' },
    { key: 'month' as const, label: '本月' },
  ];

  const statCards = [
    {
      label: '在线工位',
      value: stats.onlineDevices,
      total: stats.totalDevices,
      icon: 'ri-computer-line',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      trend: 5.2,
      trendUp: true,
    },
    {
      label: '运行任务',
      value: stats.runningTasks,
      total: null,
      icon: 'ri-play-circle-line',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      trend: 8.1,
      trendUp: true,
    },
    {
      label: '今日告警',
      value: stats.pendingAlerts,
      total: null,
      icon: 'ri-alarm-warning-line',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      trend: 3.4,
      trendUp: false,
    },
    {
      label: '平均合规率',
      value: stats.avgCompliance,
      total: null,
      icon: 'ri-shield-check-line',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      trend: 2.3,
      trendUp: true,
    },
  ];

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 mb-0.5">工作台</h1>
          <p className="text-[13px] text-gray-400">实时掌握产线运行状态、合规趋势与异常分布</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
            {timeRangeOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setTimeRange(opt.key)}
                className={`px-3 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                  timeRange === opt.key
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setLoading(true); dashboardApi.get().then(setApiData).catch(() => {}).finally(() => setLoading(false)); }}
            className="h-9 px-3 text-[13px] text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            刷新
          </button>
          <button className="h-9 px-3 text-[13px] text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-sm">
            导出报告
          </button>
        </div>
      </div>

      {/* 加载提示 */}
      {loading && (
        <div className="text-center text-[13px] text-gray-400 py-2">数据加载中...</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.color} text-[20px]`}></i>
              </div>
              <div className={`flex items-center gap-1 text-[12px] font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-orange-500'}`}>
                <i className={`${stat.trendUp ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-[14px]`}></i>
                {stat.trend}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[13px] font-medium text-gray-500">{stat.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-bold text-gray-900 leading-tight">
                  {stat.total !== null ? stat.value : `${stat.value}%`}
                </span>
                {stat.total !== null && (
                  <span className="text-[14px] text-gray-400">/ {stat.total}</span>
                )}
              </div>
              {stat.total !== null && (
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stat.value / stat.total) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2" style={{ height: 220 }}>
          <MiniComplianceChart data={complianceTrendData} hourlyData={hourlyDistribution} />
        </div>
        <div style={{ height: 220 }}>
          <MiniAlertChart data={alertDistribution} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4 items-stretch">
        <div className="col-span-3">
          <RunningTasksSection tasks={dashboardData.runningTasks} />
        </div>
        <div className="col-span-2 flex flex-col">
          <RecentAlertsSection alerts={recentAlerts} />
        </div>
      </div>

      {/* Station Ranking */}
      <div style={{ height: 240 }}>
        <StationRankingSection data={stationPerformance} />
      </div>
    </div>
  );
}
