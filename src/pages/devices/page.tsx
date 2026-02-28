import { useState } from 'react';
import { devicesData } from '../../mocks/devicesData';
import DeviceCard from './components/DeviceCard';
import DeviceTable from './components/DeviceTable';
import AddDeviceModal from './components/AddDeviceModal';
import DeviceDetailModal from './components/DeviceDetailModal';

export default function DevicesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  const filteredDevices = devicesData.devices.filter(device => {
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            <button className="h-9 px-4 text-[13px] text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm">
              <i className="ri-download-line text-[14px]"></i>
              导出列表
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 text-[13px] text-white rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
            >
              <i className="ri-add-line text-[14px]"></i>
              添加设备
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: '设备总数',
            value: devicesData.stats.totalDevices,
            icon: 'ri-camera-fill',
            color: 'text-violet-500',
            bg: 'bg-violet-50',
            sub: '全部接入设备',
            subColor: 'text-gray-400',
          },
          {
            label: '在线设备',
            value: devicesData.stats.onlineDevices,
            icon: 'ri-checkbox-circle-fill',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            sub: '正常运行中',
            subColor: 'text-emerald-500',
          },
          {
            label: '离线设备',
            value: devicesData.stats.offlineDevices,
            icon: 'ri-close-circle-fill',
            color: 'text-red-500',
            bg: 'bg-red-50',
            sub: '需要检查连接',
            subColor: 'text-gray-400',
          },
          {
            label: '异常设备',
            value: devicesData.stats.alertDevices,
            icon: 'ri-alarm-warning-fill',
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            sub: '需要处理',
            subColor: 'text-orange-500',
          },
        ].map(s => (
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

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                  filterStatus === 'all'
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterStatus('online')}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                  filterStatus === 'online'
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                在线
              </button>
              <button
                onClick={() => setFilterStatus('offline')}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                  filterStatus === 'offline'
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                离线
              </button>
              <button
                onClick={() => setFilterStatus('alert')}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                  filterStatus === 'alert'
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                异常
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
              <input
                type="text"
                placeholder="搜索设备名称、位置或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 text-[13px] bg-[#f8f9fb] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] w-[280px] transition-all"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="ri-layout-grid-line text-[14px]"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="ri-list-check text-[14px]"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Devices Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard 
              key={device.id} 
              device={device}
              onViewDetail={() => setSelectedDevice(device)}
            />
          ))}
        </div>
      ) : (
        <DeviceTable 
          devices={filteredDevices}
          onViewDetail={(device) => setSelectedDevice(device)}
        />
      )}

      {/* Empty State */}
      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-camera-off-line text-gray-400 text-[28px]"></i>
            </div>
            <p className="text-[13px] text-gray-400">未找到符合条件的设备</p>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <AddDeviceModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <DeviceDetailModal 
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}