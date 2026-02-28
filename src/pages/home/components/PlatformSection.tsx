export default function PlatformSection() {
  const architectureLayers = [
    {
      icon: 'ri-camera-3-line',
      title: '摄像头接入',
      description: 'RTSP / ONVIF / GB28181',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: 'ri-database-2-line',
      title: '数据处理',
      description: '视频流解析 / 帧提取',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: 'ri-brain-line',
      title: 'AI 推理',
      description: '目标检测 / 行为识别',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: 'ri-apps-line',
      title: '业务应用',
      description: '告警 / 报表 / 分析',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <section id="platform" className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">平台架构</h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            从摄像头接入到业务应用，OpenVision 提供完整的视觉 AI 全链路能力
          </p>
        </div>
        
        <div className="relative">
          <div className="grid grid-cols-4 gap-6">
            {architectureLayers.map((layer, index) => (
              <div key={index} className="relative">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300">
                  <div className={`w-14 h-14 ${layer.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                    <i className={`${layer.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 text-center mb-2">{layer.title}</h3>
                  <p className="text-sm text-gray-500 text-center leading-relaxed">{layer.description}</p>
                </div>
                {index < architectureLayers.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <i className="ri-arrow-right-line text-2xl text-gray-300"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
