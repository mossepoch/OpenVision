import { hourlyDistribution } from '../../../mocks/reportsData';

export default function HourlyDistributionChart() {
  const maxCount = Math.max(...hourlyDistribution.map(d => d.count));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-800">时段分布</h3>
        <div className="flex items-center gap-3">
          {/* ... existing code ... */}
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-[120px] px-1">
        {hourlyDistribution.map((d, i) => (
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
    </div>
  );
}
