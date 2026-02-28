import { useState } from 'react';

interface Dataset {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  labeledCount: number;
  classCount: number;
  classes: string[];
  size: string;
  format: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  trainCount: number;
  valCount: number;
  testCount: number;
  tags: string[];
  previewImages: string[];
}

interface DatasetCardProps {
  dataset: Dataset;
  onView: (dataset: Dataset) => void;
  onDelete: (dataset: Dataset) => void;
}

/** Configuration for dataset status display */
const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  ready: {
    label: '就绪',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: 'ri-checkbox-circle-line',
  },
  processing: {
    label: '解析中',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: 'ri-loader-4-line',
  },
  pending: {
    label: '待标注',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    icon: 'ri-time-line',
  },
  error: {
    label: '错误',
    color: 'text-red-500',
    bg: 'bg-red-50',
    icon: 'ri-error-warning-line',
  },
};

export default function DatasetCard({
  dataset,
  onView,
  onDelete,
}: DatasetCardProps) {
  /** Track which preview images failed to load */
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  /** Resolve status configuration safely */
  const status = statusConfig[dataset.status] ?? statusConfig.pending;

  /** Calculate labeling progress percentage */
  const labelRate =
    dataset.imageCount > 0
      ? Math.round((dataset.labeledCount / dataset.imageCount) * 100)
      : 0;

  /** Helper to safely handle image load errors */
  const handleImgError = (index: number) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all group">
      {/* Preview Images */}
      <div className="grid grid-cols-4 gap-0.5 h-[90px] bg-gray-100">
        {dataset.previewImages.slice(0, 4).map((img, i) => (
          <div key={i} className="relative overflow-hidden bg-gray-200">
            {!imgErrors[i] ? (
              <img
                src={img}
                alt={`preview-${i}`}
                className="w-full h-full object-cover"
                onError={() => handleImgError(i)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <i className="ri-image-line text-gray-300 text-[18px]"></i>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-1 flex-1">
            {dataset.name}
          </h3>
          <span
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap flex-shrink-0
              ${status.bg} ${status.color}
            `}
          >
            <i
              className={`
                ${status.icon} text-[11px] ${dataset.status === 'processing' ? 'animate-spin' : ''}
              `}
            ></i>
            {status.label}
          </span>
        </div>

        <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {dataset.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-[15px] font-semibold text-gray-900">
              {dataset.imageCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400">图片数量</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-[15px] font-semibold text-gray-900">
              {dataset.classCount}
            </div>
            <div className="text-[10px] text-gray-400">类别数</div>
          </div>
          <div className="text-center">
            <div className="text-[15px] font-semibold text-gray-900">
              {dataset.size}
            </div>
            <div className="text-[10px] text-gray-400">文件大小</div>
          </div>
        </div>

        {/* Label Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">标注进度</span>
            <span className="text-[10px] font-medium text-gray-700">
              {labelRate}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${labelRate}%`,
                background:
                  labelRate === 100
                    ? '#10b981'
                    : labelRate > 50
                    ? '#7c3aed'
                    : '#f59e0b',
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dataset.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-50 text-[10px] text-gray-500 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">
            {dataset.createdAt.split(' ')[0]}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(dataset)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-eye-line text-[12px]"></i>
              查看
            </button>
            <button
              onClick={() => onDelete(dataset)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line text-[12px]"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}