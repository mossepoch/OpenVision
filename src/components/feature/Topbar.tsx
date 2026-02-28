
import { useState } from 'react';

export default function Topbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="h-[52px] bg-[#f5f6f7] flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-gray-400">首页</span>
        <i className="ri-arrow-right-s-line text-gray-300 text-[14px]"></i>
        <span className="text-gray-700 font-medium">工作台总览</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索..."
            className="w-[180px] h-8 pl-8 pr-3 text-[12px] bg-white/70 rounded-lg focus:outline-none focus:bg-white focus:shadow-sm transition-all placeholder-gray-400"
          />
          <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]"></i>
        </div>

        {/* Help */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
          <i className="ri-question-line text-gray-500 text-[16px]"></i>
        </button>

        {/* Notifications */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/80 transition-colors cursor-pointer relative">
          <i className="ri-notification-3-line text-gray-500 text-[16px]"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#0052d9] flex items-center justify-center text-white text-[11px] font-medium">
              管
            </div>
            <span className="text-[13px] text-gray-700">管理员</span>
            <i className="ri-arrow-down-s-line text-gray-400 text-[14px]"></i>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-1 w-[140px] bg-white rounded-lg shadow-lg z-20 py-1">
                <button className="w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  个人设置
                </button>
                <button className="w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  修改密码
                </button>
                <div className="my-1 border-t border-gray-100"></div>
                <button className="w-full px-3 py-2 text-left text-[12px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
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
