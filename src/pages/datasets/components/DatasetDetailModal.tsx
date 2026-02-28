
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

interface DatasetDetailModalProps {
  dataset: Dataset;
  onClose: () => void;
}

const CLASS_COLORS = [
  'bg-red-100 text-red-600',
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
  'bg-teal-100 text-teal-600',
  'bg-violet-100 text-violet-600',
  'bg-pink-100 text-pink-600',
  'bg-orange-100 text-orange-600',
  'bg-cyan-100 text-cyan-600',
];

export default function DatasetDetailModal({
  dataset,
  onClose,
}: DatasetDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'images' | 'classes'>(
    'overview',
  );
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const labelRate =
    dataset.imageCount > 0
      ? Math.round((dataset.labeledCount / dataset.imageCount) * 100)
      : 0;

  const splitTotal = dataset.trainCount + dataset.valCount + dataset.testCount;
  const trainPct = splitTotal > 0 ? Math.round((dataset.trainCount / splitTotal) * 100) : 70;
  const valPct = splitTotal > 0 ? Math.round((dataset.valCount / splitTotal) * 100) : 20;
  const testPct = splitTotal > 0 ? Math.round((dataset.testCount / splitTotal) * 100) : 10;

  const mockImages = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    src: dataset.previewImages[i % dataset.previewImages.length],
    labeled: i < Math.floor((12 * labelRate) / 100),
  }));

  // Helper to safely split datetime strings
  const formatDate = (dateStr: string) => {
    try {
      return dateStr.split(' ')[0];
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-[780px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#f0f1f3]">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1 truncate">
              {dataset.name}
            </h2>
            <p className="text-[11px] text-gray-400 line-clamp-1">{dataset.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line text-gray-500 text-[16px]"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#f0f1f3]">
          {[
            { key: 'overview', label: '概览', icon: 'ri-bar-chart-box-line' },
            { key: 'images', label: '图片预览', icon: 'ri-image-2-line' },
            { key: 'classes', label: '类别管理', icon: 'ri-price-tag-3-line' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap -mb-px ${
                activeTab === tab.key
                  ? 'border-[#0052d9] text-[#0052d9] font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={`${tab.icon} text-[13px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Key Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: '图片总数',
                    value: dataset.imageCount.toLocaleString(),
                    icon: 'ri-image-2-line',
                    color: 'text-[#0052d9]',
                    bg: 'bg-[#0052d9]/8',
                  },
                  {
                    label: '已标注',
                    value: dataset.labeledCount.toLocaleString(),
                    icon: 'ri-price-tag-3-line',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                  {
                    label: '类别数',
                    value: String(dataset.classCount),
                    icon: 'ri-list-check-2',
                    color: 'text-violet-600',
                    bg: 'bg-violet-50',
                  },
                  {
                    label: '文件大小',
                    value: dataset.size,
                    icon: 'ri-hard-drive-2-line',
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#f8f9fb] rounded-xl p-3.5">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                      <i className={`${stat.icon} ${stat.color} text-[15px]`}></i>
                    </div>
                    <div className="text-[18px] font-semibold text-gray-900">{stat.value}</div>
                    <div className="text-[10px] text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Label Progress */}
              <div className="bg-[#f8f9fb] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-gray-700">标注进度</span>
                  <span className="text-[12px] font-semibold text-gray-900">{labelRate}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${labelRate}%`,
                      background: labelRate === 100 ? '#10b981' : '#0052d9',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>已标注 {dataset.labeledCount.toLocaleString()} 张</span>
                  <span>未标注 {(dataset.imageCount - dataset.labeledCount).toLocaleString()} 张</span>
                </div>
              </div>

              {/* Dataset Split */}
              <div className="bg-[#f8f9fb] rounded-xl p-4">
                <h4 className="text-[12px] font-medium text-gray-700 mb-3">数据集划分</h4>
                <div className="flex h-3 rounded-full overflow-hidden mb-3">
                  <div className="bg-[#0052d9]" style={{ width: `${trainPct}%` }}></div>
                  <div className="bg-amber-400" style={{ width: `${valPct}%` }}></div>
                  <div className="bg-emerald-400" style={{ width: `${testPct}%` }}></div>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0052d9] inline-block"></span>
                    <span className="text-gray-600">训练集 {trainPct}%</span>
                    <span className="text-gray-400">({dataset.trainCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                    <span className="text-gray-600">验证集 {valPct}%</span>
                    <span className="text-gray-400">({dataset.valCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
                    <span className="text-gray-600">测试集 {testPct}%</span>
                    <span className="text-gray-400">({dataset.testCount})</span>
                  </span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-[#f8f9fb] rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">格式</span>
                    <span className="font-medium text-gray-700">{dataset.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">创建时间</span>
                    <span className="font-medium text-gray-700">{formatDate(dataset.createdAt)}</span>
                  </div>
                </div>
                <div className="bg-[#f8f9fb] rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">更新时间</span>
                    <span className="font-medium text-gray-700">{formatDate(dataset.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">标签</span>
                    <span className="font-medium text-gray-700">{dataset.tags.join('、')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-gray-500">
                  共 {dataset.imageCount.toLocaleString()} 张图片，展示前 12 张预览
                </span>
                <span className="text-[11px] text-gray-400">绿色边框 = 已标注</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {mockImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      img.labeled ? 'border-emerald-400' : 'border-gray-200'
                    }`}
                    style={{ height: 110 }}
                  >
                    {!imgErrors[img.id] ? (
                      <img
                        src={img.src}
                        alt={`img-${img.id}`}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [img.id]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <i className="ri-image-line text-gray-300 text-[24px]"></i>
                      </div>
                    )}
                    {img.labeled && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-[9px]"></i>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-0.5">
                      <span className="text-[9px] text-white">
                        img_{String(img.id + 1).padStart(4, '0')}.jpg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-gray-500">
                  共 {dataset.classCount} 个标注类别
                </span>
              </div>
              {dataset.classes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {dataset.classes.map((cls, i) => (
                    <div key={cls} className="flex items-center gap-3 bg-[#f8f9fb] rounded-xl p-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                          CLASS_COLORS[i % CLASS_COLORS.length]
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-gray-800 truncate">{cls}</div>
                        <div className="text-[10px] text-gray-400">class_id: {i}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          CLASS_COLORS[i % CLASS_COLORS.length]
                        }`}
                      >
                        #{i}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <i className="ri-price-tag-3-line text-[36px] text-gray-200"></i>
                  </div>
                  <p className="text-[12px]">暂无类别信息，请先完成数据标注</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#f0f1f3]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] text-gray-600 bg-[#f0f1f3] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            关闭
          </button>
          <button className="px-4 py-2 text-[12px] text-white bg-[#0052d9] hover:bg-[#0041b0] rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5">
            <i className="ri-play-circle-line text-[13px]"></i>
            开始训练
          </button>
        </div>
      </div>
    </div>
  );
}
