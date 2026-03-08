import { useState, useEffect } from 'react';
import { devicesApi, type Device } from '../../../api/devices';

type StationGridProps = {
  onSelectStation: (id: string) => void;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function StationGrid({ onSelectStation }: StationGridProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    devicesApi.list()
      .then(setDevices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = devices.filter(d => {
    const matchSearch = d.name.includes(searchText) || (d.location ?? '').includes(searchText);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    alert: devices.filter(d => d.status === 'alert').length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fb]">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">实时监控</h1>
            <p className="text-[13px] text-gray-500">查看所有摄像头设备的实时视频流</p>
          </div>
          <button
            onClick={() => { setLoading(true); devicesApi.list().then(setDevices).finally(() => setLoading(false)); }}
            className="px-4 py-2 text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
          >
            刷新状态
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '全部设备', value: stats.total, icon: 'ri-camera-fill', color: '#7c3aed' },
            { label: '在线', value: stats.online, icon: 'ri-checkbox-circle-line', color: '#10b981' },
            { label: '离线', value: stats.offline, icon: 'ri-close-circle-line', color: '#6b7280' },
            { label: '异常', value: stats.alert, icon: 'ri-error-warning-line', color: '#ef4444' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
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
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="搜索设备名称或位置..."
                className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 cursor-pointer bg-white"
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="alert">异常</option>
            </select>
            <span className="text-[13px] text-gray-500 whitespace-nowrap">共 {filtered.length} 个设备</span>
          </div>
        </div>

        {/* Device Grid */}
        {loading ? (
          <div className="text-center text-[13px] text-gray-400 py-12">加载中...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(device => (
              <div
                key={device.id}
                onClick={() => onSelectStation(String(device.id))}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                  {/* 占位：等二牛 WS 推流接口接入后替换为实时帧 */}
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <i className="ri-camera-line text-[36px]"></i>
                    <span className="text-[12px]">{device.protocol.toUpperCase()}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm ${
                      device.status === 'online' ? 'bg-emerald-500/90 text-white'
                      : device.status === 'alert' ? 'bg-red-500/90 text-white'
                      : 'bg-gray-500/90 text-white'
                    }`}>
                      {device.status === 'online' ? '在线' : device.status === 'alert' ? '异常' : '离线'}
                    </span>
                  </div>

                  {/* Live Indicator */}
                  {device.status === 'online' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span className="text-[11px] font-medium text-white">LIVE</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <i className="ri-eye-line text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-0.5">{device.name}</h3>
                    <p className="text-[12px] text-gray-500">{device.location || '未设置位置'}</p>
                  </div>
                  <div className="text-[12px] text-gray-400 mt-2 truncate">{device.url}</div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[12px] text-gray-500">{device.protocol.toUpperCase()}</span>
                    <span className={`text-[12px] font-medium ${device.detection_enabled ? 'text-violet-600' : 'text-gray-400'}`}>
                      {device.detection_enabled ? '🔍 检测中' : '检测关闭'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
            <i className="ri-inbox-line text-[56px] mb-4"></i>
            <p className="text-[15px] font-medium">没有找到匹配的设备</p>
            <p className="text-[13px] mt-1">尝试修改搜索条件，或在设备管理中添加摄像头</p>
          </div>
        )}
      </div>
    </div>
  );
}
