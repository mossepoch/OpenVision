import { useEffect, useMemo, useState } from 'react';
import { reportsApi, type ReportSummary } from '../../../api/reports';

export default function HourlyDistributionChart() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.summary('today')
      .then(setSummary)
      .catch((err) => console.error('Failed to load hourly distribution:', err))
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    if (!summary?.hourly) return [];
    return Object.entries(summary.hourly)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([hour, count]) => ({
        hour: `${hour.padStart(2, '0')}:00`,
        count,
      }));
  }, [summary]);

  const maxCount = Math.max(1, ...data.map(d => d.count));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-800">时段分布</h3>
        <div className="text-[11px] text-gray-400">按小时统计</div>
      </div>

      {loading ? (
        <div className="h-[120px] flex items-center justify-center text-[12px] text-gray-400">
          <i className="ri-loader-4-line animate-spin text-[18px] mr-2"></i>加载中...
        </div>
      ) : data.length === 0 ? (
        <div className="h-[120px] flex items-center justify-center text-[12px] text-gray-400">暂无数据</div>
      ) : (
        <div className="flex items-end gap-1.5 h-[120px] px-1">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] text-gray-400 font-medium">{d.count}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#0052d9]/60 to-[#0052d9]/20 hover:from-[#0052d9]/80 hover:to-[#0052d9]/40 transition-all cursor-default min-h-[4px]"
                style={{ height: `${(d.count / maxCount) * 80}%` }}
              ></div>
              <span className="text-[9px] text-gray-300 whitespace-nowrap">{d.hour.slice(0, 5)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
