import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { setToken } from './useAuth';

interface AdminLoginCredentials {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  userId: string;
  email: string;
  requires2FA: boolean;
  codeSent: boolean;
  expiresInMinutes: number;
}

interface Verify2FAData {
  userId: string;
  code: string;
}

interface Verify2FAResponse {
  user: {
    id: string;
    email: string;
    status: string;
    locale: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function adminLoginAPI(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Admin login failed' }));
      throw new Error(error.message || 'Admin login failed');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:4000');
    }
    throw error;
  }
}

async function adminVerify2FAAPI(data: Verify2FAData): Promise<Verify2FAResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/admin/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '2FA verification failed' }));
      throw new Error(error.message || '2FA verification failed');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:4000');
    }
    throw error;
  }
}

export function useAdminLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: adminLoginAPI,
    onSuccess: (data) => {
      // Сохраняем userId для следующего этапа (2FA)
      sessionStorage.setItem('admin_2fa_userId', data.userId);
      sessionStorage.setItem('admin_2fa_email', data.email);
      
      // Переходим на страницу верификации 2FA
      navigate('/admin/verify-2fa');
    },
  });
}

export function useAdminVerify2FA() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminVerify2FAAPI,
    onSuccess: (data) => {
      // Сохраняем токен
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Очищаем временные данные
      sessionStorage.removeItem('admin_2fa_userId');
      sessionStorage.removeItem('admin_2fa_email');
      
      // Переходим в админ-панель
      navigate('/admin');
    },
  });
}
