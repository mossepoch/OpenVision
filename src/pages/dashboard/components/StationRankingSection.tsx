interface StationData {
  station: string;
  compliance: number;
  tasks: number;
  alerts: number;
  operator: string;
  avgDuration: number;
}

interface Props {
  data: StationData[];
}

export default function StationRankingSection({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.compliance - a.compliance);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-[14px] font-bold text-gray-800">工位合规排行</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">按合规率从高到低排序</p>
        </div>
        <span className="text-[12px] text-[#7c3aed] font-semibold cursor-pointer hover:underline">查看详情</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {sorted.map((s, i) => (
          <div key={s.station} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-[#f4f3ff]/50 transition-colors cursor-pointer">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
              i === 0 ? 'bg-amber-100 text-amber-600' :
              i === 1 ? 'bg-gray-200 text-gray-500' :
              i === 2 ? 'bg-orange-100 text-orange-500' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-gray-800">{s.station}</span>
                <span className={`text-[13px] font-bold ${
                  s.compliance >= 95 ? 'text-emerald-600' :
                  s.compliance >= 90 ? 'text-[#7c3aed]' : 'text-orange-500'
                }`}>
                  {s.compliance}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${s.compliance}%`,
                    background: s.compliance >= 95
                      ? 'linear-gradient(to right, #10b981, #34d399)'
                      : s.compliance >= 90
                      ? 'linear-gradient(to right, #7c3aed, #a78bfa)'
                      : 'linear-gradient(to right, #f97316, #fb923c)'
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span>{s.operator}</span>
                <span>·</span>
                <span>任务 {s.tasks}</span>
                <span>·</span>
                <span>异常 {s.alerts}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
