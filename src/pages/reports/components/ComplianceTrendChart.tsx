import { useRef, useEffect, useState } from 'react';
import { complianceTrendData } from '../../../mocks/reportsData';

export default function ComplianceTrendChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 160 });

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

  const maxTasks = Math.max(...complianceTrendData.map(d => d.tasks));
  const minCompliance = Math.min(...complianceTrendData.map(d => d.compliance));
  const maxCompliance = Math.max(...complianceTrendData.map(d => d.compliance));
  const complianceRange = maxCompliance - minCompliance || 1;

  const padL = 32;
  const padR = 8;
  const padT = 10;
  const padB = 24;
  const { width: W, height: H } = size;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const points = complianceTrendData.map((d, i) => {
    const x = padL + (i / (complianceTrendData.length - 1)) * chartW;
    const y = padT + (1 - (d.compliance - minCompliance) / complianceRange) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${(padL + chartW).toFixed(2)} ${(padT + chartH).toFixed(2)} L ${padL.toFixed(2)} ${(padT + chartH).toFixed(2)} Z`;

  const yLabels = [maxCompliance, (maxCompliance + minCompliance) / 2, minCompliance];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-800">合规趋势</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0052d9]"></span>合规率
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0052d9]/30"></span>任务数
          </span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative min-h-0">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="complianceGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052d9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0052d9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y labels */}
          {yLabels.map((val, i) => {
            const y = padT + (i / (yLabels.length - 1)) * chartH;
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="#e5e7eb" strokeDasharray="4 3" strokeWidth="1" />
                <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af">{val.toFixed(0)}%</text>
              </g>
            );
          })}

          {/* Bar chart */}
          {complianceTrendData.map((d, i) => {
            const barW = Math.min(20, chartW / complianceTrendData.length * 0.5);
            const x = padL + (i / (complianceTrendData.length - 1)) * chartW;
            const barH = (d.tasks / maxTasks) * chartH * 0.65;
            return (
              <rect
                key={i}
                x={x - barW / 2}
                y={padT + chartH - barH}
                width={barW}
                height={barH}
                fill="#0052d9"
                fillOpacity="0.08"
                rx="2"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#complianceGradient2)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#0052d9" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#0052d9" strokeWidth="1.5" />
          ))}

          {/* X axis labels */}
          {complianceTrendData.map((d, i) => {
            const x = padL + (i / (complianceTrendData.length - 1)) * chartW;
            return (
              <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.date}</text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
