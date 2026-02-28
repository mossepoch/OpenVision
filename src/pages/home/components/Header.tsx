interface HeaderProps {
  scrolled: boolean;
}

export default function Header({ scrolled }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-sm border-b border-gray-100' : ''
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-eye-line text-white text-base"></i>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              OpenVision
            </span>
          </div>
          <nav className="flex items-center gap-8">
            {['产品功能', '解决方案', '硬件接入', '开发者', '关于我们'].map((item, i) => (
              <a
                key={i}
                href={['#features','#solutions','#hardware','#developer','#about'][i]}
                className="relative text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer group"
              >
                {item}
                <span className="absolute left-0 right-0 bottom-[-20px] h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer">
            登录
          </button>
          <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all whitespace-nowrap cursor-pointer">
            免费试用
          </button>
        </div>
      </div>
    </header>
  );
}
