import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './LoginPage.module.css';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M18.171 10.3889C18.171 9.6694 18.111 9.1444 17.981 8.6H10V11.8472H14.521C14.421 12.6541 13.885 13.8694 12.695 14.6861L12.679 14.7948L15.329 16.807L15.513 16.825C17.199 15.2986 18.171 13.0528 18.171 10.3889Z" fill="#4285F4" />
      <path d="M10 19.02C12.387 19.02 14.411 18.24 15.889 16.9L12.671 14.76C11.917 15.28 10.906 15.64 10 15.64C7.615 15.64 5.611 14.11 4.897 12L4.792 12.009L2.036 14.099L2 14.197C3.468 17.056 6.484 19.02 10 19.02Z" fill="#34A853" />
      <path d="M4.849 12.1009C4.661 11.5565 4.552 10.9731 4.552 10.3704C4.552 9.76756 4.661 9.18425 4.839 8.63981L4.834 8.52386L2.044 6.4L1.952 6.44256C1.347 7.62869 1 8.96066 1 10.3704C1 11.7801 1.347 13.112 1.952 14.2981L4.849 12.1009Z" fill="#FBBC05" />
      <path d="M10 4.38331C11.653 4.38331 12.784 5.09303 13.429 5.68612L15.948 3.275C14.401 1.86528 12.387 1 10 1C6.484 1 3.468 2.96387 2 5.82218L4.887 8.01943C5.611 5.90972 7.615 4.38331 10 4.38331Z" fill="#EB4335" />
    </svg>
  );
}

function EyeIcon({ showPassword }: { showPassword: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.81241 10.1631C1.10414 9.24289 0.75 8.78281 0.75 7.41667C0.75 6.05052 1.10414 5.59044 1.81241 4.67028C3.22664 2.83297 5.59843 0.75 9.08333 0.75C12.5682 0.75 14.94 2.83297 16.3543 4.67028C17.0625 5.59044 17.4167 6.05052 17.4167 7.41667C17.4167 8.78281 17.0625 9.24289 16.3543 10.1631C14.94 12.0004 12.5682 14.0833 9.08333 14.0833C5.59843 14.0833 3.22664 12.0004 1.81241 10.1631Z"
        transform="translate(0.917, 2.583)"
        stroke="#868686"
        strokeWidth="1.5"
      />
      <path
        d="M5.75 3.25C5.75 4.63071 4.63071 5.75 3.25 5.75C1.86929 5.75 0.75 4.63071 0.75 3.25C0.75 1.86929 1.86929 0.75 3.25 0.75C4.63071 0.75 5.75 1.86929 5.75 3.25Z"
        transform="translate(7.5, 7.5)"
        stroke="#868686"
        strokeWidth="1.5"
      />
      {!showPassword && (
        <line x1="3" y1="17" x2="17" y2="3" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    setError('');
    navigate('/dashboard');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.leftBg}>
            <div className={styles.gradientWrap}>
              <div className={styles.eclipse}>
                <div className={styles.eclipseInner}>
                  <svg className={styles.svgBlock} fill="none" preserveAspectRatio="none" viewBox="0 0 722 715">
                    <g filter="url(#f1)">
                      <ellipse cx="361" cy="358" fill="url(#g1)" rx="161" ry="158" />
                    </g>
                    <defs>
                      <filter
                        id="f1"
                        x="0"
                        y="0"
                        width="722"
                        height="715"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="bg" />
                        <feBlend in="SourceGraphic" in2="bg" mode="normal" result="shape" />
                        <feGaussianBlur result="blur" stdDeviation="100" />
                      </filter>
                      <linearGradient id="g1" x1="361" y1="200" x2="361" y2="515" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#42DDFF" />
                        <stop offset="1" stopColor="#1170FF" stopOpacity="0.46" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className={styles.planetPink}>
                <div className={styles.planetPinkInner}>
                  <svg className={styles.svgBlock} fill="none" preserveAspectRatio="none" viewBox="0 0 359 355">
                    <g filter="url(#f2)">
                      <ellipse cx="179" cy="178" fill="url(#g2)" rx="79" ry="78" />
                    </g>
                    <defs>
                      <filter
                        id="f2"
                        x="0"
                        y="0"
                        width="359"
                        height="355"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="bg" />
                        <feBlend in="SourceGraphic" in2="bg" mode="normal" result="shape" />
                        <feGaussianBlur result="blur" stdDeviation="50" />
                      </filter>
                      <linearGradient id="g2" x1="179" y1="100" x2="179" y2="255" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F22FB0" />
                        <stop offset="1" stopColor="#F58A25" stopOpacity="0" />
                        <stop offset="1" stopColor="#7061A3" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className={styles.planetPurple}>
                <div className={styles.planetPurpleInner}>
                  <svg className={styles.svgBlock} fill="none" preserveAspectRatio="none" viewBox="0 0 251 249">
                    <g filter="url(#f3)">
                      <ellipse cx="126" cy="125" fill="url(#g3)" rx="46" ry="45" />
                    </g>
                    <defs>
                      <filter
                        id="f3"
                        x="0"
                        y="0"
                        width="251"
                        height="249"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="bg" />
                        <feBlend in="SourceGraphic" in2="bg" mode="normal" result="shape" />
                        <feGaussianBlur result="blur" stdDeviation="40" />
                      </filter>
                      <linearGradient id="g3" x1="126" y1="80" x2="126" y2="169" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#7D40FF" />
                        <stop offset="1" stopColor="#F58A25" stopOpacity="0" />
                        <stop offset="1" stopColor="#7230FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className={styles.textureOverlay} />
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <div className={styles.header}>
              <h1>登录 OpenVision</h1>
              <p>欢迎回来，马上开始新的一天</p>
            </div>

            <button type="button" className={styles.googleBtn}>
              <GoogleIcon />
              谷歌登录
            </button>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span>或</span>
              <div className={styles.dividerLine} />
            </div>

            <div className={styles.fields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="account">
                  用户名/邮箱
                </label>
                <div className={styles.inputWrap}>
                  <input
                    id="account"
                    type="text"
                    className={styles.input}
                    placeholder="输入你的用户名或者邮箱"
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.fieldLabel} htmlFor="password">
                    密码
                  </label>
                  <button type="button" className={styles.forgotBtn}>
                    忘记密码
                  </button>
                </div>
                <div className={styles.inputWrap}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.input} ${styles.passwordInput}`}
                    placeholder="输入你的密码"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    <EyeIcon showPassword={showPassword} />
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorText}>{error}</div>}

              <button type="submit" className={styles.loginBtn}>
                登录
              </button>
            </div>

            <div className={styles.signupRow}>
              <span>还没有账号？</span>
              <button type="button" className={styles.signupBtn}>
                马上注册
              </button>
            </div>
          </form>

          <div className={styles.copyright}>
            &copy; 2025 <strong>OpenVision</strong> 版权所有
          </div>
        </div>
      </div>
    </div>
  );
}
