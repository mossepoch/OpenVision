import { useState } from 'react';

interface Alert {
  id: string;
  severity: string;
  title: string;
  description: string;
  station: string;
  time: string;
  status: string;
  sopName: string;
}

interface Props {
  alerts: Alert[];
}

const SEVERITY_LABEL: Record<string, string> = {
  high: '高危',
  medium: '中危',
  low: '低危',
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  high:   { bg: 'bg-red-100',    text: 'text-red-500' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-500' },
  low:    { bg: 'bg-yellow-100', text: 'text-yellow-600' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'bg-red-100',    text: 'text-red-500',    label: '待处理' },
  confirmed: { bg: 'bg-[#f4f3ff]',  text: 'text-[#7c3aed]', label: '已确认' },
  resolved:  { bg: 'bg-emerald-100',text: 'text-emerald-600',label: '已解决' },
};

const ICON_MAP: Record<string, string> = {
  high:   'ri-error-warning-fill',
  medium: 'ri-alert-fill',
  low:    'ri-information-fill',
};

const AVATAR_COLORS = ['#7c3aed', '#f97316', '#06b6d4', '#10b981', '#e11d48'];

function StationAvatar({ station, index }: { station: string; index: number }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
      style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {station.replace('工位-', 'W')}
    </div>
  );
}

export default function RecentAlertsSection({ alerts }: Props) {
  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const [expanded, setExpanded] = useState(false);

  const DEFAULT_COUNT = 3;
  const displayedAlerts = expanded ? alerts : alerts.slice(0, DEFAULT_COUNT);
  const hasMore = alerts.length > DEFAULT_COUNT;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">最近异常</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">近期活动</p>
        </div>
        <div className="flex items-center gap-2">
          {hasMore && (
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="text-[12px] text-[#7c3aed] font-semibold hover:underline cursor-pointer flex items-center gap-0.5 whitespace-nowrap"
            >
              {expanded ? (
                <>
                  收起
                  <i className="ri-arrow-up-s-line text-[13px]"></i>
                </>
              ) : (
                <>
                  查看全部
                  <i className="ri-arrow-down-s-line text-[13px]"></i>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {displayedAlerts.map((alert, idx) => {
          const sevColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.low;
          const statusCfg = STATUS_COLORS[alert.status] || STATUS_COLORS.pending;
          const isLast = idx === displayedAlerts.length - 1;

          return (
            <div key={alert.id} className="flex gap-3 cursor-pointer group">
              {/* Timeline column */}
              <div className="flex flex-col items-center flex-shrink-0">
                <StationAvatar station={alert.station} index={idx} />
                {!isLast && (
                  <div
                    className="flex-1 w-px mt-1 mb-1"
                    style={{
                      minHeight: '24px',
                      backgroundImage: 'repeating-linear-gradient(to bottom, #d1d5db 0px, #d1d5db 4px, transparent 4px, transparent 8px)',
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 ${!isLast ? 'pb-5' : 'pb-1'}`}>
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[13px] font-bold text-gray-900">{alert.title}</span>
                    <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                      <span className="text-[#7c3aed] font-semibold">{alert.station}</span>
                      {' '}{alert.description.replace(alert.station, '').trim()}
                    </p>
                  </div>
                </div>

                {/* Status change tags */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${sevColor.bg} ${sevColor.text}`}>
                    {SEVERITY_LABEL[alert.severity]}
                  </span>
                  <i className="ri-arrow-right-line text-gray-300 text-[12px]"></i>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Time */}
                <div className="text-[11px] text-gray-300 mt-1.5 flex items-center gap-1">
                  <i className="ri-time-line text-[11px]"></i>
                  {alert.time}
                  <span className="mx-1">·</span>
                  <span className="text-gray-400">{alert.sopName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
