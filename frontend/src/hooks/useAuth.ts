import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '@/services/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface Verify2FAData {
  userId: string;
  code: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locale?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    status: string;
    locale: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
    userRoles?: Array<{ role: { name: string } }>;
  };
  token: string;
}

interface TwoFactorRequiredResponse {
  requires2FA: true;
  userId: string;
  email: string;
  codeSent: boolean;
  expiresInMinutes: number;
}

type LoginResponse = AuthResponse | TwoFactorRequiredResponse;

const API_URL = API_BASE_URL;

// Auth API calls
async function loginAPI(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const payload = await response.json();
    const data = payload.data ?? payload;
    if (data.requires2FA && !data.codeSent) {
      throw new Error('Код 2FA не доставлен в Telegram. Проверьте настройки Telegram-бота на backend.');
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:4000');
    }
    throw error;
  }
}

async function verify2FAAPI(data: Verify2FAData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '2FA verification failed' }));
      throw new Error(error.message || '2FA verification failed');
    }

    const payload = await response.json();
    return payload.data ?? payload;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу');
    }
    throw error;
  }
}

async function registerAPI(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    const payload = await response.json();
    return payload.data ?? payload;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:4000');
    }
    throw error;
  }
}

async function getMeAPI(token: string) {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Различаем типы ошибок для корректной обработки
      if (response.status === 401 || response.status === 403) {
        const error = new Error('Unauthorized');
        (error as any).status = response.status;
        throw error;
      }
      const error = new Error(`HTTP ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const payload = await response.json();
    return payload.data ?? payload;
  } catch (error) {
    // Различаем network errors от HTTP errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error');
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

// Token management
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
  // The shared API client reads this legacy key for authenticated requests.
  localStorage.setItem('access_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('refresh_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Hooks
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      // Если требуется 2FA, не редиректим - остаёмся на странице
      if ('requires2FA' in data) {
        return;
      }

      // Обычный вход без 2FA
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Проверяем роль пользователя для автоматического перенаправления
      const userRoles = data.user.userRoles || [];
      const isAdmin = userRoles.some((ur) =>
        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE'].includes(ur.role?.name)
      );
      
      // Проверяем, есть ли сохранённый путь для возврата
      const from = (location.state as { from?: string })?.from;
      
      if (from && !isAdmin) {
        // Если есть сохранённый путь и пользователь не админ, возвращаем туда
        navigate(from, { replace: true });
      } else if (isAdmin) {
        // Если админ - перенаправляем в админ-панель
        navigate('/admin');
      } else {
        // Иначе в профиль
        navigate('/profile');
      }
    },
  });
}

export function useVerify2FA() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verify2FAAPI,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // После 2FA всегда админ, редиректим в админ-панель
      navigate('/admin');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerAPI,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Проверяем, есть ли сохранённый путь для возврата
      const from = (location.state as { from?: string })?.from;
      
      if (from) {
        // Если есть сохранённый путь, возвращаем туда
        navigate(from, { replace: true });
      } else {
        // Иначе в профиль
        navigate('/profile');
      }
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    queryClient.clear();
    navigate('/');
  };
}

export function useCurrentUser() {
  const token = getToken();

  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => {
      if (!token) {
        throw new Error('No token');
      }
      return getMeAPI(token);
    },
    enabled: !!token,
    retry: (failureCount, error: any) => {
      // Не повторяем при 401/403 - токен точно невалиден
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Повторяем до 3 раз при network errors и других ошибках
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 5000);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
