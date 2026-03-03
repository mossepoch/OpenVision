import { useState, useEffect } from 'react';
import { datasetsData } from '../../mocks/datasetsData';
import DatasetCard from './components/DatasetCard';
import UploadZone from './components/UploadZone';
import DatasetDetailModal from './components/DatasetDetailModal';
import { datasetsApi } from '../../api/datasets';

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

type FilterStatus = 'all' | 'ready' | 'processing' | 'pending';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewDataset, setViewDataset] = useState<Dataset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dataset | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // 从后端加载数据集列表
  useEffect(() => {
    datasetsApi.list().then(list => {
      const mapped: Dataset[] = list.map(ds => ({
        id: ds.name,
        name: ds.name,
        description: ds.description,
        imageCount: ds.image_count,
        labeledCount: ds.label_count,
        classCount: ds.labels.length,
        classes: ds.labels,
        size: '-',
        format: 'YOLO',
        status: ds.image_count > 0 ? 'ready' : 'pending',
        createdAt: '',
        updatedAt: '',
        trainCount: 0,
        valCount: 0,
        testCount: 0,
        tags: [],
        previewImages: [],
      }));
      setDatasets(mapped);
      setLoading(false);
    }).catch(() => {
      // fallback to mock on error
      setDatasets(datasetsData);
      setLoading(false);
    });
  }, []);

  const filtered = datasets.filter(ds => {
    const matchSearch =
      ds.name.toLowerCase().includes(search.toLowerCase()) ||
      ds.tags.some(t => t.includes(search));
    const matchStatus = filterStatus === 'all' || ds.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleUpload = async (_file: File) => {
    // TODO: 实际应该调用上传 API，这里先模拟创建数据集
    try {
      await datasetsApi.create({ name: `ds-${Date.now()}`, description: '新上传', labels: ['person'] });
      // 重新加载列表
      const list = await datasetsApi.list();
      const mapped: Dataset[] = list.map(ds => ({
        id: ds.name, name: ds.name, description: ds.description,
        imageCount: ds.image_count, labeledCount: ds.label_count, classCount: ds.labels.length,
        classes: ds.labels, size: '-', format: 'YOLO', status: ds.image_count > 0 ? 'ready' : 'pending',
        createdAt: '', updatedAt: '', trainCount: 0, valCount: 0, testCount: 0, tags: [], previewImages: [],
      }));
      setDatasets(mapped);
    } catch (e) { console.error(e); }
    setShowUpload(false);
  };

  const handleDelete = async (ds: Dataset) => {
    try { await datasetsApi.delete(ds.id); } catch (e) { console.error(e); }
    setDatasets(prev => prev.filter(d => d.id !== ds.id));
    setDeleteTarget(null);
  };

  const stats = {
    total: datasets.length,
    totalImages: datasets.reduce((s, d) => s + d.imageCount, 0),
    totalLabeled: datasets.reduce((s, d) => s + d.labeledCount, 0),
    ready: datasets.filter(d => d.status === 'ready').length,
  };

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">数据集管理</h1>
            <p className="text-[13px] text-gray-400">管理训练数据集，支持 YOLO 格式自动解析</p>
          </div>
          <button
            onClick={() => setShowUpload(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
          >
            <i className="ri-upload-cloud-2-line text-[16px]"></i>
            上传数据集
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: '数据集总数',
            value: stats.total,
            icon: 'ri-database-2-line',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: '图片总数',
            value: stats.totalImages.toLocaleString(),
            icon: 'ri-image-2-line',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: '已标注图片',
            value: stats.totalLabeled.toLocaleString(),
            icon: 'ri-price-tag-3-line',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: '就绪可训练',
            value: stats.ready,
            icon: 'ri-checkbox-circle-line',
            color: 'text-teal-600',
            bg: 'bg-teal-50',
          },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-[20px]`}></i>
            </div>
            <div>
              <div className="text-[22px] font-semibold text-gray-900 leading-tight">{s.value}</div>
              <div className="text-[11px] text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zone (collapsible) */}
      {showUpload && <UploadZone onUpload={handleUpload} />}

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
          <input
            type="text"
            placeholder="搜索数据集名称或标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1">
          {(
            [
              { key: 'all', label: '全部' },
              { key: 'ready', label: '就绪' },
              { key: 'processing', label: '解析中' },
              { key: 'pending', label: '待标注' },
            ] as { key: FilterStatus; label: string }[]
          ).map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilterStatus(opt.key)}
              className={`px-4 py-2 text-[12px] rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === opt.key
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              {opt.label}
              {opt.key !== 'all' && (
                <span className={`ml-1.5 ${filterStatus === opt.key ? 'text-purple-200' : 'text-gray-400'}`}>
                  ({datasets.filter(d => d.status === opt.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-gray-400 ml-auto">共 {filtered.length} 个数据集</span>
      </div>

      {/* Dataset Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(ds => (
            <DatasetCard key={ds.id} dataset={ds} onView={setViewDataset} onDelete={setDeleteTarget} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 flex items-center justify-center mb-4">
            <i className="ri-database-2-line text-[48px] text-gray-200"></i>
          </div>
          <p className="text-[13px] font-medium text-gray-500 mb-1">暂无数据集</p>
          <p className="text-[11px] text-gray-400">
            {search ? '没有找到匹配的数据集' : '点击右上角"上传数据集"开始添加'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {viewDataset && <DatasetDetailModal dataset={viewDataset} onClose={() => setViewDataset(null)} />}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-red-500 text-[20px]"></i>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">确认删除数据集</h3>
                <p className="text-[11px] text-gray-400">此操作不可撤销</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <p className="text-[12px] text-red-700 font-medium mb-0.5">{deleteTarget.name}</p>
              <p className="text-[11px] text-red-500">
                包含 {deleteTarget.imageCount.toLocaleString()} 张图片，{deleteTarget.size} 数据将被永久删除
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[12px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 text-[12px] text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}