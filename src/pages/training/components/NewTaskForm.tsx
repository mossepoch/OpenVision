
import { useState, useEffect } from 'react';
import { datasetsApi, Dataset } from '../../../api/datasets';

interface NewTaskFormProps {
  onClose: () => void;
  onSubmit: (task: NewTaskPayload) => void;
}

export interface NewTaskPayload {
  name: string;
  datasetId: string;
  datasetName: string;
  baseModel: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  imgSize: number;
  optimizer: string;
}

const optimizers = ['SGD', 'AdamW', 'Adam', 'RMSProp'];
const batchSizes = [8, 16, 32, 64, 128];
const imgSizes = [320, 416, 512, 640, 1280];

const availableModels = ['yolov8n.pt', 'yolov8s.pt', 'yolov8m.pt', 'yolov8l.pt', 'yolov8x.pt'];

export default function NewTaskForm({ onClose, onSubmit }: NewTaskFormProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  useEffect(() => { datasetsApi.list().then(setDatasets).catch(console.error); }, []);

  const [form, setForm] = useState<NewTaskPayload>({
    name: '',
    datasetId: '',
    datasetName: '',
    baseModel: 'yolov8m.pt',
    epochs: 100,
    batchSize: 16,
    learningRate: 0.01,
    imgSize: 640,
    optimizer: 'SGD',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewTaskPayload, string>>>({});

  const set = <K extends keyof NewTaskPayload>(key: K, value: NewTaskPayload[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = '请输入任务名称';
    if (!form.datasetId) errs.datasetId = '请选择数据集';
    if (form.epochs < 1 || form.epochs > 1000) errs.epochs = '范围 1–1000';
    if (form.learningRate <= 0 || form.learningRate > 1) errs.learningRate = '范围 0.0001–1';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  // 数据集选择时同步 name
  const handleDatasetChange = (name: string) => {
    set('datasetId', name);
    set('datasetName', name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f1f3]">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">新建训练任务</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">配置训练参数并提交任务</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-[18px]"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Task Name */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              任务名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="例如：工位装配检测 v3.0 训练"
              className={`w-full px-3 py-2 text-[12px] border rounded-lg outline-none transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-[#e5e7eb] focus:border-[#0052d9]/50'
              }`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Dataset */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              训练数据集 <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {datasets.map(ds => (
                <label
                  key={ds.name}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.datasetId === ds.name
                      ? 'border-[#0052d9]/40 bg-[#0052d9]/4'
                      : 'border-[#f0f1f3] hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="dataset"
                    value={ds.name}
                    checked={form.datasetId === ds.name}
                    onChange={() => handleDatasetChange(ds.name)}
                    className="accent-[#0052d9]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{ds.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {ds.image_count} 张图片 · {ds.labels?.length ?? 0} 个类别
                    </p>
                  </div>
                  <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    就绪
                  </span>
                </label>
              ))}
              {datasets.length === 0 && (
                <div className="text-[12px] text-gray-400 text-center py-4">
                  暂无数据集，请先上传并标注数据集
                </div>
              )}
            </div>
          </div>

          {/* Base Model */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">基础模型</label>
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                {availableModels.map(m => (
                  <button
                    key={m}
                    onClick={() => set('baseModel', m)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      form.baseModel === m
                        ? 'border-[#0052d9]/40 bg-[#0052d9]/8 text-[#0052d9]'
                        : 'border-[#f0f1f3] hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="text-[11px] font-semibold">{m.replace('.pt', '')}</div>
                  </button>
                ))}
              </div>
            </div>
            {form.baseModel && (
              <div className="mt-2 flex items-center gap-3 bg-[#f8f9fa] rounded-lg px-3 py-2">
                <i className="ri-information-line text-gray-400 text-[13px]"></i>
                <span className="text-[10.5px] text-gray-500">已选: {form.baseModel}</span>
              </div>
            )}
          </div>

          {/* Training Params */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-2">训练参数</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Epochs */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Epochs</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={form.epochs}
                  onChange={e => set('epochs', Number(e.target.value))}
                  className={`w-full px-3 py-2 text-[12px] border rounded-lg outline-none transition-colors ${
                    errors.epochs ? 'border-red-300' : 'border-[#e5e7eb] focus:border-[#0052d9]/50'
                  }`}
                />
                {errors.epochs && <p className="text-[10px] text-red-500 mt-0.5">{errors.epochs}</p>}
              </div>

              {/* Batch Size */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Batch Size</label>
                <select
                  value={form.batchSize}
                  onChange={e => set('batchSize', Number(e.target.value))}
                  className="w-full px-3 py-2 text-[12px] border border-[#e5e7eb] rounded-lg outline-none focus:border-[#0052d9]/50 bg-white cursor-pointer"
                >
                  {batchSizes.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning Rate */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">学习率</label>
                <input
                  type="number"
                  step={0.001}
                  min={0.0001}
                  max={1}
                  value={form.learningRate}
                  onChange={e => set('learningRate', Number(e.target.value))}
                  className={`w-full px-3 py-2 text-[12px] border rounded-lg outline-none transition-colors ${
                    errors.learningRate ? 'border-red-300' : 'border-[#e5e7eb] focus:border-[#0052d9]/50'
                  }`}
                />
                {errors.learningRate && <p className="text-[10px] text-red-500 mt-0.5">{errors.learningRate}</p>}
              </div>

              {/* Image Size */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">图片尺寸</label>
                <select
                  value={form.imgSize}
                  onChange={e => set('imgSize', Number(e.target.value))}
                  className="w-full px-3 py-2 text-[12px] border border-[#e5e7eb] rounded-lg outline-none focus:border-[#0052d9]/50 bg-white cursor-pointer"
                >
                  {imgSizes.map(s => (
                    <option key={s} value={s}>
                      {s}px
                    </option>
                  ))}
                </select>
              </div>

              {/* Optimizer */}
              <div className="col-span-2">
                <label className="block text-[11px] text-gray-500 mb-1">优化器</label>
                <div className="flex items-center gap-2">
                  {optimizers.map(opt => (
                    <button
                      key={opt}
                      onClick={() => set('optimizer', opt)}
                      className={`flex-1 py-2 text-[11.5px] rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        form.optimizer === opt
                          ? 'border-[#0052d9]/40 bg-[#0052d9]/8 text-[#0052d9] font-medium'
                          : 'border-[#f0f1f3] text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#f0f1f3]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] text-gray-600 bg-[#f0f1f3] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-[12px] text-white bg-[#0052d9] hover:bg-[#0041b0] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-circle-line text-[14px]"></i>
            提交训练任务
          </button>
        </div>
      </div>
    </div>
  );
}
