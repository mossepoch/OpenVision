import { useState, useEffect, useCallback } from 'react';
import AlertDetailPanel from './components/AlertDetailPanel';
import { alertsApi, type Alert } from '../../api/alerts';

const SEVERITY_MAP: Record<string, { label: string; bg: string; text: string }> = {
  critical: { label: '严重', bg: 'bg-red-100', text: 'text-red-600' },
  high:     { label: '高危', bg: 'bg-orange-100', text: 'text-orange-500' },
  medium:   { label: '中危', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  low:      { label: '低危', bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [operating, setOperating] = useState<number | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      if (filterRead === 'unread') params.is_read = 'false';
      if (filterRead === 'read') params.is_read = 'true';
      const data = await alertsApi.list(params as any);
      setAlerts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载告警失败');
    } finally {
      setLoading(false);
    }
  }, [filterSeverity, filterRead]);

  useEffect(() => {
    fetchAlerts();
    const timer = setInterval(() => {
      alertsApi.list({ limit: 100 } as any).then(data => setAlerts(data)).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  const handleMarkRead = async (id: number) => {
    setOperating(id);
    try {
      await alertsApi.markRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch {
      // ignore
    } finally {
      setOperating(null);
    }
  };

  const handleResolve = async (id: number) => {
    setOperating(id);
    try {
      await alertsApi.resolve(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch {
      // ignore
    } finally {
      setOperating(null);
    }
  };

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.is_read).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length,
    resolved: alerts.filter(a => a.is_resolved).length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 mb-1">告警管理</h1>
            <p className="text-[13px] text-gray-400">查看和处理所有系统告警</p>
          </div>
          <button
            onClick={fetchAlerts}
            className="h-9 px-4 text-[13px] text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-sm"
          >
            刷新
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '告警总数', value: stats.total, bg: 'bg-violet-50', color: 'text-violet-500' },
          { label: '未读告警', value: stats.unread, bg: 'bg-orange-50', color: 'text-orange-500' },
          { label: '严重告警', value: stats.critical, bg: 'bg-red-50', color: 'text-red-500' },
          { label: '已处理', value: stats.resolved, bg: 'bg-emerald-50', color: 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-[13px] font-medium text-gray-500 mb-1">{s.label}</div>
            <div className={`text-[28px] font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-3 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                filterSeverity === s ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {{ all: '全部', critical: '严重', high: '高危', medium: '中危', low: '低危' }[s]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-1">
          {(['all', 'unread', 'read'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterRead(s)}
              className={`px-3 py-1.5 text-[13px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                filterRead === s ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {{ all: '全部', unread: '未读', read: '已读' }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] text-red-500">⚠ {error}</div>
      )}

      {/* Alert List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-[13px] text-gray-400 py-12">加载中...</div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <i className="ri-shield-check-line text-emerald-400 text-[26px]"></i>
            </div>
            <p className="text-[13px] text-gray-400">暂无告警</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['ID', '级别', '类型', '消息', '设备', '状态', '时间', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => {
                const sev = SEVERITY_MAP[alert.severity] || SEVERITY_MAP.low;
                return (
                  <tr
                    key={alert.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!alert.is_read ? 'bg-violet-50/30' : ''}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="px-4 py-3 text-[13px] text-gray-400">#{alert.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${sev.bg} ${sev.text}`}>
                        {sev.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 font-medium">{alert.alert_type}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 max-w-[240px] truncate">{alert.message}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">设备-{alert.device_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!alert.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
                        )}
                        <span className={`text-[12px] ${alert.is_resolved ? 'text-emerald-500' : alert.is_read ? 'text-gray-400' : 'text-orange-500'}`}>
                          {alert.is_resolved ? '已处理' : alert.is_read ? '已读' : '未读'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-400 whitespace-nowrap">
                      {new Date(alert.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!alert.is_read && (
                          <button
                            onClick={() => handleMarkRead(alert.id)}
                            disabled={operating === alert.id}
                            className="text-[12px] text-violet-600 hover:text-violet-800 cursor-pointer whitespace-nowrap disabled:opacity-40"
                          >
                            标记已读
                          </button>
                        )}
                        {!alert.is_resolved && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={operating === alert.id}
                            className="text-[12px] text-emerald-600 hover:text-emerald-800 cursor-pointer whitespace-nowrap disabled:opacity-40"
                          >
                            处理
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedAlert && (
        <AlertDetailPanel
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={(updated) => {
            setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
            setSelectedAlert(updated);
          }}
        />
      )}
    </div>
  );
}
