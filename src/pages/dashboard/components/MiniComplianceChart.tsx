
import { useRef, useEffect, useState } from 'react';

interface CompliancePoint {
  date: string;
  compliance: number;
  tasks: number;
}

interface HourlyPoint {
  hour: string;
  count: number;
}

interface Props {
  data: CompliancePoint[];
  hourlyData: HourlyPoint[];
}

type Tab = 'compliance' | 'hourly';

interface TooltipInfo {
  x: number;
  y: number;
  point: CompliancePoint;
  index: number;
}

const LINE_COLORS = {
  compliance: '#7c3aed',
  tasks: '#10b981',
  alerts: '#f97316',
};

export default function MiniComplianceChart({ data, hourlyData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 150 });
  const [activeTab, setActiveTab] = useState<Tab>('compliance');
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padL = 36;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const { width: W, height: H } = size;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // compliance line
  const minC = Math.min(...data.map(d => d.compliance)) - 2;
  const maxC = Math.max(...data.map(d => d.compliance)) + 2;
  const rangeC = maxC - minC || 1;

  // tasks line (normalize to same scale visually)
  const maxT = Math.max(...data.map(d => d.tasks));
  const minT = 0;
  const rangeT = maxT - minT || 1;

  // mock alerts per day
  const alertsData = [3, 5, 2, 4, 6, 3, 5];

  const maxA = Math.max(...alertsData);
  const minA = 0;
  const rangeA = maxA - minA || 1;

  const getX = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const getYC = (v: number) => padT + (1 - (v - minC) / rangeC) * chartH;
  const getYT = (v: number) => padT + (1 - (v - minT) / rangeT) * chartH;
  const getYA = (v: number) => padT + (1 - (v - minA) / rangeA) * chartH;

  const compPoints = data.map((d, i) => ({ x: getX(i), y: getYC(d.compliance), ...d }));
  const taskPoints = data.map((d, i) => ({ x: getX(i), y: getYT(d.tasks) }));
  const alertPoints = alertsData.map((v, i) => ({ x: getX(i), y: getYA(v), v }));

  const makeLine = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const makeArea = (pts: { x: number; y: number }[]) => {
    const line = makeLine(pts);
    return `${line} L ${(padL + chartW).toFixed(1)} ${(padT + chartH).toFixed(1)} L ${padL.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;
  };

  const yGridCount = 4;
  const yGridLabels = Array.from({ length: yGridCount + 1 }, (_, i) => {
    const val = minC + (rangeC * i) / yGridCount;
    return { val, y: padT + (1 - i / yGridCount) * chartH };
  });

  const maxCount = Math.max(...hourlyData.map(d => d.count));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-bold text-gray-800">趋势分析</h3>
          {activeTab === 'compliance' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className="inline-block w-5 h-0.5 rounded-full" style={{ backgroundColor: LINE_COLORS.compliance }}></span>
                合规率
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className="inline-block w-5 h-0.5 rounded-full" style={{ backgroundColor: LINE_COLORS.tasks }}></span>
                任务数
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className="inline-block w-5 h-0.5 rounded-full" style={{ backgroundColor: LINE_COLORS.alerts }}></span>
                告警数
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[#f4f3ff] rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-2.5 py-1 text-[12px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
              activeTab === 'compliance' ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            合规率
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-2.5 py-1 text-[12px] rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
              activeTab === 'hourly' ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            时段分布
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 relative">
        {activeTab === 'compliance' ? (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setTooltip(null)}
          >
            <defs>
              <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLORS.compliance} stopOpacity="0.15" />
                <stop offset="100%" stopColor={LINE_COLORS.compliance} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLORS.tasks} stopOpacity="0.12" />
                <stop offset="100%" stopColor={LINE_COLORS.tasks} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLORS.alerts} stopOpacity="0.12" />
                <stop offset="100%" stopColor={LINE_COLORS.alerts} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yGridLabels.map((g, i) => (
              <g key={i}>
                <line x1={padL} y1={g.y} x2={padL + chartW} y2={g.y} stroke="#f0f1f3" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padL - 4} y={g.y + 3.5} textAnchor="end" fontSize="9" fill="#c4c9d4">{g.val.toFixed(0)}%</text>
              </g>
            ))}

            {/* X axis labels */}
            {data.map((d, i) => (
              <text key={i} x={getX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#c4c9d4">{d.date}</text>
            ))}

            {/* Area fills */}
            <path d={makeArea(taskPoints)} fill="url(#gradT)" />
            <path d={makeArea(alertPoints)} fill="url(#gradA)" />
            <path d={makeArea(compPoints)} fill="url(#gradC)" />

            {/* Lines */}
            <path d={makeLine(taskPoints)} fill="none" stroke={LINE_COLORS.tasks} strokeWidth="1.5" strokeLinejoin="round" />
            <path d={makeLine(alertPoints)} fill="none" stroke={LINE_COLORS.alerts} strokeWidth="1.5" strokeLinejoin="round" />
            <path d={makeLine(compPoints)} fill="none" stroke={LINE_COLORS.compliance} strokeWidth="2" strokeLinejoin="round" />

            {/* Hover vertical line */}
            {tooltip && (
              <line
                x1={tooltip.x} y1={padT}
                x2={tooltip.x} y2={padT + chartH}
                stroke="#7c3aed" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
              />
            )}

            {/* Dots */}
            {compPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={tooltip?.index === i ? 4 : 3}
                fill="white" stroke={LINE_COLORS.compliance} strokeWidth="2" />
            ))}
            {taskPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={tooltip?.index === i ? 3.5 : 2.5}
                fill="white" stroke={LINE_COLORS.tasks} strokeWidth="1.5" />
            ))}
            {alertPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={tooltip?.index === i ? 3.5 : 2.5}
                fill="white" stroke={LINE_COLORS.alerts} strokeWidth="1.5" />
            ))}

            {/* Invisible hover zones */}
            {data.map((d, i) => (
              <rect
                key={i}
                x={getX(i) - chartW / (data.length - 1) / 2}
                y={padT}
                width={chartW / (data.length - 1)}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setTooltip({ x: getX(i), y: getYC(d.compliance), point: d, index: i })}
              />
            ))}

            {/* Tooltip */}
            {tooltip && (() => {
              const tx = tooltip.x + 10;
              const ty = Math.max(padT + 4, tooltip.y - 40);
              const bw = 110;
              const bh = 58;
              const adjustedTx = tx + bw > W - padR ? tooltip.x - bw - 10 : tx;
              return (
                <g>
                  <rect x={adjustedTx} y={ty} width={bw} height={bh} rx="6" fill="#1e1b4b" opacity="0.92" />
                  <text x={adjustedTx + 8} y={ty + 14} fontSize="10" fill="white" fontWeight="600">{tooltip.point.date}</text>
                  <circle cx={adjustedTx + 10} cy={ty + 26} r="3" fill={LINE_COLORS.compliance} />
                  <text x={adjustedTx + 17} y={ty + 29} fontSize="9.5" fill="#e0d9ff">合规率</text>
                  <text x={adjustedTx + bw - 8} y={ty + 29} textAnchor="end" fontSize="9.5" fill="white" fontWeight="600">{tooltip.point.compliance}%</text>
                  <circle cx={adjustedTx + 10} cy={ty + 40} r="3" fill={LINE_COLORS.tasks} />
                  <text x={adjustedTx + 17} y={ty + 43} fontSize="9.5" fill="#e0d9ff">任务数</text>
                  <text x={adjustedTx + bw - 8} y={ty + 43} textAnchor="end" fontSize="9.5" fill="white" fontWeight="600">{tooltip.point.tasks}</text>
                  <circle cx={adjustedTx + 10} cy={ty + 54} r="3" fill={LINE_COLORS.alerts} />
                  <text x={adjustedTx + 17} y={ty + 57} fontSize="9.5" fill="#e0d9ff">告警数</text>
                  <text x={adjustedTx + bw - 8} y={ty + 57} textAnchor="end" fontSize="9.5" fill="white" fontWeight="600">{alertsData[tooltip.index]}</text>
                </g>
              );
            })()}
          </svg>
        ) : (
          <div className="flex items-end gap-1 h-full px-1 pb-5 pt-2">
            {hourlyData.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <span className="text-[9px] text-gray-400">{hoveredBar === i ? d.count : ''}</span>
                <div
                  className="w-full rounded-t min-h-[3px] transition-all duration-150"
                  style={{
                    height: `${(d.count / maxCount) * 75}%`,
                    background: hoveredBar === i
                      ? 'linear-gradient(to top, #7c3aed, #a78bfa)'
                      : 'linear-gradient(to top, #7c3aed80, #7c3aed30)',
                  }}
                />
                <span className="text-[8px] text-gray-300 whitespace-nowrap">{d.hour.slice(0, 5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
