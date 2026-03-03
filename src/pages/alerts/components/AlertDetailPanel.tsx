import { alertsApi, type Alert } from '../../../api/alerts';
import { useState } from 'react';

interface Props {
  alert: Alert;
  onClose: () => void;
  onUpdate: (updated: Alert) => void;
}

const SEVERITY_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: '严重', bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  high:     { label: '高危', bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200' },
  medium:   { label: '中危', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  low:      { label: '低危', bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200' },
};

export default function AlertDetailPanel({ alert, onClose, onUpdate }: Props) {
  const [operating, setOperating] = useState<string | null>(null);
  const sev = SEVERITY_MAP[alert.severity] ?? SEVERITY_MAP.low;

  const handleMarkRead = async () => {
    if (alert.is_read) return;
    setOperating('read');
    try {
      await alertsApi.markRead(alert.id);
      onUpdate({ ...alert, is_read: true });
    } catch { /* ignore */ } finally { setOperating(null); }
  };

  const handleResolve = async () => {
    if (alert.is_resolved) return;
    setOperating('resolve');
    try {
      await alertsApi.resolve(alert.id);
      onUpdate({ ...alert, is_resolved: true });
    } catch { /* ignore */ } finally { setOperating(null); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${sev.border} ${sev.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${sev.bg} ${sev.text} border ${sev.border}`}>
                  {sev.label}
                </span>
                <h2 className="text-[15px] font-bold text-gray-900">{alert.alert_type}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors cursor-pointer">
                <i className="ri-close-line text-gray-500 text-[18px]"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[13px] text-gray-700 leading-relaxed">{alert.message}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: '告警 ID', value: `#${alert.id}` },
                { label: '设备', value: `设备-${alert.device_id}` },
                { label: '置信度', value: alert.confidence != null ? `${(alert.confidence * 100).toFixed(1)}%` : '-' },
                { label: '告警时间', value: new Date(alert.created_at).toLocaleString('zh-CN') },
                { label: '处理时间', value: alert.resolved_at ? new Date(alert.resolved_at).toLocaleString('zh-CN') : '-' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-700 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${
                alert.is_resolved ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'
              }`}>
                <i className={`text-[13px] ${alert.is_resolved ? 'ri-check-double-line' : 'ri-time-line'}`}></i>
                {alert.is_resolved ? '已处理' : '待处理'}
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${
                alert.is_read ? 'bg-gray-50 text-gray-400' : 'bg-violet-50 text-violet-600'
              }`}>
                <i className={`text-[13px] ${alert.is_read ? 'ri-eye-line' : 'ri-eye-off-line'}`}></i>
                {alert.is_read ? '已读' : '未读'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button onClick={onClose}
              className="h-9 px-4 text-[13px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              关闭
            </button>
            {!alert.is_read && (
              <button onClick={handleMarkRead} disabled={operating === 'read'}
                className="h-9 px-4 text-[13px] text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                {operating === 'read' ? '处理中...' : '标记已读'}
              </button>
            )}
            {!alert.is_resolved && (
              <button onClick={handleResolve} disabled={operating === 'resolve'}
                className="h-9 px-4 text-[13px] text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                {operating === 'resolve' ? '处理中...' : '标记处理'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
