
import { useState } from 'react';
import { YOLO_CLASSES } from '../../../mocks/annotationData';
import { BBox } from './AnnotationCanvas';
import { Category } from './CategoryManager';
import { api as apiClient } from '../../../api/client';

interface AIPreAnnotationProps {
  categories: Category[];
  onAnnotationsGenerated: (annotations: BBox[]) => void;
  onClose: () => void;
  datasetName?: string;   // 当前数据集名
  imageFilename?: string; // 当前图片文件名
}

export default function AIPreAnnotation({
  categories,
  onAnnotationsGenerated,
  onClose,
  datasetName,
  imageFilename,
}: AIPreAnnotationProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    categories.map((c) => c.name)
  );
  const [confidence, setConfidence] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchText, setSearchText] = useState('');

  const filteredClasses = YOLO_CLASSES.filter((c) =>
    c.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleRun = async () => {
    try {
      setRunning(true);
      setProgress(10);

      // 有真实数据集和图片时调用后端 API
      if (datasetName && imageFilename) {
        setProgress(30);
        const result = await apiClient.post<{ labels: string[]; count: number }>(
          `/api/v1/datasets/${datasetName}/images/${imageFilename}/auto-label?confidence=${confidence}`,
        );
        setProgress(90);
        const { labels } = result;

        // 将 YOLO 格式标注转换为 BBox
        const generated: BBox[] = labels.map((line, i) => {
          const [cls, cx, cy, w, h] = line.split(' ').map(Number);
          const cat = categories[cls] ?? categories[0];
          return {
            id: `ai-${Date.now()}-${i}`,
            categoryId: cat?.id ?? String(cls),
            x: cx - w / 2,
            y: cy - h / 2,
            width: w,
            height: h,
          };
        });
        setProgress(100);
        onAnnotationsGenerated(generated);
      } else {
        // fallback: mock（未选数据集时）
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((r) => setTimeout(r, 80));
          setProgress(i);
        }
        const matchedCats = categories.filter((c) => selectedClasses.includes(c.name));
        if (matchedCats.length === 0) { setRunning(false); return; }
        const generated: BBox[] = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => {
          const cat = matchedCats[Math.floor(Math.random() * matchedCats.length)];
          const x = Math.random() * 0.6 + 0.05, y = Math.random() * 0.6 + 0.05;
          const w = Math.random() * 0.2 + 0.08, h = Math.random() * 0.2 + 0.08;
          return { id: `ai-${Date.now()}-${i}`, categoryId: cat.id, x: Math.min(x, 1 - w), y: Math.min(y, 1 - h), width: w, height: h };
        });
        onAnnotationsGenerated(generated);
      }
    } catch (error) {
      console.error('AI pre-annotation failed:', error);
    } finally {
      setRunning(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center bg-emerald-50 rounded-lg">
              <i className="ri-robot-line text-emerald-500 text-[15px]"></i>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900">
                AI 辅助预标注
              </h3>
              <p className="text-[10px] text-gray-400">
                使用 YOLO 模型自动检测目标
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-close-line text-gray-500 text-[16px]"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-gray-700">
                置信度阈值
              </span>
              <span className="text-[13px] font-bold text-emerald-600">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.95}
              step={0.05}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>低 (更多检测)</span>
              <span>高 (更精准)</span>
            </div>
          </div>

          {/* Class selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-gray-700">
                检测类别
                <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                  已选 {selectedClasses.length} / {YOLO_CLASSES.length}
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClasses([...YOLO_CLASSES])}
                  className="text-[10px] text-[#0052d9] hover:underline cursor-pointer"
                >
                  全选
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedClasses([])}
                  className="text-[10px] text-gray-500 hover:underline cursor-pointer"
                >
                  清空
                </button>
              </div>
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索类别..."
              className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-emerald-400 mb-2"
            />
            <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto p-1">
              {filteredClasses.map((cls) => {
                const isSelected = selectedClasses.includes(cls);
                const matchedCat = categories.find((c) => c.name === cls);
                return (
                  <button
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={
                      isSelected
                        ? { background: matchedCat?.color ?? '#10b981' }
                        : {}
                    }
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          {running ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <i className="ri-loader-4-line animate-spin text-emerald-500"></i>
                  AI 检测中...
                </span>
                <span className="text-emerald-600 font-semibold">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-[12px] text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={handleRun}
                disabled={selectedClasses.length === 0}
                className="flex-1 py-2.5 text-[12px] bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-magic-line mr-1.5"></i>
                开始 AI 预标注
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
