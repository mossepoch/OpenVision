
import { useState, useEffect } from 'react';
import { devicesData } from '../../../mocks/devicesData';
import { modelsData } from '../../../mocks/modelsData';
import { sopList } from '../../../mocks/sopData';
import { shiftOptions, runCycleOptions, frameRateOptions } from '../../../mocks/stationsData';

type DetectionMode = 'vl_only' | 'cv_vl';
type RunCycle = 'daily' | 'weekdays' | 'custom';

interface StationForm {
  name: string;
  location: string;
  description: string;
  cameras: string[];
  sopId: string;
  detectionMode: DetectionMode;
  cvModelId: string;
  confidenceThreshold: number;
  operator: string;
  shift: string;
  planEnabled: boolean;
  timeRange: { start: string; end: string };
  runCycle: RunCycle;
  customDays: number[];
  frameRate: number;
}

interface Props {
  station?: any;
  onClose: () => void;
  onSave: (data: StationForm) => void;
}

const WEEK_DAYS = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 0 },
];

const TABS = ['基本信息', '检测配置', '运行计划'] as const;
type Tab = typeof TABS[number];

export default function StationConfigModal({ station, onClose, onSave }: Props) {
  const isEdit = !!station;
  const [activeTab, setActiveTab] = useState<Tab>('基本信息');

  const [form, setForm] = useState<StationForm>({
    name: station?.name || '',
    location: station?.location || '',
    description: station?.description || '',
    cameras: station?.cameras || [],
    sopId: station?.sopId || '',
    detectionMode: station?.detectionMode || 'vl_only',
    cvModelId: station?.cvModelId || '',
    confidenceThreshold: station?.confidenceThreshold ?? 0.5,
    operator: station?.operator || '',
    shift: station?.shift || '',
    planEnabled: station?.planEnabled ?? false,
    timeRange: station?.timeRange || { start: '08:00', end: '16:00' },
    runCycle: station?.runCycle || 'weekdays',
    customDays: station?.customDays || [1, 2, 3, 4, 5],
    frameRate: station?.frameRate || 1,
  });

  const onlineCameras = devicesData.devices.filter(
    (d) => d.status === 'online' || d.status === 'alert'
  );
  const downloadedModels = modelsData.filter((m) => m.downloaded);
  const activeSops = sopList;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  const toggleCamera = (camId: string) => {
    setForm((prev) => ({
      ...prev,
      cameras: prev.cameras.includes(camId)
        ? prev.cameras.filter((c) => c !== camId)
        : [...prev.cameras, camId],
    }));
  };

  const toggleCustomDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day],
    }));
  };

  const selectedSop = activeSops.find((s) => s.id === form.sopId);
  const selectedModel = downloadedModels.find((m) => m.id === form.cvModelId);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  const inputCls = 'w-full px-3 py-[6px] border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#0052d9] focus:shadow-[0_0_0_2px_rgba(0,82,217,0.1)]';
  const labelCls = 'block text-[12px] text-gray-600 mb-1.5';
  const sectionTitleCls = 'text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden animate-[modalIn_0.22s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: '#0052d9' }}>
              <i className="ri-settings-3-line text-[16px]"></i>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                {isEdit ? '编辑工位配置' : '新建工位'}
              </h2>
              <p className="text-[11px] text-gray-400">配置工位的摄像头、SOP、检测模型与运行计划</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-[20px] text-gray-400"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 flex-shrink-0 bg-white">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer -mb-px ${
                activeTab === tab
                  ? 'border-[#0052d9] text-[#0052d9]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === '运行计划' && (
                <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  form.planEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {form.planEnabled ? '已启用' : '未启用'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Tab 1: 基本信息 ── */}
          {activeTab === '基本信息' && (
            <div className="space-y-5">
              <section>
                <h3 className={sectionTitleCls}>基本信息</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>工位名称 <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：工位-01" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>所在位置</label>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="如：装配车间 A 区" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>工位描述</label>
                    <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="简要描述该工位的用途" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>负责人</label>
                    <input type="text" value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} placeholder="操作员姓名" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>班次</label>
                    <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} className={`${inputCls} cursor-pointer`}>
                      <option value="">选择班次</option>
                      {shiftOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* 摄像头绑定 */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={sectionTitleCls}>绑定摄像头</h3>
                  <span className="text-[11px] text-gray-400">已选 {form.cameras.length} 台</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {onlineCameras.map((cam) => {
                    const selected = form.cameras.includes(cam.id);
                    return (
                      <div key={cam.id} onClick={() => toggleCamera(cam.id)}
                        className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${selected ? 'border-[#0052d9] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-[#0052d9] bg-[#0052d9]' : 'border-gray-300'}`}>
                          {selected && <i className="ri-check-line text-white text-[10px]"></i>}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-gray-800 truncate">{cam.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{cam.id} · {cam.location}</div>
                        </div>
                        <span className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${cam.status === 'online' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                      </div>
                    );
                  })}
                </div>
                {onlineCameras.length === 0 && (
                  <div className="text-center py-6 text-[12px] text-gray-400">
                    <i className="ri-camera-off-line text-[24px] block mb-1"></i>暂无在线摄像头
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Tab 2: 检测配置 ── */}
          {activeTab === '检测配置' && (
            <div className="space-y-5">
              {/* SOP 绑定 */}
              <section>
                <h3 className={sectionTitleCls}>绑定 SOP 流程</h3>
                <select value={form.sopId} onChange={(e) => setForm({ ...form, sopId: e.target.value })} className={`${inputCls} cursor-pointer`}>
                  <option value="">选择 SOP 流程</option>
                  {activeSops.map((sop) => (
                    <option key={sop.id} value={sop.id}>
                      {sop.name}（{sop.steps} 步骤 · {sop.mode === 'vl_only' ? 'VL-only' : 'CV+VL'}）
                    </option>
                  ))}
                </select>
                {selectedSop && (
                  <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                    <i className="ri-information-line text-blue-500 text-[13px]"></i>
                    <span className="text-[11px] text-blue-700">
                      该 SOP 共 {selectedSop.steps} 个步骤，当前已被 {selectedSop.stations.length} 个工位使用
                    </span>
                  </div>
                )}
              </section>

              {/* 检测模式 */}
              <section>
                <h3 className={sectionTitleCls}>检测模式</h3>
                <div className="flex gap-3 mb-3">
                  {(['vl_only', 'cv_vl'] as DetectionMode[]).map((mode) => (
                    <div key={mode} onClick={() => setForm({ ...form, detectionMode: mode, cvModelId: '' })}
                      className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all ${form.detectionMode === mode ? 'border-[#0052d9] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${form.detectionMode === mode ? 'border-[#0052d9]' : 'border-gray-300'}`}>
                          {form.detectionMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-[#0052d9]"></div>}
                        </div>
                        <span className={`text-[12px] font-semibold ${form.detectionMode === mode ? 'text-[#0052d9]' : 'text-gray-700'}`}>
                          {mode === 'vl_only' ? 'VL-only' : 'CV + VL'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed pl-5">
                        {mode === 'vl_only' ? '仅使用视觉语言模型，适合复杂场景理解' : '先用 CV 模型检测目标，再结合 VL 理解场景'}
                      </p>
                    </div>
                  ))}
                </div>

                {form.detectionMode === 'cv_vl' && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className={labelCls}>CV 检测模型 <span className="text-red-500">*</span></label>
                      <select value={form.cvModelId} onChange={(e) => setForm({ ...form, cvModelId: e.target.value })} className={`${inputCls} cursor-pointer bg-white`}>
                        <option value="">选择已下载的模型</option>
                        {downloadedModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}（{m.type === 'pretrained' ? '预训练' : '自训练'} · mAP50: {m.mAP50}%）
                          </option>
                        ))}
                      </select>
                      {selectedModel && <p className="text-[11px] text-gray-400 mt-1">{selectedModel.description}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>
                        置信度阈值：<span className="font-semibold text-gray-800">{form.confidenceThreshold.toFixed(2)}</span>
                      </label>
                      <input type="range" min="0.1" max="0.95" step="0.05" value={form.confidenceThreshold}
                        onChange={(e) => setForm({ ...form, confidenceThreshold: parseFloat(e.target.value) })}
                        className="w-full accent-[#0052d9] cursor-pointer" />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>0.10 宽松</span><span>0.95 严格</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Tab 3: 运行计划 ── */}
          {activeTab === '运行计划' && (
            <div className="space-y-5">
              {/* 计划开关 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <div className="text-[13px] font-semibold text-gray-800">启用运行计划</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">开启后系统将按照以下计划自动执行检测任务</div>
                </div>
                <button
                  onClick={() => setForm({ ...form, planEnabled: !form.planEnabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.planEnabled ? 'bg-[#0052d9]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.planEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              {/* 计划详情（仅启用时高亮，未启用时灰显） */}
              <div className={`space-y-5 transition-opacity ${form.planEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                {/* 运行时段 */}
                <section>
                  <h3 className={sectionTitleCls}>运行时段</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className={labelCls}>开始时间</label>
                      <input type="time" value={form.timeRange.start}
                        onChange={(e) => setForm({ ...form, timeRange: { ...form.timeRange, start: e.target.value } })}
                        className={inputCls} />
                    </div>
                    <div className="mt-5 text-gray-400 text-[13px] flex-shrink-0">至</div>
                    <div className="flex-1">
                      <label className={labelCls}>结束时间</label>
                      <input type="time" value={form.timeRange.end}
                        onChange={(e) => setForm({ ...form, timeRange: { ...form.timeRange, end: e.target.value } })}
                        className={inputCls} />
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>快捷设置</label>
                      <select
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'morning') setForm({ ...form, timeRange: { start: '08:00', end: '16:00' } });
                          else if (v === 'afternoon') setForm({ ...form, timeRange: { start: '16:00', end: '00:00' } });
                          else if (v === 'night') setForm({ ...form, timeRange: { start: '00:00', end: '08:00' } });
                          else if (v === 'allday') setForm({ ...form, timeRange: { start: '00:00', end: '23:59' } });
                        }}
                        className={`${inputCls} cursor-pointer`}
                        defaultValue=""
                      >
                        <option value="" disabled>选择班次快捷填入</option>
                        <option value="morning">早班 08:00–16:00</option>
                        <option value="afternoon">中班 16:00–00:00</option>
                        <option value="night">夜班 00:00–08:00</option>
                        <option value="allday">全天 00:00–23:59</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* 运行周期 */}
                <section>
                  <h3 className={sectionTitleCls}>运行周期</h3>
                  <div className="flex gap-2 mb-3">
                    {runCycleOptions.map((opt) => (
                      <button key={opt.value}
                        onClick={() => setForm({ ...form, runCycle: opt.value as RunCycle })}
                        className={`px-4 py-1.5 rounded text-[12px] border transition-all cursor-pointer whitespace-nowrap ${
                          form.runCycle === opt.value
                            ? 'border-[#0052d9] bg-blue-50 text-[#0052d9] font-medium'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {form.runCycle === 'custom' && (
                    <div className="flex gap-2 mt-2">
                      {WEEK_DAYS.map((d) => (
                        <button key={d.value}
                          onClick={() => toggleCustomDay(d.value)}
                          className={`w-9 h-9 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                            form.customDays.includes(d.value)
                              ? 'border-[#0052d9] bg-[#0052d9] text-white'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400'
                          }`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {form.runCycle === 'weekdays' && (
                    <div className="flex gap-2 mt-2">
                      {WEEK_DAYS.map((d) => (
                        <div key={d.value}
                          className={`w-9 h-9 rounded-full text-[12px] font-medium border flex items-center justify-center ${
                            [1,2,3,4,5].includes(d.value)
                              ? 'border-[#0052d9] bg-[#0052d9] text-white'
                              : 'border-gray-200 text-gray-300'
                          }`}>
                          {d.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {form.runCycle === 'daily' && (
                    <div className="flex gap-2 mt-2">
                      {WEEK_DAYS.map((d) => (
                        <div key={d.value} className="w-9 h-9 rounded-full text-[12px] font-medium border border-[#0052d9] bg-[#0052d9] text-white flex items-center justify-center">
                          {d.label}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 视频抽帧参数 */}
                <section>
                  <h3 className={sectionTitleCls}>视频抽帧参数</h3>
                  <div>
                    <label className={labelCls}>抽取频率</label>
                    <div className="grid grid-cols-2 gap-2">
                      {frameRateOptions.map((opt) => (
                        <div key={opt.value}
                          onClick={() => setForm({ ...form, frameRate: opt.value })}
                          className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                            form.frameRate === opt.value
                              ? 'border-[#0052d9] bg-blue-50/50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.frameRate === opt.value ? 'border-[#0052d9]' : 'border-gray-300'}`}>
                            {form.frameRate === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-[#0052d9]"></div>}
                          </div>
                          <span className="text-[12px] text-gray-700">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      <i className="ri-information-line mr-1"></i>
                      抽帧频率越高，检测越精细，但会增加计算资源消耗
                    </p>
                  </div>
                </section>

                {/* 计划预览 */}
                {form.planEnabled && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className="ri-calendar-check-line text-green-600 text-[13px]"></i>
                      <span className="text-[12px] font-semibold text-green-800">计划预览</span>
                    </div>
                    <p className="text-[11px] text-green-700 leading-relaxed">
                      系统将在
                      <strong> {form.runCycle === 'daily' ? '每天' : form.runCycle === 'weekdays' ? '每个工作日（周一至周五）' : `每周${form.customDays.map(d => WEEK_DAYS.find(w => w.value === d)?.label).join('、')}`} </strong>
                      的 <strong>{form.timeRange.start} – {form.timeRange.end}</strong> 时段内，
                      以 <strong>每秒 {form.frameRate} 帧</strong> 的频率对该工位进行自动检测。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex gap-1.5">
            {TABS.map((tab, i) => (
              <div key={tab} className={`w-1.5 h-1.5 rounded-full transition-colors ${activeTab === tab ? 'bg-[#0052d9]' : 'bg-gray-300'}`}></div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-[6px] border border-gray-300 text-gray-600 rounded text-[12px] hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer">
              取消
            </button>
            {activeTab !== '运行计划' && (
              <button
                onClick={() => setActiveTab(activeTab === '基本信息' ? '检测配置' : '运行计划')}
                className="px-4 py-[6px] border border-[#0052d9] text-[#0052d9] rounded text-[12px] hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                下一步
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="px-5 py-[6px] text-white rounded text-[12px] hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#0052d9' }}
            >
              {isEdit ? '保存配置' : '创建工位'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
