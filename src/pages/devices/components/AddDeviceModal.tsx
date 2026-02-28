import { useState } from 'react';

interface AddDeviceModalProps {
  onClose: () => void;
}

export default function AddDeviceModal({ onClose }: AddDeviceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ip: '',
    port: '554',
    username: '',
    password: '',
    protocol: 'rtsp',
    model: '',
    resolution: '1920x1080',
    fps: '30'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Adding device:', formData);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">添加摄像头设备</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">配置新的摄像头接入信息</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-400 text-[18px]"></i>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className="text-[12px] font-semibold text-gray-700 mb-3">基本信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">设备名称 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如：工位A-主视角"
                      className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">安装位置 *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例如：装配车间-工位A"
                      className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">设备型号</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="例如：海康威视 DS-2CD3T86FWDV2"
                      className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9]"
                    />
                  </div>
                </div>
              </div>

              {/* Network Config */}
              <div>
                <h3 className="text-[12px] font-semibold text-gray-700 mb-3">网络配置</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1.5">IP地址 *</label>
                      <input
                        type="text"
                        value={formData.ip}
                        onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                        placeholder="192.168.1.100"
                        className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9] font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1.5">端口 *</label>
                      <input
                        type="text"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                        placeholder="554"
                        className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9] font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">协议类型</label>
                    <select
                      value={formData.protocol}
                      onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                      className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9] cursor-pointer"
                    >
                      <option value="rtsp">RTSP</option>
                      <option value="rtmp">RTMP</option>
                      <option value="http">HTTP</option>
                      <option value="onvif">ONVIF</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1.5">用户名</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="admin"
                        className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1.5">密码</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Config */}
              <div>
                <h3 className="text-[12px] font-semibold text-gray-700 mb-3">视频参数</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">分辨率</label>
                    <select
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9] cursor-pointer"
                    >
                      <option value="3840x2160">4K (3840x2160)</option>
                      <option value="2560x1440">2K (2560x1440)</option>
                      <option value="1920x1080">1080P (1920x1080)</option>
                      <option value="1280x720">720P (1280x720)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">帧率 (FPS)</label>
                    <select
                      value={formData.fps}
                      onChange={(e) => setFormData({ ...formData, fps: e.target.value })}
                      className="w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052d9]/20 focus:border-[#0052d9] cursor-pointer"
                    >
                      <option value="60">60 FPS</option>
                      <option value="30">30 FPS</option>
                      <option value="25">25 FPS</option>
                      <option value="15">15 FPS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Test Connection */}
              <div className="bg-[#f7f8fa] rounded-lg p-3">
                <button
                  type="button"
                  className="w-full h-9 text-[12px] text-[#0052d9] bg-white hover:bg-gray-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 font-medium"
                >
                  <i className="ri-link text-[13px]"></i>
                  测试连接
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-[12px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              取消
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="h-9 px-4 text-[12px] text-white bg-[#0052d9] hover:bg-[#0045b5] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              添加设备
            </button>
          </div>
        </div>
      </div>
    </>
  );
}