interface ModelDetailModalProps {
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
    epochs?: number;
    baseModel?: string;
    customClasses?: string[];
  } | null;
  onClose: () => void;
}

export default function ModelDetailModal({ model, onClose }: ModelDetailModalProps) {
  if (!model) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{model.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                model.type === 'pretrained' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {model.type === 'pretrained' ? '预训练模型' : '自训练模型'}
              </span>
              <span className="text-sm text-gray-500">版本: {model.version}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 描述 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">模型描述</h3>
            <p className="text-sm text-gray-600">{model.description}</p>
          </div>

          {/* 性能指标 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">性能指标</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                <div className="text-xs text-teal-700 mb-1">mAP50</div>
                <div className="text-2xl font-bold text-teal-900">{model.mAP50}%</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="text-xs text-blue-700 mb-1">mAP50-95</div>
                <div className="text-2xl font-bold text-blue-900">{model.mAP5095}%</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="text-xs text-purple-700 mb-1">推理速度</div>
                <div className="text-2xl font-bold text-purple-900">{model.speed}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="text-xs text-orange-700 mb-1">参数量</div>
                <div className="text-2xl font-bold text-orange-900">{model.parameters}</div>
              </div>
            </div>
          </div>

          {/* 模型信息 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">模型信息</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">文件大小</span>
                <span className="text-gray-900 font-medium">{model.fileSize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">模型规格</span>
                <span className="text-gray-900 font-medium">{model.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">类别数量</span>
                <span className="text-gray-900 font-medium">{model.classes} 类</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">训练数据集</span>
                <span className="text-gray-900 font-medium">{model.trainedOn}</span>
              </div>
              {model.trainDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">训练日期</span>
                  <span className="text-gray-900 font-medium">{model.trainDate}</span>
                </div>
              )}
              {model.epochs && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">训练轮数</span>
                  <span className="text-gray-900 font-medium">{model.epochs} epochs</span>
                </div>
              )}
              {model.baseModel && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">基础模型</span>
                  <span className="text-gray-900 font-medium">{model.baseModel}</span>
                </div>
              )}
              {model.lastUsed && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">最后使用</span>
                  <span className="text-gray-900 font-medium">{model.lastUsed}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">下载状态</span>
                <span className={`font-medium ${model.downloaded ? 'text-green-600' : 'text-gray-400'}`}>
                  {model.downloaded ? '已下载' : '未下载'}
                </span>
              </div>
            </div>
          </div>

          {/* 自定义类别 */}
          {model.customClasses && model.customClasses.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">检测类别</h3>
              <div className="flex flex-wrap gap-2">
                {model.customClasses.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium whitespace-nowrap"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 适用场景 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">适用场景</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg flex-shrink-0">
                  <i className="ri-lightbulb-line text-blue-600"></i>
                </div>
                <div className="text-sm text-blue-900">
                  {model.type === 'pretrained' ? (
                    <p>
                      该预训练模型在COCO数据集上训练，可识别80种常见物体。
                      适合通用目标检测场景，如人员检测、车辆识别、物品分类等。
                      建议根据实际需求选择合适规格的模型以平衡速度与精度。
                    </p>
                  ) : (
                    <p>
                      该自训练模型针对特定场景优化，在目标数据集上表现优异。
                      适合专业领域应用，如工业质检、安全监控、智能制造等。
                      可直接部署使用或作为基础模型继续微调。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            关闭
          </button>
          {model.downloaded && (
            <button className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer">
              导出模型
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
