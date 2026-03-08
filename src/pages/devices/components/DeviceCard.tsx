interface DeviceCardProps {
  device: any;
  onViewDetail: () => void;
}

export default function DeviceCard({ device, onViewDetail }: DeviceCardProps) {
  const statusConfig: Record<string, { label: string; color: string; icon: string; iconColor: string }> = {
    online: {
      label: '在线',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: 'ri-checkbox-circle-fill',
      iconColor: 'text-emerald-500',
    },
    offline: {
      label: '离线',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: 'ri-close-circle-fill',
      iconColor: 'text-gray-400',
    },
    alert: {
      label: '异常',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: 'ri-error-warning-fill',
      iconColor: 'text-orange-500',
    },
  };

  const config = statusConfig[device.status] ?? statusConfig.offline;

  // 兼容后端字段：优先用 url（真实字段），降级用 ip（适配字段）
  const rtspUrl: string = device.url ?? device.ip ?? '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group">
      {/* Device Preview */}
      <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="ri-camera-line text-gray-300 text-[48px] group-hover:scale-110 transition-transform"></i>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${config.color} flex items-center gap-1`}>
            <i className={`${config.icon} text-[12px]`}></i>
            {config.label}
          </span>
        </div>
        {device.status === 'online' && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-500 rounded-full">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium text-white">LIVE</span>
          </div>
        )}
      </div>

      {/* Device Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-1 truncate">{device.name}</h3>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <i className="ri-map-pin-line text-[13px]"></i>
              <span className="truncate">{device.location || '未设置位置'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-400 flex-shrink-0">设备ID</span>
            <span className="text-gray-600 font-mono ml-2">{device.id}</span>
          </div>
          {/* RTSP 地址：标签修正 + 超长截断 + hover 显示完整 */}
          <div className="flex items-center justify-between text-[12px] gap-2">
            <span className="text-gray-400 flex-shrink-0">RTSP地址</span>
            <span
              className="text-gray-600 font-mono truncate max-w-[160px] cursor-default"
              title={rtspUrl}
            >
              {rtspUrl}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-400 flex-shrink-0">协议</span>
            <span className="text-gray-600 uppercase">{device.model || device.protocol || '-'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[11px] text-gray-400 truncate mr-2">
            {device.lastOnline && device.lastOnline !== '-' ? `最后在线: ${device.lastOnline}` : ''}
          </div>
          <button
            onClick={onViewDetail}
            className="text-[12px] text-[#7c3aed] hover:text-[#6d28d9] font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors flex-shrink-0"
          >
            查看详情
            <i className="ri-arrow-right-s-line text-[14px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
