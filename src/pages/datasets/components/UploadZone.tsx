import { useState, useRef, useCallback, useEffect } from 'react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

/**
 * UploadZone component – handles drag‑and‑drop or click‑to‑select ZIP files,
 * shows a simulated upload progress bar and parsing steps, and reports success
 * or error states.
 *
 * Robustness improvements:
 *  - Clears the upload interval when the component unmounts or when a new file
 *    starts uploading to avoid stray timers.
 *  - Adds defensive checks & error handling for unexpected file inputs.
 *  - Guarantees `progress` never exceeds 100 % and always stays a number.
 */
export default function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'parsing' | 'done' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /** Clear any existing interval – called before starting a new upload
   *  and on component unmount. */
  const clearUploadInterval = useCallback(() => {
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
      uploadIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearUploadInterval;
  }, [clearUploadInterval]);

  /** Simulate the upload process. */
  const simulateUpload = useCallback(
    (file: File) => {
      // Defensive guard
      if (!file) return;

      // Reset any previous timer
      clearUploadInterval();

      setFileName(file.name);
      setUploadState('uploading');
      setProgress(0);

      uploadIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 15 + 5;
          if (next >= 100) {
            clearUploadInterval();
            setUploadState('parsing');
            // Ensure progress caps at 100
            setProgress(100);

            // Simulate parsing delay
            setTimeout(() => {
              setUploadState('done');
              onUpload(file);
            }, 1800);
            return 100;
          }
          return next;
        });
      }, 200);
    },
    [onUpload, clearUploadInterval]
  );

  /** Validate file type and start upload simulation. */
  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.zip')) {
        setUploadState('error');
        setFileName('仅支持 ZIP 格式文件');
        return;
      }

      simulateUpload(file);
    },
    [simulateUpload]
  );

  /** Drag‑and‑drop handlers */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  /** Input (click‑to‑select) handler */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  /** Reset component to the initial idle state */
  const handleReset = () => {
    clearUploadInterval();
    setUploadState('idle');
    setProgress(0);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-upload-cloud-2-line text-purple-600 text-[18px]"></i>
        </div>
        <h3 className="text-[13px] font-semibold text-gray-900">上传数据集</h3>
        <span className="px-2 py-0.5 bg-gray-50 text-[10px] text-gray-500 rounded-full">
          ZIP 格式
        </span>
      </div>

      {uploadState === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
          }`}
        >
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <i
              className={`ri-folder-zip-line text-[36px] ${
                isDragging ? 'text-purple-600' : 'text-gray-300'
              }`}
            ></i>
          </div>
          <p className="text-[13px] font-medium text-gray-700 mb-1">
            {isDragging ? '松开鼠标上传' : '拖拽 ZIP 文件到此处'}
          </p>
          <p className="text-[11px] text-gray-400 mb-3">或点击选择文件</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <i className="ri-checkbox-circle-line text-emerald-500"></i>
              YOLO 格式自动解析
            </span>
            <span className="flex items-center gap-1">
              <i className="ri-checkbox-circle-line text-emerald-500"></i>
              支持多数据集并行
            </span>
            <span className="flex items-center gap-1">
              <i className="ri-checkbox-circle-line text-emerald-500"></i>
              最大 10 GB
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {(uploadState === 'uploading' || uploadState === 'parsing') && (
        <div className="border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <i className="ri-folder-zip-line text-purple-600 text-[18px]"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-[10px] text-gray-400">
                {uploadState === 'uploading'
                  ? `上传中 ${Math.min(Math.round(progress), 100)}%`
                  : '正在解析 YOLO 格式标注...'}
              </p>
            </div>
            {uploadState === 'parsing' && (
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-loader-4-line text-purple-600 text-[18px] animate-spin"></i>
              </div>
            )}
          </div>

          {uploadState === 'uploading' && (
            <div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>正在上传...</span>
                <span>{Math.min(Math.round(progress), 100)}%</span>
              </div>
            </div>
          )}

          {uploadState === 'parsing' && (
            <div className="space-y-1.5">
              {['读取 ZIP 文件结构', '解析 YOLO 标注文件', '提取图像元数据'].map(
                (step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[11px] text-gray-500"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i
                        className={`${
                          i < 2
                            ? 'ri-checkbox-circle-fill text-emerald-500'
                            : 'ri-loader-4-line text-purple-600 animate-spin'
                        } text-[13px]`}
                      ></i>
                    </div>
                    {step}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {uploadState === 'done' && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-emerald-500 text-[24px]"></i>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-emerald-700">
              上传并解析成功
            </p>
            <p className="text-[10px] text-emerald-600">
              {fileName} 已添加到数据集列表
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-[11px] text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            继续上传
          </button>
        </div>
      )}

      {uploadState === 'error' && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-error-warning-fill text-red-500 text-[24px]"></i>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-red-700">上传失败</p>
            <p className="text-[10px] text-red-500">{fileName}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-[11px] text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}