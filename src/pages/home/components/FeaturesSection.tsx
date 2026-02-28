export default function FeaturesSection() {
  const features = [
    {
      icon: 'ri-camera-3-line',
      title: '多协议摄像头接入',
      description: '支持 RTSP、ONVIF、HTTP-FLV、GB28181 等主流协议，兼容海康、大华、宇视等 500+ 品牌摄像头，即插即用，分钟级完成设备接入。'
    },
    {
      icon: 'ri-search-eye-line',
      title: '实时目标检测与识别',
      description: '基于最新视觉大模型，支持人员、车辆、物品、行为等多类目标的实时检测与识别，毫秒级响应，准确率高达 99.2%。'
    },
    {
      icon: 'ri-alert-line',
      title: '智能告警与事件管理',
      description: '自定义告警规则，支持越界、徘徊、人员聚集、安全帽检测等场景，告警事件自动推送至钉钉、企微、短信等多渠道。'
    },
    {
      icon: 'ri-database-2-line',
      title: '数据标注与模型训练',
      description: '内置可视化标注工具，支持图片与视频帧标注，一键触发模型训练，自动评估模型效果，持续迭代优化检测精度。'
    },
    {
      icon: 'ri-server-line',
      title: '云边协同推理部署',
      description: '支持模型一键下发至边缘设备，本地推理降低带宽消耗，云端统一管理所有边缘节点，实现真正的云边协同架构。'
    },
    {
      icon: 'ri-bar-chart-box-line',
      title: '数据报表与合规分析',
      description: '自动生成巡检报告、合规统计、告警趋势等多维度报表，支持 PDF 导出，满足企业安全管理与监管合规需求。'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">六大核心能力</h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            覆盖视觉 AI 全链路，从摄像头接入到智能决策，一个平台全部搞定
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-lg p-6 border-l-4 border-transparent hover:border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                  <i className={`${feature.icon} text-xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
