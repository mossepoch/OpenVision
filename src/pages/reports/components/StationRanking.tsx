import { useEffect, useMemo, useState } from 'react';
import { reportsApi, type DeviceStat } from '../../../api/reports';
import { stationsApi, type Station } from '../../../api/stations';

export default function StationRanking() {
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.deviceStats().catch((err) => {
        console.error('Failed to load device stats:', err);
        return [];
      }),
      stationsApi.list().catch((err) => {
        console.error('Failed to load stations:', err);
        return [];
      }),
    ]).then(([stats, stationList]) => {
      setDeviceStats(stats as DeviceStat[]);
      setStations(stationList as Station[]);
    }).finally(() => setLoading(false));
  }, []);

  const ranking = useMemo(() => {
    const alertMap = new Map(deviceStats.map(item => [item.device, item.alert_count]));
    return stations
      .map((station) => ({
        station: station.name,
        compliance: station.compliance7d ?? 0,
        tasks: station.totalTasks ?? 0,
        alerts: alertMap.get(station.name) ?? station.alert_count ?? 0,
        operator: '',
        avgDuration: 0,
      }))
      .sort((a, b) => b.compliance - a.compliance);
  }, [deviceStats, stations]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-800">工位排名</h3>
        <button className="text-[12px] text-[#7c3aed] hover:text-[#6d28d9] font-medium cursor-pointer whitespace-nowrap transition-colors">
          查看全部
        </button>
      </div>

      {loading ? (
        <div className="h-[160px] flex items-center justify-center text-[12px] text-gray-400">
          <i className="ri-loader-4-line animate-spin text-[18px] mr-2"></i>加载中...
        </div>
      ) : ranking.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-[12px] text-gray-400">暂无数据</div>
      ) : (
        <div className="space-y-2.5">
          {ranking.map((s, i) => (
            <div key={s.station} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                i === 0 ? 'bg-amber-100 text-amber-600' :
                i === 1 ? 'bg-gray-200 text-gray-500' :
                i === 2 ? 'bg-orange-100 text-orange-500' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-gray-800">{s.station}</span>
                    <span className="text-[10px] text-gray-400">{s.operator || '—'}</span>
                  </div>
                  <span className={`text-[12px] font-semibold ${
                    s.compliance >= 95 ? 'text-emerald-600' : s.compliance >= 90 ? 'text-[#0052d9]' : 'text-orange-500'
                  }`}>
                    {s.compliance}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      s.compliance >= 95 ? 'bg-emerald-500' : s.compliance >= 90 ? 'bg-[#0052d9]' : 'bg-orange-500'
                    }`}
                    style={{ width: `${s.compliance}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                  <span>任务 {s.tasks}</span>
                  <span>异常 {s.alerts}</span>
                  <span>均时 {s.avgDuration}min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
