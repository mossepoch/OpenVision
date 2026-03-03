import { useState, useEffect, useCallback } from 'react';
import DeviceCard from './components/DeviceCard';
import DeviceTable from './components/DeviceTable';
import AddDeviceModal from './components/AddDeviceModal';
import DeviceDetailModal from './components/DeviceDetailModal';
import { devicesApi, type Device } from '../../api/devices';

export default function DevicesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // 后端数据
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await devicesApi.list();
      setDevices(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载设备失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  // 统计
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    alert: devices.filter(d => d.status === 'alert').length,
  };

  // 筛选
  const filteredDevices = devices.filter(device => {
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (device.location ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(device.id).includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // 适配子组件期望的格式（子组件还没改，先做字段映射）
  const adaptDevice = (d: Device) => ({
    id: `CAM-${String(d.id).padStart(3, '0')}`,
    name: d.name,
    location: d.location ?? '',
    ip: d.url,
    status: d.status,
    resolution: '1920x1080',
    fps: 30,
    lastOnline: d.updated_at ?? d.created_at ?? '-',
    uptime: '-',
    bandwidth: '-',
    storage: '-',
    model: d.protocol.toUpperCase(),
    installDate: d.created_at?.split('T')[0] ?? '-',
    // 保留原始后端字段
    _raw: d,
  });

  const adaptedDevices = filteredDevices.map(adaptDevice);

  const statCards = [
    { label: '设备总数', value: stats.total, icon: 'ri-camera-fill', color: 'text-violet-500', bg: 'bg-violet-50', sub: '全部接入设备', subColor: 'text-gray-400' },
    { label: '在线设备', value: stats.online, icon: 'ri-checkbox-circle-fill', color: 'text-emerald-500', bg: 'bg-emerald-50', sub: '正常运行中', subColor: 'text-emerald-500' },
    { label: '离线设备', value: stats.offline, icon: 'ri-close-circle-fill', color: 'text-red-500', bg: 'bg-red-50', sub: '需要检查连接', subColor: 'text-gray-400' },
    { label: '异常设备', value: stats.alert, icon: 'ri-alarm-warning-fill', color: 'text-orange-500', bg: 'bg-orange-50', sub: '需要处理', subColor: 'text-orange-500' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 mb-1">设备管理</h1>
            <p className="text-[13px] text-gray-400">管理和监控所有摄像头设备的接入状态</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDevices}
              className="h-9 px-4 text-[13px] text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm"
            >
              刷新
            </button>
            <button className="h-9 px-4 text-[13px] text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm">
              导出列表
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 text-[13px] text-white rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
            >
              + 添加设备
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-[20px]`}></i>
            </div>
            <div>
              <div className="text-[13px] font-medium text-gray-500 mb-1">{s.label}</div>
              <div className="text-[28px] font-bold text-gray-900 leading-tight">{s.value}</div>
              <div className={`text-[12px] mt-1 ${s.subColor}`}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
              {(['all', 'online', 'offline', 'alert'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                    filterStatus === s ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {{ all: '全部', online: '在线', offline: '离线', alert: '异常' }[s]}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索设备名称、位置或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-3 pr-3 text-[13px] bg-[#f8f9fb] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] w-[280px] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                  viewMode === mode ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <i className={`${mode === 'grid' ? 'ri-layout-grid-line' : 'ri-list-check'} text-[14px]`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] text-red-500">
          ⚠ {error} — 显示的可能是缓存数据
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-[13px] text-gray-400 py-4">加载中...</div>
      )}

      {/* Devices Display */}
      {!loading && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {adaptedDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onViewDetail={() => setSelectedDevice(device._raw as Device)}
              />
            ))}
          </div>
        ) : (
          <DeviceTable
            devices={adaptedDevices}
            onViewDetail={(device) => setSelectedDevice((device as any)._raw as Device)}
          />
        )
      )}

      {/* Empty State */}
      {!loading && filteredDevices.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-camera-off-line text-gray-400 text-[28px]"></i>
            </div>
            <p className="text-[13px] text-gray-400">
              {devices.length === 0 ? '暂无设备，点击「添加设备」开始接入' : '未找到符合条件的设备'}
            </p>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchDevices}
        />
      )}

      {selectedDevice && (
        <DeviceDetailModal
          device={selectedDevice as any}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
