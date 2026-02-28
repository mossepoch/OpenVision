import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account.trim() || !password.trim()) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ fontFamily: "'Inter', 'PingFang SC', sans-serif", background: '#f5f5f7' }}
    >
      {/* ── 左侧品牌面板 ── */}
      <div
        className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #a78bfa 0%, #7c3aed 45%, #6d28d9 100%)',
        }}
      >
        {/* 光晕 */}
        <div
          className="absolute top-[-100px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,167,255,0.45) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 65%)' }}
        />
        {/* 点阵纹理 */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 px-10 pt-10 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-white/80 text-[13px] tracking-widest font-semibold">···</span>
            <span className="text-white text-[17px] font-bold tracking-wide">OpenVision</span>
          </div>
        </div>

        {/* 中间引用卡片 */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-6">
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.13)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <p className="text-white text-[26px] font-bold leading-[1.45] mb-5">
              "视觉智能驱动未来，<br />让每一帧数据都成为<br />AI 进化的力量"
            </p>
            <p className="text-white/55 text-[13px]">— OpenVision 愿景</p>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="relative z-10 px-10 pb-8">
          <p className="text-white/30 text-[12px]">© 2025 OpenVision 版权所有</p>
        </div>
      </div>

      {/* ── 右侧表单区 ── */}
      <div className="flex-1 flex flex-col justify-between items-center py-16 px-8 bg-white">
        {/* 占位，让表单垂直居中 */}
        <div />

        <div className="w-full max-w-[380px]">
          {/* 标题 */}
          <h2 className="text-gray-900 text-[22px] font-bold text-center mb-8 leading-snug">
            欢迎使用 OpenVision 视觉智能平台
          </h2>

          {/* 谷歌登录 */}
          <button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap mb-5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <span className="text-gray-600 text-[14px] font-medium">谷歌登录</span>
          </button>

          {/* 分割线 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-[13px]">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="block text-[13px] text-gray-600 mb-1.5">用户名或邮箱地址</label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full h-11 px-4 text-[14px] rounded-full border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none transition-all bg-white"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              />
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] text-gray-600">密码</label>
                <button
                  type="button"
                  className="text-[13px] text-violet-600 hover:text-violet-500 cursor-pointer whitespace-nowrap transition-colors"
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-11 text-[14px] rounded-full border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none transition-all bg-white"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-[15px]`} />
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <i className="ri-error-warning-line text-red-400 text-[14px]" />
                <span className="text-[13px] text-red-500">{error}</span>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white text-[15px] font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)';
              }}
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-[15px]" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 注册 */}
          <p className="text-center text-[13px] text-gray-500 mt-5">
            还没有账号？
            <button className="text-violet-600 hover:text-violet-500 cursor-pointer ml-1 whitespace-nowrap transition-colors font-medium">
              现在注册
            </button>
          </p>
        </div>

        {/* 底部版权 */}
        <p className="text-center text-[12px] text-gray-400">
          © 2025 OpenVision 版权所有
        </p>
      </div>
    </div>
  );
}
