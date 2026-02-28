
import { useState, useEffect } from 'react';
import { monitoringDetail, stationList } from '../../../mocks/monitoringData';

interface StationDetailProps {
  stationId: string;
  onBack: () => void;
}

const getStepStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500 text-white';
    case 'in_progress': return 'text-white';
    case 'pending': return 'bg-gray-200 text-gray-500';
    default: return 'bg-gray-200 text-gray-500';
  }
};

const getEventLevelColor = (level: string) => {
  switch (level) {
    case 'success': return 'border-l-emerald-500 bg-emerald-50/60';
    case 'warning': return 'border-l-orange-500 bg-orange-50/60';
    case 'error': return 'border-l-red-500 bg-red-50/60';
    default: return 'border-l-[#0052d9]/60 bg-blue-50/40';
  }
};

export default function StationDetail({ stationId, onBack }: StationDetailProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [events, setEvents] = useState(monitoringDetail.events);

  const station = stationList.find(s => s.id === stationId);
  const detail = monitoringDetail;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = detail.steps.find(s => s.status === 'in_progress');
  const completedSteps = detail.steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / detail.steps.length) * 100;

  const handleClearEvents = () => setEvents([]);

  if (!station) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-s-line text-[16px]"></i>
            返回总览
          </button>
          <span className="text-gray-300">|</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-gray-900">{station.name}</h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                运行中
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-0.5">
              <span><i className="ri-file-list-line mr-1"></i>{station.sopName}</span>
              <span><i className="ri-user-line mr-1"></i>{station.operator}</span>
              <span><i className="ri-time-line mr-1"></i>开始于 {station.startTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-[6px] border border-gray-200 text-gray-500 rounded text-[12px] hover:bg-gray-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
            <i className="ri-fullscreen-line text-[13px]"></i>
            全屏
          </button>
          <button className="px-3 py-[6px] border border-orange-200 text-orange-600 bg-orange-50 rounded text-[12px] hover:bg-orange-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
            <i className="ri-alarm-warning-line text-[13px]"></i>
            标记异常
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left – Video & Steps */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Video Feed */}
          <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
            <div className="relative">
              <div className="w-full h-[400px]">
                <img
                  src={detail.videoFrame}
                  alt="实时监控画面"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Top overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                  <div className="text-[10px] text-gray-300 mb-0.5">当前步骤</div>
                  <div className="text-[13px] font-semibold">{currentStep?.name}</div>
                  <div className="text-[10px] mt-0.5 text-gray-300">
                    步骤 {currentStep?.order} / {detail.steps.length}
                  </div>
                </div>
                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-right">
                  <div className="text-[10px] text-gray-300 mb-0.5">已用时间</div>
                  <div className="text-[20px] font-semibold tabular-nums">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Bottom overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-[6px] h-[6px] bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-[11px]">模型分析中</span>
                      </div>
                      <span className="text-[10px] text-gray-400">上次: {detail.analysisStatus.lastAnalysisTime}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,82,217,0.4)' }}>
                        {detail.analysisStatus.mode === 'vl_only' ? 'VL-only' : 'CV+VL'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      分析率: {detail.analysisStatus.analysisRate} fps
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-[12px] text-gray-600 mb-1.5">
                <span>整体进度</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-[5px]">
                <div
                  className="h-[5px] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: '#0052d9' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-[13px] font-medium text-gray-900 mb-4">步骤时间线</h3>
            <div className="space-y-2.5">
              {detail.steps.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${getStepStatusColor(step.status)}`}
                    style={step.status === 'in_progress' ? { background: '#0052d9' } : {}}
                  >
                    {step.status === 'completed'
                      ? <i className="ri-check-line text-[13px]"></i>
                      : step.order}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={`text-[12px] font-medium ${step.status === 'in_progress' ? 'text-[#0052d9]' : 'text-gray-800'}`}>
                        {step.name}
                      </h4>
                      {step.status === 'completed' && (
                        <span className="text-[11px] text-gray-400">{step.duration}s / {step.timeout}s</span>
                      )}
                      {step.status === 'in_progress' && (
                        <span className="text-[11px] font-medium" style={{ color: '#0052d9' }}>进行中</span>
                      )}
                    </div>
                    {step.status === 'completed' && (
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span>{step.startTime} - {step.endTime}</span>
                        {step.compliance && (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <i className="ri-checkbox-circle-line"></i>合规
                          </span>
                        )}
                        {step.confidence && (
                          <span>置信度: {(step.confidence * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    )}
                    {step.status === 'in_progress' && (
                      <div className="mt-1.5">
                        <div className="w-full bg-gray-100 rounded-full h-[4px]">
                          <div className="h-[4px] rounded-full animate-pulse" style={{ width: '60%', background: '#0052d9' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            {/* Current Step Detail */}
            <div className="mb-5">
              <h3 className="text-[13px] font-medium text-gray-900 mb-3">当前步骤详情</h3>
              {currentStep && (
                <div className="rounded-lg border p-3.5" style={{ background: 'rgba(0,82,217,0.04)', borderColor: 'rgba(0,82,217,0.15)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium" style={{ color: '#0052d9' }}>步骤 {currentStep.order}</span>
                    <span className="px-2 py-0.5 text-white text-[10px] rounded" style={{ background: '#0052d9' }}>进行中</span>
                  </div>
                  <h4 className="font-medium text-[13px] text-gray-900 mb-1.5">{currentStep.name}</h4>
                  <div className="text-[11px] text-gray-500 mb-2.5">超时阈值: {currentStep.timeout}s</div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">已用时间</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{elapsedTime}s</span>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: 'rgba(0,82,217,0.12)' }}>
                    <div className="w-full rounded-full h-[5px]" style={{ background: 'rgba(0,82,217,0.12)' }}>
                      <div
                        className="h-[5px] rounded-full transition-all"
                        style={{ width: `${Math.min((elapsedTime / currentStep.timeout) * 100, 100)}%`, background: '#0052d9' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Stream */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-medium text-gray-900">事件流</h3>
                <button
                  onClick={handleClearEvents}
                  className="text-[11px] hover:underline cursor-pointer whitespace-nowrap"
                  style={{ color: '#0052d9' }}
                >
                  清空
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {events.length === 0 && (
                  <div className="text-center text-[12px] text-gray-400 py-6">暂无事件</div>
                )}
                {events.map((event) => (
                  <div key={event.id} className={`border-l-[3px] rounded-r p-2.5 ${getEventLevelColor(event.level)}`}>
                    <div className="flex items-start gap-2">
                      <i className={`ri-${
                        event.level === 'success' ? 'checkbox-circle' :
                        event.level === 'warning' ? 'alert' :
                        event.level === 'error' ? 'error-warning' : 'information'
                      }-line text-[13px] mt-0.5 ${
                        event.level === 'success' ? 'text-emerald-500' :
                        event.level === 'warning' ? 'text-orange-500' :
                        event.level === 'error' ? 'text-red-500' : 'text-[#0052d9]'
                      }`}></i>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-medium text-gray-700">{event.stepName}</span>
                          <span className="text-[10px] text-gray-400">{event.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{event.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h3 className="text-[13px] font-medium text-gray-900 mb-3">快速操作</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-[7px] border border-gray-200 text-gray-600 rounded text-[12px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer">
                  <i className="ri-pause-circle-line text-[14px]"></i>
                  暂停任务
                </button>
                <button className="w-full px-3 py-[7px] border border-gray-200 text-gray-600 rounded text-[12px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer">
                  <i className="ri-download-line text-[14px]"></i>
                  导出记录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}