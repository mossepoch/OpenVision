import { useState } from 'react';
import { reportsStats } from '../../mocks/reportsData';
import ComplianceTrendChart from './components/ComplianceTrendChart';
import AlertDistributionChart from './components/AlertDistributionChart';
import StationRanking from './components/StationRanking';
import HourlyDistributionChart from './components/HourlyDistributionChart';
import TaskDetailTable from './components/TaskDetailTable';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const timeRangeOptions = [
    { key: 'today' as const, label: '今日' },
    { key: 'week' as const, label: '本周' },
    { key: 'month' as const, label: '本月' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 mb-1">统计报表</h1>
            <p className="text-[13px] text-gray-400">全面分析产线合规数据、异常趋势与工位绩效</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
              {timeRangeOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setTimeRange(opt.key)}
                  className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                    timeRange === opt.key
                      ? 'bg-[#7c3aed] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="h-9 px-4 text-[13px] text-white rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
            >
              <i className="ri-download-line text-[14px]"></i>
              导出报表
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: '完成任务',
            value: reportsStats.completedTasks,
            unit: `/ ${reportsStats.totalTasks}`,
            icon: 'ri-task-fill',
            color: 'text-violet-500',
            bg: 'bg-violet-50',
            sub: `+${reportsStats.tasksTrend} 较昨日`,
            subColor: 'text-emerald-500',
          },
          {
            label: '平均合规率',
            value: reportsStats.avgCompliance,
            unit: '%',
            icon: 'ri-shield-check-fill',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            sub: `+${reportsStats.complianceTrend}% 较昨日`,
            subColor: 'text-emerald-500',
          },
          {
            label: '异常告警',
            value: reportsStats.totalAlerts,
            unit: '',
            icon: 'ri-alarm-warning-fill',
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            sub: `${Math.abs(reportsStats.alertsTrend)}% 较昨日`,
            subColor: 'text-emerald-500',
          },
          {
            label: '平均用时',
            value: reportsStats.avgDuration,
            unit: 'min',
            icon: 'ri-timer-fill',
            color: 'text-cyan-500',
            bg: 'bg-cyan-50',
            sub: `${Math.abs(reportsStats.durationTrend)}min 较昨日`,
            subColor: 'text-emerald-500',
          },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-[20px]`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-gray-500 mb-1">{s.label}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-gray-900 leading-tight">{s.value}</span>
                {s.unit && <span className="text-[14px] text-gray-400">{s.unit}</span>}
              </div>
              <div className={`text-[12px] mt-1 flex items-center gap-0.5 ${s.subColor}`}>
                <i className="ri-arrow-up-s-line text-[13px]"></i>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Alert Distribution + Hourly Distribution */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <AlertDistributionChart />
        </div>
        <div className="col-span-3">
          <HourlyDistributionChart />
        </div>
      </div>

      {/* Charts Row 2: Station Ranking + Compliance Trend */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <StationRanking />
        </div>
        <div className="col-span-3">
          <ComplianceTrendChart />
        </div>
      </div>

      {/* Task Detail Table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-gray-800">任务明细</h2>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
            <input
              type="text"
              placeholder="搜索任务、工位或操作员..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 text-[13px] bg-[#f8f9fb] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] w-[280px] transition-all"
            />
          </div>
        </div>
        <TaskDetailTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}