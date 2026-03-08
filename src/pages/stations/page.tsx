
import React, { useState, useEffect } from 'react';
import { stationsApi, Station } from '../../api/stations';
import StationCard from './components/StationCard';
import StationConfigModal from './components/StationConfigModal';

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    stationsApi.list().then(setStations).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = stations.filter((s) => {
    const matchSearch =
      s.name.includes(searchText) ||
      s.location.includes(searchText) ||
      s.sopName.includes(searchText);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: stations.length,
    active: stations.filter((s) => s.status === 'active').length,
    inactive: stations.filter((s) => s.status === 'inactive').length,
    cvVl: stations.filter((s) => s.detectionMode === 'cv_vl').length,
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await stationsApi.delete(showDeleteConfirm);
        setStations((prev) => prev.filter((s) => s.id !== showDeleteConfirm));
      } catch (e) {
        console.error(e);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingStation) {
        const updated = await stationsApi.update(editingStation.id, data);
        setStations((prev) => prev.map((s) => s.id === editingStation.id ? updated : s));
      } else {
        const created = await stationsApi.create(data);
        setStations((prev) => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
    setShowModal(false);
    setEditingStation(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fb]">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">工位管理</h1>
            <p className="text-[13px] text-gray-500">
              配置工位与摄像头、SOP、检测模型的关联关系
            </p>
          </div>
          <button
            onClick={() => {
              setEditingStation(null);
              setShowModal(true);
            }}
            className="px-4 py-2 text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
          >
            <i className="ri-add-line text-[16px]"></i>
            新建工位
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '全部工位', value: stats.total, icon: 'ri-layout-grid-fill', color: 'text-violet-500', bg: 'bg-violet-50' },
            { label: '运行中', value: stats.active, icon: 'ri-checkbox-circle-fill', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: '未配置', value: stats.inactive, icon: 'ri-error-warning-fill', color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'CV+VL 模式', value: stats.cvVl, icon: 'ri-cpu-fill', color: 'text-cyan-500', bg: 'bg-cyan-50' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <i className={`${item.icon} ${item.color} text-[20px]`}></i>
              </div>
              <div>
                <div className="text-[13px] font-medium text-gray-500 mb-0.5">{item.label}</div>
                <div className="text-[24px] font-bold text-gray-900">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 关系说明 */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <i className="ri-lightbulb-line text-purple-600 text-[18px] mt-0.5 flex-shrink-0"></i>
            <div>
              <div className="text-[13px] font-semibold text-purple-900 mb-1.5">
                工位配置说明
              </div>
              <div className="text-[12px] text-purple-700 leading-relaxed">
                每个工位独立配置：<strong>摄像头</strong>（采集视频流）→{' '}
                <strong>SOP 流程</strong>（定义作业步骤）→{' '}
                <strong>检测模式</strong>（VL-only 或 CV+VL）。多个工位可以共用同一个 SOP，例如工位-01
                和工位-05 都使用「发动机组装 SOP v2.3」。
              </div>
            </div>
          </div>
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
                placeholder="搜索工位名称、位置或 SOP..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer bg-white"
            >
              <option value="all">全部状态</option>
              <option value="active">运行中</option>
              <option value="inactive">未配置</option>
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
              <StationCard
                key={station.id}
                station={station}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

      {/* Config Modal */}
      {showModal && (
        <StationConfigModal
          station={editingStation}
          onClose={() => {
            setShowModal(false);
            setEditingStation(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteConfirm(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <i className="ri-delete-bin-line text-red-500 text-[22px]"></i>
              </div>
              <div>
                <div className="text-[15px] font-semibold text-gray-900">确认删除</div>
                <div className="text-[13px] text-gray-500">此操作不可撤销</div>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 mb-6">
              删除后该工位的所有配置将丢失，历史数据不受影响。确定要删除吗？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-500 text-white rounded-lg text-[13px] hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}