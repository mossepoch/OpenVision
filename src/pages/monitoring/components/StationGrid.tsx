
import { useState } from 'react';
import { stationsMonitoring } from '../../../mocks/monitoringData';

type StationGridProps = {
  onSelectStation: (id: string) => void;
};

export default function StationGrid({ onSelectStation }: StationGridProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filtered = stationsMonitoring.filter((s) => {
    const matchSearch = s.name.includes(searchText) || s.location.includes(searchText);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: stationsMonitoring.length,
    running: stationsMonitoring.filter((s) => s.status === 'running').length,
    idle: stationsMonitoring.filter((s) => s.status === 'idle').length,
    alert: stationsMonitoring.filter((s) => s.status === 'alert').length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fb]">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">实时监控</h1>
            <p className="text-[13px] text-gray-500">查看所有工位的实时作业状态与视频流</p>
          </div>
          <button
            className="px-4 py-2 text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
          >
            <i className="ri-refresh-line text-[16px]"></i>
            刷新状态
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '全部工位', value: stats.total, icon: 'ri-layout-grid-line', color: '#7c3aed' },
            { label: '作业中', value: stats.running, icon: 'ri-play-circle-line', color: '#10b981' },
            { label: '空闲', value: stats.idle, icon: 'ri-pause-circle-line', color: '#6b7280' },
            { label: '异常', value: stats.alert, icon: 'ri-error-warning-line', color: '#ef4444' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}15` }}
              >
                <i className={`${item.icon} text-[20px]`} style={{ color: item.color }}></i>
              </div>
              <div>
                <div className="text-[24px] font-bold text-gray-900">{item.value}</div>
                <div className="text-[12px] text-gray-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索工位名称或位置..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer bg-white"
            >
              <option value="all">全部状态</option>
              <option value="running">作业中</option>
              <option value="idle">空闲</option>
              <option value="alert">异常</option>
            </select>
            <span className="text-[13px] text-gray-500 whitespace-nowrap">
              共 {filtered.length} 个工位
            </span>
          </div>
        </div>

        {/* Station Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((station) => (
              <div
                key={station.id}
                onClick={() => onSelectStation(station.id)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={station.videoPreview}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm ${
                        station.status === 'running'
                          ? 'bg-emerald-500/90 text-white'
                          : station.status === 'alert'
                          ? 'bg-red-500/90 text-white'
                          : 'bg-gray-500/90 text-white'
                      }`}
                    >
                      {station.status === 'running' ? '作业中' : station.status === 'alert' ? '异常' : '空闲'}
                    </span>
                  </div>
                  {/* Live Indicator */}
                  {station.status === 'running' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span className="text-[11px] font-medium text-white">LIVE</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <i className="ri-eye-line text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900 mb-0.5">{station.name}</h3>
                      <p className="text-[12px] text-gray-500">{station.location}</p>
                    </div>
                  </div>

                  {/* Current Task */}
                  {station.currentTask && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <i className="ri-play-circle-fill text-purple-600 text-[14px]"></i>
                        <span className="text-[12px] font-medium text-purple-900">当前任务</span>
                      </div>
                      <div className="text-[13px] text-gray-900 font-medium mb-1">{station.currentTask.name}</div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>步骤 {station.currentTask.currentStep}/{station.currentTask.totalSteps}</span>
                        <span>{station.currentTask.operator}</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-[16px] font-bold text-purple-600">{station.todayTasks}</div>
                      <div className="text-[11px] text-gray-500">今日任务</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[16px] font-bold text-gray-900">{station.compliance}%</div>
                      <div className="text-[11px] text-gray-500">合规率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[16px] font-bold text-orange-500">{station.alerts}</div>
                      <div className="text-[11px] text-gray-500">异常数</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
            <i className="ri-inbox-line text-[56px] mb-4"></i>
            <p className="text-[15px] font-medium">没有找到匹配的工位</p>
            <p className="text-[13px] mt-1">尝试修改搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
