export default function EcosystemSection() {
  const scenarios = [
    {
      title: '工厂安全生产',
      image:
        'https://readdy.ai/api/search-image?query=modern%20factory%20production%20line%20with%20workers%20wearing%20safety%20helmets%20and%20equipment%2C%20industrial%20manufacturing%20environment%20with%20machinery%20and%20assembly%20line%2C%20bright%20lighting%2C%20professional%20industrial%20photography%2C%20clean%20and%20organized%20workspace&width=400&height=280&seq=factory-safety-scene-01&orientation=landscape',
      capabilities: ['安全帽检测', '工作服识别', '危险区域入侵'],
    },
    {
      title: '零售客流分析',
      image:
        'https://readdy.ai/api/search-image?query=modern%20retail%20store%20interior%20with%20customers%20shopping%2C%20bright%20commercial%20space%20with%20product%20shelves%20and%20displays%2C%20people%20walking%20through%20aisles%2C%20professional%20retail%20photography%2C%20clean%20and%20spacious%20environment&width=400&height=280&seq=retail-analysis-scene-02&orientation=landscape',
      capabilities: ['客流统计', '热力图分析', '顾客行为追踪'],
    },
    {
      title: '园区智慧安防',
      image:
        'https://readdy.ai/api/search-image?query=modern%20business%20park%20campus%20with%20buildings%20and%20walkways%2C%20security%20monitoring%20view%2C%20people%20walking%20in%20outdoor%20plaza%20area%2C%20professional%20architecture%20photography%2C%20daytime%20clear%20weather&width=400&height=280&seq=campus-security-scene-03&orientation=landscape',
      capabilities: ['人脸识别', '车牌识别', '异常行为检测'],
    },
  ];

  return (
    <section id="scenarios" className="py-20 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">应用场景</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            OpenVision 已在多个行业场景中落地应用，为企业提供智能化视觉解决方案
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scenario, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative w-full overflow-hidden" style={{ height: '200px' }}>
                <img
                  src={scenario.image}
                  alt={scenario.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {scenario.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {scenario.capabilities.map((cap, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium group-hover:gap-2 transition-all"
                >
                  了解更多
                  <i className="ri-arrow-right-line text-base"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
