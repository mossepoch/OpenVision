
import React from 'react';

type StationCardProps = {
  station: any;
  onEdit: (station: any) => void;
  onDelete: (id: string) => void;
};

export default function StationCard({ station, onEdit, onDelete }: StationCardProps) {
  const isActive = station.status === 'active';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-[14px]"
            style={{ background: isActive ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : '#9ca3af' }}
          >
            {station.name.slice(-2)}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{station.name}</h3>
            <p className="text-[12px] text-gray-500">{station.location}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
            isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isActive ? '运行中' : '未配置'}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-[12px]">
          <i className="ri-file-list-3-line text-gray-400"></i>
          <span className="text-gray-500">SOP:</span>
          <span className="text-gray-900 font-medium flex-1 truncate">
            {station.sopName || '未配置'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <i className="ri-camera-line text-gray-400"></i>
          <span className="text-gray-500">摄像头:</span>
          <span className="text-gray-900 font-medium">
            {station.cameras?.length || 0} 个
          </span>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <i className="ri-cpu-line text-gray-400"></i>
          <span className="text-gray-500">检测模式:</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              station.detectionMode === 'cv_vl'
                ? 'bg-cyan-50 text-cyan-700'
                : 'bg-purple-50 text-purple-700'
            }`}
          >
            {station.detectionMode === 'cv_vl' ? 'CV+VL' : 'VL-only'}
          </span>
        </div>
      </div>

      {/* Stats */}
      {isActive && (
        <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-[18px] font-bold text-purple-600">{station.compliance7d}%</div>
            <div className="text-[11px] text-gray-500">合规率</div>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-bold text-gray-900">{station.totalTasks}</div>
            <div className="text-[11px] text-gray-500">任务数</div>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-bold text-orange-500">{station.alertCount}</div>
            <div className="text-[11px] text-gray-500">异常数</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(station)}
          className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
        >
          <i className="ri-edit-line text-[14px]"></i>
          编辑
        </button>
        <button
          onClick={() => onDelete(station.id)}
          className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-[12px] font-medium hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
        >
          <i className="ri-delete-bin-line text-[14px]"></i>
        </button>
      </div>
    </div>
  );
}