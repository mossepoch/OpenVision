import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    groupLabel: '应用',
    items: [
      { path: '/dashboard', icon: 'ri-dashboard-line', label: '工作台' },
      { path: '/monitoring', icon: 'ri-tv-line', label: '实时监控' },
      { path: '/sop-config', icon: 'ri-file-list-3-line', label: 'SOP 配置' },
      { path: '/stations', icon: 'ri-layout-grid-line', label: '工位管理' },
      { path: '/devices', icon: 'ri-camera-line', label: '设备管理' },
    ],
  },
  {
    groupLabel: '模型训练',
    items: [
      { path: '/datasets', icon: 'ri-database-2-line', label: '数据集管理' },
      { path: '/annotation', icon: 'ri-edit-box-line', label: '数据标注' },
      { path: '/training', icon: 'ri-cpu-line', label: '模型训练' },
      { path: '/models', icon: 'ri-robot-line', label: '模型管理' },
    ],
  },
];

export default function Sidebar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Simple error handling for navigation failures
  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (err) {
      console.error(`Navigation to ${path} failed:`, err);
    }
  };

  return (
    <div className="h-full text-gray-900 flex flex-col w-[200px] flex-shrink-0 border-r border-white/60">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[12px] font-bold"
            style={{ background: '#0052d9' }}
          >
            O
          </div>
          <span className="text-[13px] font-semibold text-gray-900 tracking-wide">
            OpenVision
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto space-y-3">
        {menuGroups.map((group) => (
          <div key={group.groupLabel}>
            {/* Group Label */}
            <div className="px-3 mb-1">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                {group.groupLabel}
              </span>
            </div>
            {/* Group Items */}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 mb-0.5 text-[14px] font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#0052d9] bg-white font-bold shadow-sm'
                      : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-[16px]`}></i>
                  </div>
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-2">
        {/* Alert Button */}
        <Link
          to="/alerts"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer mb-0.5 text-[14px] font-semibold ${
            location.pathname === '/alerts'
              ? 'bg-white text-[#0052d9] font-bold shadow-sm'
              : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
          }`}
        >
          <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
            <i className="ri-alarm-warning-line text-[16px]"></i>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </div>
          <span className="whitespace-nowrap">异常告警</span>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer text-gray-500 hover:text-gray-800 text-[14px] font-semibold"
          >
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[9px] font-medium text-white">
                管
              </div>
            </div>
            <span className="whitespace-nowrap">用户中心</span>
          </button>

          {showUserMenu && (
            <>
              {/* Overlay to close the menu when clicking outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-lg shadow-lg py-1 z-50">
                <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  个人设置
                </button>
                <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  修改密码
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/'); }}
                  className="w-full px-4 py-2 text-left text-[13px] font-medium text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
