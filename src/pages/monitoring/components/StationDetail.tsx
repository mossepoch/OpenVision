import { useEffect, useRef, useState } from 'react';

interface Props {
  stationId: string;
  onBack: () => void;
}

interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface DetectionResult {
  boxes: Detection[];
  count: number;
  inference_ms: number;
  model: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

export default function StationDetail({ stationId, onBack }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);

  // 检测结果
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const url = `${WS_BASE}/api/v1/stream/${stationId}/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); setError(''); };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'frame' && imgRef.current) {
          imgRef.current.src = `data:image/jpeg;base64,${msg.data}`;
          frameCountRef.current += 1;
        } else if (msg.type === 'error') {
          setError(msg.message || '推流错误');
        }
      } catch { /* ignore */ }
    };
    ws.onerror = () => setError('WebSocket 连接失败');
    ws.onclose = () => setConnected(false);

    const fpsTimer = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => { ws.close(); clearInterval(fpsTimer); };
  }, [stationId]);

  // 触发快照检测
  const handleDetect = async () => {
    setDetecting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/api/v1/detection/snapshot/${stationId}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDetection(data);
      }
    } catch { /* ignore */ } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer text-[13px]">
          <i className="ri-arrow-left-line text-[16px]"></i>返回
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[12px] text-gray-400">{connected ? `LIVE · ${fps} fps` : '未连接'}</span>
        </div>
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="px-3 py-1.5 text-[12px] bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          {detecting ? '检测中...' : '🔍 快照检测'}
        </button>
        <span className="text-[12px] text-gray-500">设备 #{stationId}</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center relative bg-black">
          {error ? (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <i className="ri-camera-off-line text-[48px]"></i>
              <p className="text-[13px]">{error}</p>
            </div>
          ) : (
            <>
              <img ref={imgRef} alt="实时视频流" className="max-w-full max-h-full object-contain" style={{ display: connected ? 'block' : 'none' }} />
              {!connected && (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <i className="ri-loader-4-line text-[48px] animate-spin"></i>
                  <p className="text-[13px]">正在连接摄像头...</p>
                </div>
              )}
            </>
          )}
          {connected && !error && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 rounded-full">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[11px] font-medium text-white">LIVE</span>
            </div>
          )}
        </div>

        {/* Detection Panel */}
        {detection && (
          <div className="w-64 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto flex-shrink-0">
            <div className="text-[13px] font-semibold text-white mb-3">检测结果</div>
            <div className="text-[11px] text-gray-500 mb-3">
              {detection.count} 个目标 · {detection.inference_ms.toFixed(0)}ms · {detection.model}
            </div>
            {detection.boxes.length === 0 ? (
              <div className="text-[12px] text-gray-500">未检测到目标</div>
            ) : (
              <div className="space-y-2">
                {detection.boxes.map((box, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-white font-medium">{box.label}</span>
                      <span className="text-[11px] text-emerald-400">{(box.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      [{box.bbox.map(v => Math.round(v)).join(', ')}]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
