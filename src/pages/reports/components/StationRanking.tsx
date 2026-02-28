import { stationPerformance } from '../../../mocks/reportsData';

export default function StationRanking() {
  const sorted = [...stationPerformance].sort((a, b) => b.compliance - a.compliance);
  const maxTasks = Math.max(...sorted.map(s => s.tasks));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-800">工位排名</h3>
        <button className="text-[12px] text-[#7c3aed] hover:text-[#6d28d9] font-medium cursor-pointer whitespace-nowrap transition-colors">
          查看全部
        </button>
      </div>

      <div className="space-y-2.5">
        {sorted.map((s, i) => (
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
                  <span className="text-[10px] text-gray-400">{s.operator}</span>
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
    </div>
  );
}
