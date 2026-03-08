/**
 * 认证 API
 * 注意：后端 login 用 OAuth2PasswordRequestForm，需要 form-urlencoded 格式
 */
import { api } from './client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email?: string;
    is_admin: boolean;
  };
}

export const authApi = {
  login: async (username: string, password: string): Promise<TokenResponse> => {
    // OAuth2PasswordRequestForm 要求 form-urlencoded
    const body = new URLSearchParams({ username, password });
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: '登录失败' }));
      throw new Error(err.detail || '登录失败');
    }
    return response.json();
  },

  register: (username: string, password: string, email?: string) =>
    api.post<TokenResponse>('/api/v1/auth/register', { username, password, email }),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
