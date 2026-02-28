interface DeviceTableProps {
  devices: any[];
  onViewDetail: (device: any) => void;
}

export default function DeviceTable({ devices, onViewDetail }: DeviceTableProps) {
  const statusConfig = {
    online: { 
      label: '在线', 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: 'ri-checkbox-circle-fill'
    },
    offline: { 
      label: '离线', 
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: 'ri-close-circle-fill'
    },
    alert: { 
      label: '异常', 
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: 'ri-error-warning-fill'
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fb] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">设备名称</th>
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">设备ID</th>
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">位置</th>
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">IP地址</th>
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">分辨率</th>
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">状态</th>
              <th className="text-left py-3 px-4 text-[12px] font-semibold text-gray-600">最后在线</th>
              <th className="text-center py-3 px-4 text-[12px] font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => {
              const config = statusConfig[device.status];
              return (
                <tr 
                  key={device.id} 
                  className="border-b border-gray-50 hover:bg-[#f4f3ff] transition-colors cursor-pointer"
                  onClick={() => onViewDetail(device)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <i className="ri-camera-line text-white text-[14px]"></i>
                      </div>
                      <span className="text-[13px] font-medium text-gray-900">{device.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[12px] text-gray-600 font-mono">{device.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-[12px] text-gray-600">
                      <i className="ri-map-pin-line text-gray-400 text-[13px]"></i>
                      {device.location}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[12px] text-gray-600 font-mono">{device.ip}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[12px] text-gray-600">{device.resolution}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border ${config.color}`}>
                      <i className={`${config.icon} text-[12px]`}></i>
                      {config.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[12px] text-gray-500">{device.lastOnline}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(device);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-colors cursor-pointer"
                        title="查看详情"
                      >
                        <i className="ri-eye-line text-[14px]"></i>
                      </button>
                      <button 
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                        title="编辑"
                      >
                        <i className="ri-edit-line text-[14px]"></i>
                      </button>
                      <button 
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                        title="删除"
                      >
                        <i className="ri-delete-bin-line text-[14px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}