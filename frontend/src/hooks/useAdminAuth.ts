import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/services/api';
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

async function getResponseError(response: Response, fallback: string): Promise<string> {
  const body = await response.text();
  if (!body) return fallback;

  try {
    const data = JSON.parse(body) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(', ');
    if (data.message) return data.message;
  } catch {
    // Proxy errors may return plain text rather than JSON.
  }

  return body;
}

async function adminLoginAPI(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Не удалось войти в админ-панель'));
    }

    const payload = (await response.json()) as {
      data?: AdminLoginResponse;
    } & Partial<AdminLoginResponse>;
    const data = payload.data ?? (payload as AdminLoginResponse);
    if (!data.userId || !data.email) {
      throw new Error('Сервер не вернул данные для подтверждения входа');
    }
    if (!data.requires2FA) {
      throw new Error('Сервер не запросил подтверждение 2FA для администратора');
    }
    if (data.requires2FA && !data.codeSent) {
      throw new Error('Код 2FA не доставлен в Telegram. Проверьте настройки Telegram-бота на backend.');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Проверьте, что API доступен.');
    }
    throw error;
  }
}

async function adminVerify2FAAPI(data: Verify2FAData): Promise<Verify2FAResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Не удалось подтвердить код 2FA'));
    }

    const payload = (await response.json()) as {
      data?: Verify2FAResponse;
    } & Partial<Verify2FAResponse>;
    const result = payload.data ?? (payload as Verify2FAResponse);
    if (!result.token || !result.user?.id) {
      throw new Error('Сервер не вернул данные завершённого входа');
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Проверьте, что API доступен.');
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
