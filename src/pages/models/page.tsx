import { useState, useMemo, useEffect } from 'react';
import ModelCard from './components/ModelCard';
import ModelDetailModal from './components/ModelDetailModal';
import ExportModal from './components/ExportModal';
import ComparePanel from './components/ComparePanel';
import { trainingApi, type TrainedModel } from '../../api/training';

// 将 API TrainedModel 映射为 UI 需要的模型结构
interface DisplayModel {
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
  downloadUrl: string | null;
  downloaded: boolean;
  lastUsed: string | null;
  trainedOn: string;
  classes: number;
  trainDate?: string;
  epochs?: number;
  baseModel?: string;
  customClasses?: string[];
}

function mapToDisplayModel(m: TrainedModel): DisplayModel {
  const isYolov8 = m.name.toLowerCase().includes('yolov8');
  const sizeLabel = m.name.toLowerCase().includes('nano') || m.name.includes('n.') ? 'nano'
    : m.name.toLowerCase().includes('small') || m.name.includes('s.') ? 'small'
    : m.name.toLowerCase().includes('medium') || m.name.includes('m.') ? 'medium'
    : m.name.toLowerCase().includes('large') || m.name.includes('l.') ? 'large'
    : 'nano';
  return {
    id: m.name,
    name: m.name,
    version: isYolov8 ? 'v8' : 'v8',
    size: sizeLabel,
    type: 'custom',
    fileSize: m.size_mb != null ? `${m.size_mb.toFixed(1)} MB` : '未知',
    parameters: '-',
    mAP50: 0,
    mAP5095: 0,
    speed: '-',
    description: `自训练模型 - ${m.path ?? m.name}`,
    downloadUrl: null,
    downloaded: true,
    lastUsed: m.created_at ? new Date(m.created_at * 1000).toLocaleString('zh-CN') : '-',
    trainedOn: '自定义数据集',
    classes: 0,
    trainDate: m.created_at ? new Date(m.created_at * 1000).toLocaleDateString('zh-CN') : '-',
    baseModel: m.name.split('/').pop()?.split('_')[0] ?? 'yolov8n',
  };
}

export default function ModelsPage() {
  const [rawModels, setRawModels] = useState<TrainedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [downloadedFilter, setDownloadedFilter] = useState('all');
  const [selectedModel, setSelectedModel] = useState<DisplayModel | null>(null);
  const [exportingModel, setExportingModel] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareModels, setCompareModels] = useState<string[]>([]);

  useEffect(() => {
    trainingApi.listModels().then(list => {
      setRawModels(list);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load models:', err);
      setRawModels([]);
      setLoading(false);
    });
  }, []);

  const models = useMemo(() => rawModels.map(mapToDisplayModel), [rawModels]);

  // 筛选模型
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVersion = versionFilter === 'all' || model.version === versionFilter;
      const matchType = typeFilter === 'all' || model.type === typeFilter;
      const matchSize = sizeFilter === 'all' || model.size === sizeFilter;
      const matchDownloaded = downloadedFilter === 'all' ||
        (downloadedFilter === 'downloaded' && model.downloaded) ||
        (downloadedFilter === 'not-downloaded' && !model.downloaded);
      return matchSearch && matchVersion && matchType && matchSize && matchDownloaded;
    });
  }, [models, searchQuery, versionFilter, typeFilter, sizeFilter, downloadedFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: models.length,
      pretrained: models.filter(m => m.type === 'pretrained').length,
      custom: models.filter(m => m.type === 'custom').length,
      downloaded: models.filter(m => m.downloaded).length,
      v8: models.filter(m => m.version === 'v8').length,
      v11: models.filter(m => m.version === 'v11').length,
    };
  }, [models]);

  const handleDownload = (id: string) => {
    console.log('Download model:', id);
  };

  const handleExport = (id: string) => {
    const model = models.find(m => m.id === id);
    if (model) {
      setExportingModel(model.name);
    }
  };

  const handleExportConfirm = async (format: string) => {
    console.log('导出格式:', format);
  };

  const handleCompare = (id: string, checked: boolean) => {
    if (checked) {
      if (compareModels.length < 4) {
        setCompareModels([...compareModels, id]);
      }
    } else {
      setCompareModels(compareModels.filter(m => m !== id));
    }
  };

  const compareModelsData = models.filter(m => compareModels.includes(m.id));

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* 头部 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">模型管理</h1>
            <p className="text-[13px] text-gray-400">管理预训练模型和自训练模型，支持下载、导出和对比</p>
          </div>
          <div className="flex gap-3">
            {isComparing ? (
              <>
                <button
                  onClick={() => {
                    setIsComparing(false);
                    setCompareModels([]);
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer text-[13px]"
                >
                  取消对比
                </button>
                <button
                  onClick={() => {
                    if (compareModels.length >= 2) {
                      // 显示对比面板
                    }
                  }}
                  disabled={compareModels.length < 2}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer text-[13px]"
                >
                  对比模型 ({compareModels.length})
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsComparing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer text-[13px]"
              >
                <i className="ri-git-compare-line text-[16px]"></i>
                模型对比
              </button>
            )}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: '全部模型', value: stats.total, icon: 'ri-cpu-fill', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
            { label: '预训练模型', value: stats.pretrained, icon: 'ri-download-cloud-fill', bg: 'bg-sky-50', iconColor: 'text-sky-500' },
            { label: '自训练模型', value: stats.custom, icon: 'ri-settings-3-fill', bg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
            { label: '已下载', value: stats.downloaded, icon: 'ri-checkbox-circle-fill', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
            { label: 'YOLOv8', value: stats.v8, icon: 'ri-flashlight-fill', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
            { label: 'YOLOv11', value: stats.v11, icon: 'ri-rocket-fill', bg: 'bg-rose-50', iconColor: 'text-rose-500' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <i className={`${s.icon} ${s.iconColor} text-[18px]`}></i>
              </div>
              <div className="text-[22px] font-semibold text-gray-900 mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center text-[13px] text-gray-400 py-4">
          <i className="ri-loader-4-line animate-spin text-[20px] block mb-2"></i>
          加载模型列表...
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
            <input
              type="text"
              placeholder="搜索模型名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-[13px]"
            />
          </div>
          <select
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-[13px] cursor-pointer bg-white"
          >
            <option value="all">全部版本</option>
            <option value="v8">YOLOv8</option>
            <option value="v11">YOLOv11</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-[13px] cursor-pointer bg-white"
          >
            <option value="all">全部类型</option>
            <option value="pretrained">预训练</option>
            <option value="custom">自训练</option>
          </select>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-[13px] cursor-pointer bg-white"
          >
            <option value="all">全部规格</option>
            <option value="nano">Nano</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">XLarge</option>
          </select>
          <select
            value={downloadedFilter}
            onChange={(e) => setDownloadedFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-[13px] cursor-pointer bg-white"
          >
            <option value="all">全部状态</option>
            <option value="downloaded">已下载</option>
            <option value="not-downloaded">未下载</option>
          </select>
        </div>
      </div>

      {/* 模型列表 */}
      <div>
        {!loading && filteredModels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
              <i className="ri-inbox-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-500">没有找到符合条件的模型</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onDownload={handleDownload}
                onExport={handleExport}
                onViewDetail={(id) => setSelectedModel(models.find(m => m.id === id) || null)}
                onCompare={handleCompare}
                isComparing={isComparing}
                isSelected={compareModels.includes(model.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 模型详情弹窗 */}
      {selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}

      {/* 导出弹窗 */}
      {exportingModel && (
        <ExportModal
          modelName={exportingModel}
          onClose={() => setExportingModel(null)}
          onExport={handleExportConfirm}
        />
      )}

      {/* 对比面板 */}
      {compareModels.length >= 2 && (
        <ComparePanel
          models={compareModelsData}
          onClose={() => {
            setIsComparing(false);
            setCompareModels([]);
          }}
        />
      )}
    </div>
  );
}
