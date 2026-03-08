/**
 * 路由守卫
 * - AuthGuard: 未登录跳 /login
 * - GuestGuard: 已登录跳 /dashboard（用于登录页）
 */
import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';

const isLoggedIn = () => !!localStorage.getItem('access_token');

/** 需要登录才能访问的路由 */
export function AuthGuard({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** 已登录时不应访问的路由（登录页、注册页等） */
export function GuestGuard({ children }: { children: ReactNode }) {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
