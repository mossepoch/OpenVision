interface ComparePanelProps {
  models: Array<{
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
    trainedOn: string;
    classes: number;
  }>;
  onClose: () => void;
}

export default function ComparePanel({ models, onClose }: ComparePanelProps) {
  if (models.length === 0) return null;

  const metrics = [
    { key: 'mAP50', label: 'mAP50', unit: '%', format: (v: number) => v.toFixed(1) },
    { key: 'mAP5095', label: 'mAP50-95', unit: '%', format: (v: number) => v.toFixed(1) },
    { key: 'speed', label: '推理速度', unit: '', format: (v: string) => v },
    { key: 'parameters', label: '参数量', unit: '', format: (v: string) => v },
    { key: 'fileSize', label: '文件大小', unit: '', format: (v: string) => v },
    { key: 'classes', label: '类别数', unit: '', format: (v: number) => v.toString() }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">模型对比</h2>
            <p className="text-sm text-gray-500 mt-1">已选择 {models.length} 个模型进行对比</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* 对比表格 */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 bg-gray-50">
                    指标
                  </th>
                  {models.map((model) => (
                    <th key={model.id} className="text-center py-3 px-4 bg-gray-50">
                      <div className="font-semibold text-gray-900">{model.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className={`px-2 py-0.5 rounded-full ${
                          model.type === 'pretrained' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {model.type === 'pretrained' ? '预训练' : '自训练'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 基本信息 */}
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50">
                    版本
                  </td>
                  {models.map((model) => (
                    <td key={model.id} className="py-3 px-4 text-center text-sm text-gray-900">
                      {model.version}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50">
                    规格
                  </td>
                  {models.map((model) => (
                    <td key={model.id} className="py-3 px-4 text-center text-sm text-gray-900">
                      {model.size}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50">
                    训练数据
                  </td>
                  {models.map((model) => (
                    <td key={model.id} className="py-3 px-4 text-center text-sm text-gray-900">
                      {model.trainedOn}
                    </td>
                  ))}
                </tr>

                {/* 性能指标 */}
                {metrics.map((metric, idx) => {
                  const values = models.map((m) => {
                    const val = m[metric.key as keyof typeof m];
                    return typeof val === 'number' ? val : val;
                  });
                  
                  let bestIdx = -1;
                  if (metric.key === 'mAP50' || metric.key === 'mAP5095') {
                    bestIdx = values.indexOf(Math.max(...values.filter(v => typeof v === 'number') as number[]));
                  }

                  return (
                    <tr key={metric.key} className={idx === metrics.length - 1 ? '' : 'border-b border-gray-200'}>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50">
                        {metric.label}
                      </td>
                      {models.map((model, modelIdx) => {
                        const value = model[metric.key as keyof typeof model];
                        const displayValue = typeof value === 'number' 
                          ? metric.format(value) 
                          : metric.format(value as string);
                        const isBest = modelIdx === bestIdx;

                        return (
                          <td
                            key={model.id}
                            className={`py-3 px-4 text-center text-sm font-semibold ${
                              isBest ? 'text-teal-600 bg-teal-50' : 'text-gray-900'
                            }`}
                          >
                            {displayValue}{metric.unit}
                            {isBest && (
                              <i className="ri-trophy-line ml-1 text-teal-600"></i>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 对比总结 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-lightbulb-line text-blue-600"></i>
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">对比建议</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• mAP50和mAP50-95越高，模型检测精度越好</li>
                  <li>• 推理速度越快，实时性能越好，适合边缘设备</li>
                  <li>• 参数量和文件大小影响模型部署的硬件要求</li>
                  <li>• 根据实际应用场景在精度和速度之间做出权衡</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            关闭对比
          </button>
        </div>
      </div>
    </div>
  );
}
