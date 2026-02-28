export default function Footer() {
  const links = [
    {
      title: '产品',
      items: ['核心平台', '算法市场', '边缘部署', '数据标注', '模型训练'],
    },
    {
      title: '解决方案',
      items: ['工业安全', '零售分析', '园区安防', '交通监控', '智慧工地'],
    },
    {
      title: '开发者',
      items: ['API 文档', 'SDK 下载', '开发者社区', '示例代码', '更新日志'],
    },
    {
      title: '支持',
      items: ['帮助中心', '技术支持', '商务合作', '联系我们', '服务协议'],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-eye-line text-white text-lg"></i>
              </div>
              <span className="text-lg font-bold">OpenVision</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              基于摄像头 + AI 的新一代视觉智能平台，让每一个摄像头都拥有智慧的眼睛。
            </p>
            <div className="flex items-center gap-3">
              {['ri-github-line', 'ri-twitter-x-line', 'ri-linkedin-box-line', 'ri-wechat-line'].map((icon, i) => (
                <div key={i} className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <i className={`${icon} text-gray-400 text-base`}></i>
                </div>
              ))}
            </div>
          </div>

          {links.map((col, i) => (
            <div key={i}>
              <h4 className="font-bold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.items.map((item, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors cursor-pointer" rel="nofollow">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">Copyright © 2025 OpenVision. All rights reserved.</p>
          <a
            href="https://readdy.ai/?ref=logo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            Powered by Readdy
          </a>
        </div>
      </div>
    </footer>
  );
}
