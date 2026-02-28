export default function OpenSourceSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* 左侧文字 */}
          <div className="text-white">
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20">
              开放平台
            </div>
            <h2 className="text-4xl font-bold mb-6">
              开放 API，快速集成
            </h2>
            <p className="text-blue-50 text-base leading-relaxed mb-8">
              提供完整的 RESTful API 和 WebSocket 接口，支持摄像头接入、实时检测、告警推送等全流程能力。5 分钟即可完成接入，让您的业务系统快速拥有视觉 AI 能力。
            </p>
            <ul className="space-y-4 mb-10">
              {[
                { icon: 'ri-code-s-slash-line', text: '完整的 API 文档与 SDK' },
                { icon: 'ri-shield-check-line', text: '企业级安全认证机制' },
                { icon: 'ri-customer-service-2-line', text: '7×24 小时技术支持' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-white text-base`}></i>
                  </div>
                  <span className="text-blue-50 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <button className="px-8 py-3 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap cursor-pointer">
                查看 API 文档
              </button>
              <button className="px-8 py-3 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all whitespace-nowrap cursor-pointer">
                下载 SDK
              </button>
            </div>
          </div>

          {/* 右侧代码示例 */}
          <div className="bg-slate-900 rounded-xl p-6 shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-slate-400 text-xs ml-2">camera_detection.py</span>
            </div>
            <pre className="text-sm text-slate-300 leading-relaxed overflow-x-auto">
              <code>{`import openvision

# 初始化客户端
client = openvision.Client(
    api_key="your_api_key"
)

# 添加摄像头
camera = client.add_camera(
    rtsp_url="rtsp://192.168.1.100",
    name="工厂入口摄像头"
)

# 启动检测任务
task = camera.start_detection(
    model="safety-helmet-v2",
    alert_callback=handle_alert
)

# 实时告警回调
def handle_alert(alert):
    print(f"检测到违规: {alert.type}")
    print(f"位置: {alert.location}")
    print(f"置信度: {alert.confidence}")`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
