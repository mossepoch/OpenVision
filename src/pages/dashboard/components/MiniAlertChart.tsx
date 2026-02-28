
import { useState } from 'react';

interface AlertItem {
  type: string;
  count: number;
  color: string;
  percent: number;
}

interface Props {
  data: AlertItem[];
}

export default function MiniAlertChart({ data }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // 计算饼图扇形路径
  const cx = 52;
  const cy = 52;
  const r = 46;

  let cumAngle = -Math.PI / 2;
  const segments = data.map((d, i) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const midAngle = startAngle + angle / 2;
    const labelR = r * 0.62;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    return { ...d, path, lx, ly, midAngle, index: i };
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div>
          <h3 className="text-[14px] font-bold text-gray-800">异常分布</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">按类型统计</p>
        </div>
        <div className="text-right">
          <div className="text-[20px] font-bold text-gray-900">{total}</div>
          <div className="text-[11px] text-gray-400">总异常</div>
        </div>
      </div>

      {/* Pie + Legend */}
      <div className="flex items-center gap-3 flex-1 min-h-0">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg
            width="104"
            height="104"
            viewBox="0 0 104 104"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {segments.map((seg, i) => {
              const isHovered = hoveredIndex === i;
              const offsetX = isHovered ? Math.cos(seg.midAngle) * 4 : 0;
              const offsetY = isHovered ? Math.sin(seg.midAngle) * 4 : 0;
              return (
                <g
                  key={i}
                  transform={`translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  className="cursor-pointer transition-transform duration-150"
                >
                  <path
                    d={seg.path}
                    fill={seg.color}
                    stroke="white"
                    strokeWidth="1.5"
                    opacity={hoveredIndex !== null && !isHovered ? 0.65 : 1}
                  />
                </g>
              );
            })}
            {/* Center white circle for donut effect - optional, remove for full pie */}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map((d, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg px-2 py-1 cursor-pointer transition-all duration-150 ${
                  isHovered ? 'bg-gray-50' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: d.color }}
                  ></span>
                  <span className="text-[11px] text-gray-500 truncate">{d.type}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                  <span className="text-[12px] font-bold text-gray-800">{d.count}</span>
                  <span
                    className="text-[10px] font-medium px-1 py-0.5 rounded"
                    style={{ backgroundColor: `${d.color}18`, color: d.color }}
                  >
                    {d.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
