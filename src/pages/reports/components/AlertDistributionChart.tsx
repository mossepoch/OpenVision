import { alertDistribution } from '../../../mocks/reportsData';

export default function AlertDistributionChart() {
  const total = alertDistribution.reduce((sum, d) => sum + d.count, 0);
  
  // Calculate segments for the donut chart
  let cumulativePercent = 0;
  const segments = alertDistribution.map(d => {
    const start = cumulativePercent;
    const percent = (d.count / total) * 100;
    cumulativePercent += percent;
    return { ...d, start, percent };
  });

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-800">异常分布</h3>
        <button className="text-[12px] text-[#7c3aed] hover:text-[#6d28d9] font-medium cursor-pointer whitespace-nowrap transition-colors">
          查看详情
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width="110" height="110" viewBox="0 0 110 110">
            {segments.map((seg, i) => {
              const dashLength = (seg.percent / 100) * circumference;
              const dashOffset = -(seg.start / 100) * circumference;
              return (
                <circle
                  key={i}
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 55 55)"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-semibold text-gray-900">{total}</span>
            <span className="text-[10px] text-gray-400">总异常</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {alertDistribution.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-[11px] text-gray-600">{d.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-800">{d.count}</span>
                <span className="text-[10px] text-gray-400 w-8 text-right">{d.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
