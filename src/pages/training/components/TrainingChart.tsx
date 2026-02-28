
import { useMemo } from 'react';

interface LossPoint {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  mAP50: number;
}

interface TrainingChartProps {
  data: LossPoint[];
  totalEpochs: number;
}

/**
 * TrainingChart renders a simple line chart for training loss, validation loss and mAP50.
 * It guards against missing or insufficient data and memoises the heavy calculations.
 */
export default function TrainingChart({ data, totalEpochs }: TrainingChartProps) {
  // Fixed dimensions – the component is responsive via `width="100%"` on the <svg>
  const W = 520;
  const H = 160;
  const PAD = { top: 12, right: 16, bottom: 28, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  /**
   * Compute all drawing data in a memoised block.
   * Returns a safe fallback object when `data` is missing or too short.
   */
  const {
    lossPath,
    valPath,
    mapPath,
    yTicks,
    xTicks,
    maxLoss,
    maxMap,
  } = useMemo(() => {
    // Guard – we need at least two points to draw a line
    if (!Array.isArray(data) || data.length < 2) {
      return {
        lossPath: '',
        valPath: '',
        mapPath: '',
        yTicks: [] as const,
        xTicks: [] as const,
        maxLoss: 1,
        maxMap: 1,
      };
    }

    // Determine scaling factors with a 10 % head‑room
    const maxL = Math.max(...data.map(d => Math.max(d.trainLoss, d.valLoss))) * 1.1;
    const maxM = Math.max(...data.map(d => d.mAP50)) * 1.1;
    const maxEpoch = totalEpochs || Math.max(...data.map(d => d.epoch));

    // Scale helpers – keep them pure functions
    const xScale = (epoch: number) => PAD.left + (epoch / maxEpoch) * chartW;
    const yScaleLoss = (v: number) => PAD.top + chartH - (v / maxL) * chartH;
    const yScaleMap = (v: number) => PAD.top + chartH - (v / maxM) * chartH;

    // Convert an array of points to an SVG path string
    const toPath = (pts: { x: number; y: number }[]) =>
      pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');

    const lossPath = toPath(data.map(d => ({ x: xScale(d.epoch), y: yScaleLoss(d.trainLoss) })));
    const valPath = toPath(data.map(d => ({ x: xScale(d.epoch), y: yScaleLoss(d.valLoss) })));
    const mapPath = toPath(data.map(d => ({ x: xScale(d.epoch), y: yScaleMap(d.mAP50) })));

    // Y‑axis ticks (0 % – 100 % of the chart height)
    const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(t => ({
      label: t.toFixed(2),
      y: PAD.top + chartH - t * chartH,
    }));

    // X‑axis ticks – step adapts to the total epoch count
    const step = totalEpochs <= 50 ? 10 : totalEpochs <= 100 ? 20 : 30;
    const xTicks: { label: string; x: number }[] = [];
    for (let e = 0; e <= totalEpochs; e += step) {
      xTicks.push({ label: String(e), x: xScale(e) });
    }

    return { lossPath, valPath, mapPath, yTicks, xTicks, maxLoss: maxL, maxMap: maxM };
  }, [data, totalEpochs]);

  // Render a placeholder when there is not enough data to draw a chart
  if (!Array.isArray(data) || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-[160px] text-gray-300 text-[12px]">
        <i className="ri-bar-chart-2-line text-[28px] mr-2"></i>
        暂无训练数据
      </div>
    );
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid lines */}
      {yTicks.map(t => (
        <line
          key={t.label}
          x1={PAD.left}
          y1={t.y}
          x2={PAD.left + chartW}
          y2={t.y}
          stroke="#f0f1f3"
          strokeWidth="1"
        />
      ))}

      {/* Y‑axis labels */}
      {yTicks.map(t => (
        <text
          key={t.label}
          x={PAD.left - 6}
          y={t.y + 4}
          textAnchor="end"
          fontSize="9"
          fill="#9ca3af"
        >
          {t.label}
        </text>
      ))}

      {/* X‑axis labels */}
      {xTicks.map(t => (
        <text
          key={t.label}
          x={t.x}
          y={H - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          {t.label}
        </text>
      ))}

      {/* Gradient for the mAP50 area (currently unused but kept for future enhancement) */}
      <defs>
        <linearGradient id="mapGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Loss lines */}
      <path d={lossPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d={valPath}
        fill="none"
        stroke="#f97316"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeDasharray="4 2"
      />

      {/* mAP line */}
      <path d={mapPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />

      {/* Legend */}
      <g transform={`translate(${PAD.left + 4}, ${PAD.top + 4})`}>
        <rect width="8" height="2" y="3" fill="#f59e0b" rx="1" />
        <text x="12" y="8" fontSize="9" fill="#6b7280">
          训练Loss
        </text>

        <rect width="8" height="2" y="3" x="62" fill="#f97316" rx="1" />
        <text x="74" y="8" fontSize="9" fill="#6b7280">
          验证Loss
        </text>

        <rect width="8" height="2" y="3" x="124" fill="#10b981" rx="1" />
        <text x="136" y="8" fontSize="9" fill="#6b7280">
          mAP50
        </text>
      </g>
    </svg>
  );
}
