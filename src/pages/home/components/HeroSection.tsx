export default function HeroSection() {
  return (
    <section className="relative bg-[#f5f8ff] pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center gap-16">
          {/* 左侧文字内容 */}
          <div className="flex-1">
            <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              <span className="text-sm text-blue-700 font-medium">基于摄像头 + AI 的新一代视觉智能平台</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-5 leading-tight text-gray-900">
              让每一个摄像头<br />
              <span className="text-blue-600">都拥有智慧的眼睛</span>
            </h1>
            
            <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-xl">
              OpenVision 将 AI 视觉能力与摄像头硬件深度融合，提供从数据采集、模型训练到实时推理的全链路视觉智能解决方案，赋能工业、安防、零售等多行业场景。
            </p>
            
            <div className="flex items-center gap-4 mb-12">
              <button className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap cursor-pointer">
                立即体验
              </button>
              <button className="px-8 py-3 text-base font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap cursor-pointer">
                查看文档
              </button>
            </div>

            {/* 数据指标 */}
            <div className="flex items-center gap-12">
              {[
                { value: '500+', label: '接入摄像头型号' },
                { value: '99.2%', label: '检测准确率' },
                { value: '<50ms', label: '实时推理延迟' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧平台截图 */}
          <div className="flex-1">
            <div className="relative">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20industrial%20monitoring%20dashboard%20interface%20showing%20multiple%20camera%20feeds%20with%20AI%20detection%20overlays%2C%20clean%20professional%20UI%20design%20with%20blue%20accent%20colors%2C%20real-time%20analytics%20charts%20and%20alert%20panels%2C%20high-tech%20surveillance%20control%20center%20screen%2C%20realistic%20software%20interface%20screenshot&width=700&height=500&seq=hero-dashboard-ui-01&orientation=landscape"
                alt="OpenVision 平台界面"
                className="w-full h-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
