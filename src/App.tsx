import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppRoutes } from './router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Sidebar from './components/feature/Sidebar';

function AppContent() {
  const location = useLocation();
  const noSidebarPaths = ['/', '/home', '/login'];
  const isNoSidebar = noSidebarPaths.includes(location.pathname);

  if (isNoSidebar) {
    return <AppRoutes />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative bg-[#f4f3f8]">
      {/* 左侧侧边栏区域：纯浅色，无彩色 */}
      <div className="h-full w-[200px] flex-shrink-0 bg-[#f4f3f8] relative z-10">
        <Sidebar />
      </div>

      {/* 右侧内容区：彩色晕染渐变背景 */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f4f3f8 0%, #f0edfb 15%, #ece8f9 25%, #ddd6fe 45%, #bfdbfe 70%, #c7d2fe 100%)',
        }}
      >
        {/* 晕染光晕层 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 left-[20%] w-[400px] h-[400px] rounded-full opacity-35"
            style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 65%)', filter: 'blur(90px)' }}
          ></div>
          <div
            className="absolute top-1/2 right-0 w-[350px] h-[350px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #93c5fd 0%, transparent 65%)', filter: 'blur(80px)' }}
          ></div>
          <div
            className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #ddd6fe 0%, transparent 65%)', filter: 'blur(70px)' }}
          ></div>
        </div>

        {/* 内容白色圆角容器 */}
        <div className="absolute inset-3 rounded-xl overflow-hidden shadow-sm bg-white/60 backdrop-blur-xl z-10">
          <div className="h-full overflow-y-auto bg-white">
            <AppRoutes />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppContent />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
