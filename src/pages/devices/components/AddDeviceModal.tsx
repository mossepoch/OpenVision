import { useState } from 'react';
import { devicesApi } from '../../../api/devices';

interface AddDeviceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddDeviceModal({ onClose, onSuccess }: AddDeviceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    url: '',           // 完整 RTSP URL
    protocol: 'rtsp',
    username: '',
    password: '',
    target_fps: '10',  // 新增：采集帧率，默认10
    detection_enabled: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string | boolean) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      setError('设备名称和 RTSP 地址为必填项');
      return;
    }
    const fps = parseInt(formData.target_fps);
    if (isNaN(fps) || fps < 1 || fps > 30) {
      setError('采集帧率须在 1-30 之间');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await devicesApi.create({
        name: formData.name.trim(),
        location: formData.location.trim() || undefined,
        url: formData.url.trim(),
        protocol: formData.protocol,
        username: formData.username || undefined,
        password: formData.password || undefined,
        detection_enabled: formData.detection_enabled,
        confidence_threshold: 0.5,
      });
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '添加设备失败');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full h-9 px-3 text-[12px] bg-[#f7f8fa] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">添加摄像头设备</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">配置新的摄像头接入信息</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <i className="ri-close-line text-gray-400 text-[18px]"></i>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
            {/* 基本信息 */}
            <div>
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">基本信息</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5">设备名称 *</label>
                  <input type="text" value={formData.name} onChange={e => set('name', e.target.value)}
                    placeholder="例如：工位A-主视角" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5">安装位置</label>
                  <input type="text" value={formData.location} onChange={e => set('location', e.target.value)}
                    placeholder="例如：装配车间-工位A" className={inputCls} />
                </div>
              </div>
            </div>

            {/* 网络配置 */}
            <div>
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">网络配置</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5">协议类型</label>
                  <select value={formData.protocol} onChange={e => set('protocol', e.target.value)}
                    className={inputCls + ' cursor-pointer'}>
                    <option value="rtsp">RTSP</option>
                    <option value="onvif">ONVIF</option>
                    <option value="http-flv">HTTP-FLV</option>
                    <option value="gb28181">GB28181</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5">RTSP 地址 *</label>
                  <input type="text" value={formData.url} onChange={e => set('url', e.target.value)}
                    placeholder="rtsp://192.168.1.x:8080/h264" className={inputCls + ' font-mono'} required />
                  <p className="text-[10px] text-gray-400 mt-1">手机 IP Webcam 地址格式：rtsp://手机IP:8080/h264</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">用户名</label>
                    <input type="text" value={formData.username} onChange={e => set('username', e.target.value)}
                      placeholder="admin" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5">密码</label>
                    <input type="password" value={formData.password} onChange={e => set('password', e.target.value)}
                      placeholder="••••••••" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* 采集参数 */}
            <div>
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">采集参数</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5">采集帧率 (target_fps)</label>
                  <input
                    type="number"
                    value={formData.target_fps}
                    onChange={e => set('target_fps', e.target.value)}
                    min={1} max={30} step={1}
                    placeholder="10"
                    className={inputCls}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">推荐 10fps，范围 1-30</p>
                </div>
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={formData.detection_enabled}
                      onChange={e => set('detection_enabled', e.target.checked)}
                      className="w-4 h-4 rounded accent-violet-600"
                    />
                    <span className="text-[12px] text-gray-700">启用 AI 检测</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-[12px] text-red-500">
                ⚠ {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="h-9 px-4 text-[12px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              取消
            </button>
            <button type="submit" onClick={handleSubmit} disabled={submitting}
              className="h-9 px-4 text-[12px] text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              {submitting ? '添加中...' : '添加设备'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
