
import { useState, useRef } from 'react';

interface ExtractedFrame {
  id: string;
  name: string;
  url: string;
  timestamp: number;
}

interface VideoFrameExtractorProps {
  onFramesExtracted: (frames: ExtractedFrame[]) => void;
  onClose: () => void;
}

export default function VideoFrameExtractor({
  onFramesExtracted,
  onClose,
}: VideoFrameExtractorProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractMode, setExtractMode] = useState<'fps' | 'count'>('fps');
  const [fps, setFps] = useState(1);
  const [frameCount, setFrameCount] = useState(20);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedFrame[]>([]);
  const [step, setStep] = useState<'upload' | 'config' | 'result'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStep('config');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('video/')) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStep('config');
  };

  const handleExtract = async () => {
    if (!videoRef.current || !videoUrl) return;
    setExtracting(true);
    setProgress(0);

    const video = videoRef.current;
    const duration = video.duration;

    const totalFrames =
      extractMode === 'fps' ? Math.floor(duration * fps) : frameCount;

    const timestamps: number[] = [];
    for (let i = 0; i < totalFrames; i++) {
      timestamps.push((i / totalFrames) * duration);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;
    const frames: ExtractedFrame[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const t = timestamps[i];
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          try {
            ctx.drawImage(video, 0, 0, 320, 240);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            frames.push({
              id: `frame-${Date.now()}-${i}`,
              name: `frame_${String(i + 1).padStart(4, '0')}.jpg`,
              url: dataUrl,
              timestamp: t,
            });
            setProgress(
              Math.round(((i + 1) / timestamps.length) * 100)
            );
          } finally {
            // Clean up listener to avoid memory leaks
            video.removeEventListener('seeked', onSeeked);
            resolve();
          }
        };
        video.addEventListener('seeked', onSeeked);
        video.currentTime = t;
      });
    }

    setExtracted(frames);
    setExtracting(false);
    setStep('result');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(
      2,
      '0'
    )}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[680px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center bg-amber-50 rounded-lg">
              <i className="ri-video-line text-amber-500 text-[15px]"></i>
            </div>
            <h3 className="text-[14px] font-semibold text-gray-900">
              视频拆帧标注
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-close-line text-gray-500 text-[16px]"></i>
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {['上传视频', '提取设置', '帧预览'].map((s, i) => {
            const stepKeys = ['upload', 'config', 'result'];
            const current = stepKeys.indexOf(step);
            const isDone = i < current;
            const isActive = i === current;
            return (
              <div key={s} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#0052d9] text-white'
                      : isDone
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                >
                  {isDone ? (
                    <i className="ri-check-line text-[12px]"></i>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                  {s}
                </div>
                {i < 2 && (
                  <i className="ri-arrow-right-s-line text-gray-300 text-[14px] mx-1"></i>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-[#0052d9]/50 hover:bg-[#0052d9]/3 transition-all"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-amber-50 rounded-2xl mx-auto mb-4">
                <i className="ri-video-upload-line text-amber-500 text-[28px]"></i>
              </div>
              <div className="text-[14px] font-semibold text-gray-700 mb-1">
                拖拽视频文件到此处
              </div>
              <div className="text-[12px] text-gray-400 mb-4">
                或点击选择文件
              </div>
              <div className="text-[11px] text-gray-300">
                支持 MP4、AVI、MOV、MKV 格式
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Step 2: Config */}
          {step === 'config' && videoUrl && (
            <div className="space-y-4">
              {/* Video preview */}
              <div className="rounded-xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full max-h-[200px] object-contain"
                />
              </div>
              <div className="text-[12px] text-gray-600 font-medium">
                <i className="ri-file-video-line mr-1 text-gray-400"></i>
                {videoFile?.name}
              </div>

              {/* Extract mode */}
              <div>
                <div className="text-[12px] font-semibold text-gray-700 mb-2">
                  提取方式
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExtractMode('fps')}
                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all cursor-pointer ${
                      extractMode === 'fps'
                        ? 'border-[#0052d9] bg-[#0052d9]/8 text-[#0052d9]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-speed-line mr-1.5"></i>按帧率提取
                  </button>
                  <button
                    onClick={() => setExtractMode('count')}
                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all cursor-pointer ${
                      extractMode === 'count'
                        ? 'border-[#0052d9] bg-[#0052d9]/8 text-[#0052d9]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-stack-line mr-1.5"></i>按总帧数提取
                  </button>
                </div>
              </div>

              {extractMode === 'fps' ? (
                <div>
                  <div className="text-[12px] font-semibold text-gray-700 mb-2">
                    每秒提取帧数 (FPS)
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.5}
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      className="flex-1 accent-[#0052d9]"
                    />
                    <span className="text-[13px] font-semibold text-[#0052d9] w-12 text-right">
                      {fps} fps
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    预计提取约{' '}
                    <span className="text-gray-600 font-medium">
                      {videoRef.current?.duration
                        ? Math.floor(videoRef.current.duration * fps)
                        : '--'}
                    </span>{' '}
                    帧
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[12px] font-semibold text-gray-700 mb-2">
                    提取总帧数
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={frameCount}
                      onChange={(e) => setFrameCount(Number(e.target.value))}
                      className="flex-1 accent-[#0052d9]"
                    />
                    <span className="text-[13px] font-semibold text-[#0052d9] w-12 text-right">
                      {frameCount} 帧
                    </span>
                  </div>
                </div>
              )}

              {/* Extract button */}
              {extracting ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-600">正在提取帧...</span>
                    <span className="text-[#0052d9] font-semibold">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0052d9] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleExtract}
                  className="w-full py-3 bg-[#0052d9] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0041b0] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-scissors-cut-line mr-2"></i>开始提取帧
                </button>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-semibold text-gray-700">
                  已提取{' '}
                  <span className="text-[#0052d9]">{extracted.length}</span>{' '}
                  帧
                </div>
                <button
                  onClick={() => setStep('config')}
                  className="text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <i className="ri-refresh-line mr-1"></i>重新提取
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                {extracted.map((frame, i) => (
                  <div
                    key={frame.id}
                    className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video"
                  >
                    <img
                      src={frame.url}
                      alt={frame.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                      <div className="text-[9px] text-white truncate">
                        {formatTime(frame.timestamp)}
                      </div>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[9px] px-1 rounded">
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'result' && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">
              将这些帧添加到标注队列
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[12px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onFramesExtracted(extracted);
                  onClose();
                }}
                className="px-4 py-2 text-[12px] bg-[#0052d9] text-white rounded-lg hover:bg-[#0041b0] cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                添加 {extracted.length} 帧到标注
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
