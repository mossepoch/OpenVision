import { useState, useEffect } from 'react';
import { sopApi, Sop } from '../../api/sop';

// SOP 模板库（静态配置，不依赖 API）
const sopTemplates = [
  { id: 'template-001', name: '发动机组装标准流程', category: '装配', steps: 8, avgDuration: '45分钟', description: '适用于四缸发动机的标准组装流程', usage: 156 },
  { id: 'template-002', name: '变速箱装配流程', category: '装配', steps: 10, avgDuration: '60分钟', description: '手动变速箱装配标准操作流程', usage: 98 },
  { id: 'template-003', name: '底盘组装流程', category: '装配', steps: 6, avgDuration: '35分钟', description: '车辆底盘系统组装标准流程', usage: 124 },
  { id: 'template-004', name: '电气系统安装', category: '装配', steps: 7, avgDuration: '40分钟', description: '车辆电气系统安装与测试流程', usage: 87 },
  { id: 'template-005', name: '质量检验流程', category: '质检', steps: 5, avgDuration: '20分钟', description: '成品质量检验标准流程', usage: 203 },
  { id: 'template-006', name: '安全检查流程', category: '安全', steps: 4, avgDuration: '15分钟', description: '作业前安全检查标准流程', usage: 312 },
];

const stepTypes = [
  { id: 'assembly', name: '组装步骤', icon: 'ri-tools-line', color: 'blue' },
  { id: 'inspection', name: '检查步骤', icon: 'ri-search-eye-line', color: 'green' },
  { id: 'testing', name: '测试步骤', icon: 'ri-test-tube-line', color: 'purple' },
  { id: 'safety', name: '安全检查', icon: 'ri-shield-check-line', color: 'red' },
  { id: 'quality', name: '质量确认', icon: 'ri-checkbox-circle-line', color: 'orange' },
  { id: 'documentation', name: '记录步骤', icon: 'ri-file-text-line', color: 'gray' },
];

const sampleSopSteps = [
  { id: 'step-001', order: 1, type: 'safety', name: '安全检查', description: '检查操作员是否佩戴安全手套、护目镜等防护装备', timeout: 60, required: true, prompt: '请确认操作员是否正确佩戴了所有必需的个人防护装备。' },
  { id: 'step-002', order: 2, type: 'assembly', name: '准备工具和零件', description: '从工具架取出所需工具，从料架取出对应零件', timeout: 120, required: true, prompt: '请确认操作员已从指定位置取出所有必需的工具和零件。' },
  { id: 'step-003', order: 3, type: 'assembly', name: '安装气缸盖', description: '将气缸盖对准定位销，按照对角线顺序拧紧螺栓', timeout: 300, required: true, prompt: '请确认气缸盖已正确对准定位销，螺栓按照对角线顺序拧紧。' },
  { id: 'step-004', order: 4, type: 'inspection', name: '检查螺栓扭矩', description: '使用扭矩扳手检查所有螺栓是否达到规定扭矩值', timeout: 180, required: true, prompt: '请确认操作员使用扭矩扳手检查了所有螺栓。' },
  { id: 'step-005', order: 5, type: 'assembly', name: '安装凸轮轴', description: '涂抹润滑油后安装凸轮轴，确保轴承座正确就位', timeout: 240, required: true, prompt: '请确认凸轮轴已涂抹润滑油，正确安装到位。' },
  { id: 'step-006', order: 6, type: 'testing', name: '旋转测试', description: '手动旋转曲轴，检查是否有卡滞现象', timeout: 120, required: true, prompt: '请确认操作员手动旋转了曲轴，旋转顺畅无卡滞。' },
  { id: 'step-007', order: 7, type: 'quality', name: '质量确认', description: '对照检查清单确认所有步骤完成且符合质量标准', timeout: 180, required: true, prompt: '请确认操作员对照检查清单完成了所有项目的确认。' },
  { id: 'step-008', order: 8, type: 'documentation', name: '记录与归档', description: '扫描二维码记录完成信息，工具归位', timeout: 90, required: true, prompt: '请确认操作员已扫描二维码记录信息，所有工具已归位。' },
];

export default function SopConfigPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showStepPanel, setShowStepPanel] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [sopMode, setSopMode] = useState<'vl_only' | 'cv_vl'>('vl_only');
  const [outputGranularity, setOutputGranularity] = useState<'segment' | 'step' | 'task'>('step');

  // 真实数据
  const [sopList, setSopList] = useState<Sop[]>([]);
  const [loading, setLoading] = useState(true);

  // 创建表单
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSops();
  }, []);

  const fetchSops = async () => {
    try {
      setLoading(true);
      const data = await sopApi.list();
      setSopList(data);
    } catch (e) {
      console.error('Failed to fetch SOPs', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      setCreating(true);
      await sopApi.create({
        name: newName,
        description: newDesc,
        mode: sopMode,
        output_granularity: outputGranularity,
        steps: [],
      });
      setNewName('');
      setNewDesc('');
      setShowCreateModal(false);
      await fetchSops();
    } catch (e) {
      console.error('Failed to create SOP', e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该 SOP？')) return;
    try {
      await sopApi.delete(id);
      await fetchSops();
    } catch (e) {
      console.error('Failed to delete SOP', e);
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreateModal]);

  const handleDragStart = (e: React.DragEvent, stepType: any) => {
    e.dataTransfer.setData('stepType', JSON.stringify(stepType));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const stepType = JSON.parse(e.dataTransfer.getData('stepType'));
      console.log('Dropped step:', stepType);
    } catch (err) {
      console.error('Failed to parse dropped data', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fb]">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">SOP 配置</h1>
            <p className="text-[13px] text-gray-500">创建和管理标准作业流程，可被多个工位复用</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
          >
            <i className="ri-add-line text-[16px]"></i>
            创建新 SOP
          </button>
        </div>
      </div>

      {/* SOP List Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 说明提示 */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-5 flex items-start gap-3">
          <i className="ri-lightbulb-line text-purple-600 text-[18px] mt-0.5 flex-shrink-0"></i>
          <p className="text-[12px] text-purple-700 leading-relaxed">
            SOP 只定义作业流程步骤，不绑定具体工位或摄像头。工位与 SOP 的关联请在
            <strong>「工位管理」</strong>中配置，支持多个工位共用同一个 SOP。
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
              <input
                type="text"
                placeholder="搜索 SOP 名称..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <select className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer bg-white">
              <option value="all">全部状态</option>
              <option value="active">已激活</option>
              <option value="draft">草稿</option>
              <option value="archived">已归档</option>
            </select>
            <select className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer bg-white">
              <option value="all">全部模式</option>
              <option value="vl_only">VL-only</option>
              <option value="cv_vl">CV+VL</option>
            </select>
          </div>
        </div>

        {/* SOP Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-[12px] font-semibold text-gray-600 uppercase tracking-wider">
            <div className="col-span-5">名称</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-2">模式</div>
            <div className="col-span-1">步骤数</div>
            <div className="col-span-1">创建时间</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          {/* Table Body */}
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-[13px]">
              <i className="ri-loader-4-line animate-spin text-[24px] block mb-2"></i>
              加载中...
            </div>
          ) : sopList.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-[13px]">
              <i className="ri-file-list-3-line text-[40px] block mb-2 opacity-30"></i>
              暂无 SOP，点击右上角创建第一个
            </div>
          ) : (
            sopList.map((sop) => (
              <div
                key={sop.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-purple-50/30 transition-colors cursor-pointer items-center"
              >
                <div className="col-span-5">
                  <div className="text-[14px] font-semibold text-gray-900 mb-1">{sop.name}</div>
                  <div className="text-[12px] text-gray-400">{sop.description || '暂无描述'}</div>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-[11px] font-medium ${
                      sop.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {sop.status === 'active' ? '已激活' : '草稿'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-[11px] font-medium ${
                      sop.mode === 'vl_only' ? 'bg-purple-50 text-purple-700' : 'bg-cyan-50 text-cyan-700'
                    }`}
                  >
                    {sop.mode === 'vl_only' ? 'VL-only' : 'CV+VL'}
                  </span>
                </div>
                <div className="col-span-1 text-[13px] text-gray-700 font-medium">
                  {Array.isArray(sop.steps) ? sop.steps.length : 0}
                </div>
                <div className="col-span-1 text-[12px] text-gray-400">
                  {sop.created_at ? new Date(sop.created_at).toLocaleDateString('zh-CN') : '-'}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                    title="编辑"
                  >
                    <i className="ri-edit-line text-[15px] text-gray-600"></i>
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="删除"
                    onClick={(e) => { e.stopPropagation(); handleDelete(sop.id); }}
                  >
                    <i className="ri-delete-bin-line text-[15px] text-red-400"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create SOP Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowCreateModal(false)}
          ></div>
          <div className="relative bg-[#f7f8fa] rounded-2xl shadow-2xl w-[90vw] max-w-[1200px] h-[85vh] flex flex-col overflow-hidden animate-[modalIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                  <i className="ri-add-line text-[20px]"></i>
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-gray-900">创建新 SOP</h2>
                  <p className="text-[12px] text-gray-500">
                    定义标准作业流程步骤与检测规则，工位绑定请在「工位管理」中配置
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-[22px] text-gray-400"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel */}
              <div className="w-[230px] bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    模板库
                  </h3>
                  <div className="space-y-1.5 mb-5">
                    {sopTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-purple-400 bg-purple-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="font-medium text-[12px] text-gray-800 mb-0.5">{template.name}</div>
                        <div className="text-[11px] text-gray-400 mb-1.5 leading-relaxed">{template.description}</div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{template.steps} 步骤</span>
                          <span>使用 {template.usage} 次</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    步骤类型
                  </h3>
                  <div className="space-y-1.5">
                    {stepTypes.map((type) => (
                      <div
                        key={type.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        className="p-2.5 border border-gray-200 rounded-lg cursor-move hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded flex items-center justify-center bg-gray-100">
                          <i className={`${type.icon} text-[14px] text-gray-600`}></i>
                        </div>
                        <span className="text-[12px] text-gray-700">{type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Panel */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-5">
                  {/* SOP Info */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 shadow-sm">
                    <h3 className="text-[14px] font-semibold text-gray-900 mb-4">基本信息</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5 font-medium">SOP 名称 *</label>
                        <input
                          type="text"
                          placeholder="输入 SOP 名称"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5 font-medium">检测模式</label>
                        <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setSopMode('vl_only')}
                            className={`flex-1 px-3 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                              sopMode === 'vl_only' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            style={sopMode === 'vl_only' ? { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' } : {}}
                          >
                            VL-only
                          </button>
                          <button
                            onClick={() => setSopMode('cv_vl')}
                            className={`flex-1 px-3 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer border-l border-gray-200 ${
                              sopMode === 'cv_vl' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            style={sopMode === 'cv_vl' ? { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' } : {}}
                          >
                            CV+VL
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5 font-medium">描述</label>
                        <input
                          type="text"
                          placeholder="简要描述该 SOP 的用途"
                          value={newDesc}
                          onChange={e => setNewDesc(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5 font-medium">输出粒度</label>
                        <select
                          value={outputGranularity}
                          onChange={(e) => setOutputGranularity(e.target.value as any)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer bg-white"
                        >
                          <option value="segment">片段级</option>
                          <option value="step">步骤级</option>
                          <option value="task">任务级</option>
                        </select>
                      </div>
                    </div>
                    {sopMode === 'cv_vl' && (
                      <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                        <div className="flex items-start gap-2">
                          <i className="ri-information-line text-cyan-600 text-[14px] mt-0.5"></i>
                          <div className="text-[12px] text-cyan-700 leading-relaxed">
                            <strong>CV+VL 模式：</strong>此 SOP 需要配合 CV 检测模型使用。具体模型选择和置信度阈值请在
                            <strong>「工位管理」</strong>中为每个工位单独配置。
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Natural Language Input */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 shadow-sm">
                    <h3 className="text-[14px] font-semibold text-gray-900 mb-3">自然语言生成</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="描述流程，例如：发动机组装流程包括安全检查、准备工具、安装气缸盖..."
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                      <button
                        className="px-5 py-2.5 text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
                      >
                        生成流程
                      </button>
                    </div>
                  </div>

                  {/* Flow Canvas */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[14px] font-semibold text-gray-900">流程画布</h3>
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded transition-colors whitespace-nowrap cursor-pointer">
                          <i className="ri-zoom-in-line mr-0.5"></i>放大
                        </button>
                        <button className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded transition-colors whitespace-nowrap cursor-pointer">
                          <i className="ri-zoom-out-line mr-0.5"></i>缩小
                        </button>
                      </div>
                    </div>

                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="min-h-[360px] border border-dashed border-gray-300 rounded-lg p-5"
                      style={{ background: '#fafbfc' }}
                    >
                      {sampleSopSteps.length > 0 ? (
                        <div className="space-y-3">
                          {sampleSopSteps.map((step, index) => (
                            <div key={step.id}>
                              <div
                                onClick={() => {
                                  setSelectedStep(step);
                                  setShowStepPanel(true);
                                }}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-9 h-9 text-white rounded-lg flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
                                  >
                                    {step.order}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-[13px] text-gray-900">{step.name}</h4>
                                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium">
                                        {stepTypes.find((t) => t.id === step.type)?.name}
                                      </span>
                                      {step.required && (
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full font-medium">
                                          必需
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-1.5">{step.description}</p>
                                    <div className="text-[11px] text-gray-400">
                                      <i className="ri-time-line mr-0.5"></i>超时: {step.timeout}s
                                    </div>
                                  </div>
                                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0">
                                    <i className="ri-more-2-fill text-[15px] text-gray-400"></i>
                                  </button>
                                </div>
                              </div>
                              {index < sampleSopSteps.length - 1 && (
                                <div className="flex justify-center py-1.5">
                                  <i className="ri-arrow-down-line text-[20px] text-gray-300"></i>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                          <i className="ri-drag-drop-line text-[56px] mb-4"></i>
                          <p className="text-[15px] font-medium">拖拽步骤类型到此处开始创建流程</p>
                          <p className="text-[13px] mt-1">或使用自然语言生成流程草案</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-5">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={creating || !newName.trim()}
                        className="px-5 py-2 text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
                      >
                        {creating ? '创建中...' : '发布 SOP'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Step Properties */}
              {showStepPanel && selectedStep && (
                <div className="w-[300px] bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[13px] font-medium text-gray-900">步骤属性</h3>
                      <button
                        onClick={() => setShowStepPanel(false)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <i className="ri-close-line text-[16px] text-gray-400"></i>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5">步骤名称</label>
                        <input
                          type="text"
                          defaultValue={selectedStep.name}
                          className="w-full px-3 py-[6px] border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#0052d9] focus:shadow-[0_0_0_2px_rgba(0,82,217,0.1)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5">步骤描述</label>
                        <textarea
                          defaultValue={selectedStep.description}
                          rows={3}
                          maxLength={500}
                          className="w-full px-3 py-[6px] border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#0052d9] focus:shadow-[0_0_0_2px_rgba(0,82,217,0.1)] resize-none"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5">超时阈值（秒）</label>
                        <input
                          type="number"
                          defaultValue={selectedStep.timeout}
                          className="w-full px-3 py-[6px] border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#0052d9] focus:shadow-[0_0_0_2px_rgba(0,82,217,0.1)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5">步骤类型</label>
                        <select className="w-full px-3 py-[6px] border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#0052d9] cursor-pointer">
                          {stepTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={selectedStep.required}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-[#0052d9]"
                          />
                          <span className="text-[12px] text-gray-600">必需步骤</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-600 mb-1.5">Prompt 模板</label>
                        <textarea
                          defaultValue={selectedStep.prompt}
                          rows={5}
                          maxLength={500}
                          className="w-full px-3 py-[6px] border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#0052d9] focus:shadow-[0_0_0_2px_rgba(0,82,217,0.1)] resize-none"
                        ></textarea>
                        <p className="text-[11px] text-gray-400 mt-1">
                          此提示词将用于 AI 模型分析该步骤的执行情况
                        </p>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <button className="w-full px-3 py-[6px] border border-red-300 text-red-500 rounded text-[12px] hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5">
                          <i className="ri-delete-bin-line text-[14px]"></i>
                          删除步骤
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
