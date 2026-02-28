export default function HardwareSection() {
  const brands = [
    '海康威视 Hikvision',
    '大华 Dahua',
    '宇视 Uniview',
    '华为 Huawei',
    '天地伟业 Tiandy',
    '萤石 EZVIZ',
  ];

  const devices = [
    {
      icon: 'ri-camera-line',
      name: 'IPC 网络摄像头',
      desc: '支持 RTSP/ONVIF 协议',
    },
    {
      icon: 'ri-vidicon-line',
      name: '球机 / 枪机',
      desc: 'PTZ 云台控制',
    },
    {
      icon: 'ri-cpu-line',
      name: '边缘 AI 盒子',
      desc: '本地推理加速',
    },
    {
      icon: 'ri-router-line',
      name: 'NVR / DVR',
      desc: '视频录像主机',
    },
  ];

  return (
    <section id="hardware" className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* 左侧文字介绍 */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              广泛的硬件兼容能力
            </h2>
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              OpenVision 支持市面上主流的摄像头品牌与协议，无论是老旧模拟设备还是最新 AI 摄像机，均可快速接入统一管理。
            </p>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                兼容品牌（500+ 型号）
              </h3>
              <div className="flex flex-wrap gap-3">
                {brands.map((brand, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-gray-50 text-sm text-gray-700 rounded-lg border border-gray-200"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                '支持 RTSP / ONVIF / GB28181 / HTTP-FLV 等主流协议',
                '兼容 4G / 5G / 有线网络多种接入方式',
                '边缘 AI 盒子一键部署，无需改造现有摄像头',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-check-line text-blue-600 text-lg"></i>
                  </div>
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>

            <button className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
              查看兼容列表
            </button>
          </div>

          {/* 右侧设备网格 */}
          <div className="grid grid-cols-2 gap-4">
            {devices.map((device, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <i className={`${device.icon} text-blue-600 text-2xl`}></i>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  {device.name}
                </h4>
                <p className="text-sm text-gray-500">{device.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
