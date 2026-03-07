import { useState } from 'react';

// 导出格式定义（内置，不依赖 mock）
const exportFormats = [
  { value: 'pytorch', label: 'PyTorch (.pt)', description: '原生PyTorch格式，保留完整训练信息' },
  { value: 'onnx', label: 'ONNX (.onnx)', description: '跨平台格式，支持多种推理引擎' },
  { value: 'torchscript', label: 'TorchScript (.torchscript)', description: 'PyTorch序列化格式，适合生产部署' },
  { value: 'openvino', label: 'OpenVINO', description: 'Intel优化格式，适合CPU推理' },
  { value: 'tensorrt', label: 'TensorRT', description: 'NVIDIA优化格式，GPU推理性能最佳' },
  { value: 'coreml', label: 'CoreML', description: 'Apple设备专用格式' },
  { value: 'tflite', label: 'TensorFlow Lite', description: '移动端和嵌入式设备格式' },
];

interface ExportModalProps {
  modelName: string;
  onClose: () => void;
  onExport: (format: string) => void;
}

export default function ExportModal({ modelName, onClose, onExport }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('onnx');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await onExport(selectedFormat);
    setTimeout(() => {
      setExporting(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* 头部 */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">导出模型</h2>
            <p className="text-sm text-gray-500 mt-1">{modelName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              选择导出格式
            </label>
            <div className="space-y-2">
              {exportFormats.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    selectedFormat === format.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-teal-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{format.label}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-blue-600"></i>
            </div>
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">导出说明</p>
              <ul className="space-y-1 text-blue-800">
                <li>• 导出过程可能需要几分钟，请耐心等待</li>
                <li>• 不同格式适用于不同的部署环境</li>
                <li>• 导出后的模型文件将自动下载到本地</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={exporting}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            {exporting ? '导出中...' : '开始导出'}
          </button>
        </div>
      </div>
    </div>
  );
}
