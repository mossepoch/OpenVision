export default function PartnersSection() {
  const partners = [
    { name: '海康威视', sub: 'Hikvision' },
    { name: '大华股份', sub: 'Dahua' },
    { name: '宇视科技', sub: 'Uniview' },
    { name: '华为云', sub: 'Huawei Cloud' },
    { name: '阿里云', sub: 'Alibaba Cloud' },
    { name: '腾讯云', sub: 'Tencent Cloud' },
    { name: '英伟达', sub: 'NVIDIA' },
    { name: '中国移动', sub: 'China Mobile' },
    { name: '中国电信', sub: 'China Telecom' },
    { name: '旷视科技', sub: 'Face++' },
    { name: '商汤科技', sub: 'SenseTime' },
    { name: '地平线', sub: 'Horizon Robotics' },
  ];

  return (
    <section id="partners" className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">合作伙伴</h2>
          <p className="text-gray-500 text-base">与行业领先企业携手，共建视觉 AI 生态</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((p, index) => (
            <div 
              key={index} 
              className="h-28 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center px-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{p.name}</span>
              <span className="text-xs text-gray-400 mt-1">{p.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
