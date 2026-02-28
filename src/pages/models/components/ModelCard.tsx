import { useState } from 'react';

interface ModelCardProps {
  model: {
    id: string;
    name: string;
    version: string;
    size: string;
    type: string;
    fileSize: string;
    parameters: string;
    mAP50: number;
    mAP5095: number;
    speed: string;
    description: string;
    downloaded: boolean;
    lastUsed: string | null;
    trainedOn: string;
    classes: number;
    trainDate?: string;
    baseModel?: string;
  };
  onDownload: (id: string) => void;
  onExport: (id: string) => void;
  onViewDetail: (id: string) => void;
  onCompare: (id: string, checked: boolean) => void;
  isComparing: boolean;
  isSelected: boolean;
}

export default function ModelCard({ model, onDownload, onExport, onViewDetail, onCompare, isComparing, isSelected }: ModelCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await onDownload(model.id);
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all shadow-sm hover:shadow-lg ${isSelected ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-100 hover:border-gray-200'}`}>
      <div className="p-5">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[16px] font-semibold text-gray-900">{model.name}</h3>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                model.type === 'pretrained' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'bg-purple-50 text-purple-700'
              }`}>
                {model.type === 'pretrained' ? '预训练' : '自训练'}
              </span>
              {model.downloaded && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-50 text-green-700 whitespace-nowrap">
                  已下载
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-600 line-clamp-2">{model.description}</p>
          </div>
          {isComparing && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onCompare(model.id, e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded cursor-pointer ml-3"
            />
          )}
        </div>

        {/* 指标网格 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 mb-1">mAP50</div>
            <div className="text-[17px] font-semibold text-gray-900">{model.mAP50}%</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 mb-1">mAP50-95</div>
            <div className="text-[17px] font-semibold text-gray-900">{model.mAP5095}%</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 mb-1">参数量</div>
            <div className="text-[12px] font-medium text-gray-900">{model.parameters}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 mb-1">推理速度</div>
            <div className="text-[12px] font-medium text-gray-900">{model.speed}</div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="space-y-2 mb-4 text-[12px]">
          <div className="flex justify-between">
            <span className="text-gray-500">文件大小</span>
            <span className="text-gray-900 font-medium">{model.fileSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">类别数量</span>
            <span className="text-gray-900 font-medium">{model.classes} 类</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">训练数据</span>
            <span className="text-gray-900 font-medium">{model.trainedOn}</span>
          </div>
          {model.lastUsed && (
            <div className="flex justify-between">
              <span className="text-gray-500">最后使用</span>
              <span className="text-gray-900 font-medium">{model.lastUsed}</span>
            </div>
          )}
          {model.trainDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">训练日期</span>
              <span className="text-gray-900 font-medium">{model.trainDate}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetail(model.id)}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[12px] font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            查看详情
          </button>
          {!model.downloaded ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl text-[12px] font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
            >
              {downloading ? '下载中...' : '下载模型'}
            </button>
          ) : (
            <button
              onClick={() => onExport(model.id)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl text-[12px] font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
            >
              导出模型
            </button>
          )}
        </div>
      </div>
    </div>
  );
}