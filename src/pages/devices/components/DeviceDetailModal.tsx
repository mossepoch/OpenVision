interface DeviceDetailModalProps {
  device: any;
  onClose: () => void;
}

export default function DeviceDetailModal({ device, onClose }: DeviceDetailModalProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          dot: 'bg-emerald-500',
          label: '在线'
        };
      case 'offline':
        return {
          bg: 'bg-red-50',
          text: 'text-red-500',
          dot: 'bg-red-500',
          label: '离线'
        };
      case 'alert':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-500',
          dot: 'bg-orange-500',
          label: '异常'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-500',
          dot: 'bg-gray-400',
          label: '未知'
        };
    }
  };

  const statusConfig = getStatusConfig(device.status);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0052d9]/10 flex items-center justify-center">
                <i className="ri-camera-line text-[#0052d9] text-[18px]"></i>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">{device.name}</h2>
                <p className="text-[11px] text-gray-400">{device.id}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] ${statusConfig.bg} ${statusConfig.text} ml-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                {statusConfig.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-400 text-[18px]"></i>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-3 gap-4">
              {/* Video Preview */}
              <div className="col-span-2 space-y-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  {device.status === 'online' || device.status === 'alert' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="ri-live-line text-white text-[48px] mb-3 opacity-60"></i>
                        <div className="text-[13px] text-white/60">实时画面预览</div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="ri-camera-off-line text-white text-[48px] mb-3 opacity-40"></i>
                        <div className="text-[13px] text-white/40">设备离线</div>
                      </div>
                    </div>
                  )}
                  
                  {device.status === 'online' && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/90 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        <span className="text-[11px] text-white font-medium">REC</span>
                      </div>
                    </div>
                  )}

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                          <i className="ri-play-fill text-white text-[16px]"></i>
                        </button>
                        <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                          <i className="ri-camera-line text-white text-[14px]"></i>
                        </button>
                        <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                          <i className="ri-record-circle-line text-white text-[14px]"></i>
                        </button>
                      </div>
                      <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                        <i className="ri-fullscreen-line text-white text-[14px]"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-[#f7f8fa] rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 mb-1">分辨率</div>
                    <div className="text-[13px] font-semibold text-gray-900">{device.resolution}</div>
                  </div>
                  <div className="bg-[#f7f8fa] rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 mb-1">帧率</div>
                    <div className="text-[13px] font-semibold text-gray-900">{device.fps} FPS</div>
                  </div>
                  <div className="bg-[#f7f8fa] rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 mb-1">带宽</div>
                    <div className="text-[13px] font-semibold text-gray-900">{device.bandwidth}</div>
                  </div>
                  <div className="bg-[#f7f8fa] rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 mb-1">存储占用</div>
                    <div className="text-[13px] font-semibold text-gray-900">{device.storage}</div>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-[#f7f8fa] rounded-lg p-4">
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-3">基本信息</h3>
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">设备名称</div>
                      <div className="text-[12px] text-gray-900">{device.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">设备ID</div>
                      <div className="text-[12px] text-gray-900 font-mono">{device.id}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">安装位置</div>
                      <div className="text-[12px] text-gray-900">{device.location}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">设备型号</div>
                      <div className="text-[12px] text-gray-900">{device.model}</div>
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                <div className="bg-[#f7f8fa] rounded-lg p-4">
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-3">网络信息</h3>
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">IP地址</div>
                      <div className="text-[12px] text-gray-900 font-mono">{device.ip}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">运行时长</div>
                      <div className="text-[12px] text-gray-900">{device.uptime}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">最后在线</div>
                      <div className="text-[12px] text-gray-900">{device.lastOnline}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">安装日期</div>
                      <div className="text-[12px] text-gray-900">{device.installDate}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="w-full h-9 text-[12px] text-white bg-[#0052d9] hover:bg-[#0045b5] rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
                    <i className="ri-settings-3-line text-[13px]"></i>
                    配置设备
                  </button>
                  <button className="w-full h-9 text-[12px] text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
                    <i className="ri-restart-line text-[13px]"></i>
                    重启设备
                  </button>
                  <button className="w-full h-9 text-[12px] text-red-500 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
                    <i className="ri-delete-bin-line text-[13px]"></i>
                    删除设备
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}