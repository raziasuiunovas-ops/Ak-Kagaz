import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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
  };
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Auth API calls
async function loginAPI(credentials: LoginCredentials): Promise<AuthResponse> {
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

    const result = await response.json();
    // Backend wraps response in { data: { user, token } } or { data: { requires2FA, userId, ... } }
    return result.data;
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

    const result = await response.json();
    return result.data;
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

    const result = await response.json();
    // Backend wraps response in { data: { user, token } }
    return result.data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:4000');
    }
    throw error;
  }
}

async function getMeAPI(token: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

// Token management
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Hooks
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAPI,
    onSuccess: (data: any) => {
      // Если требуется 2FA, не редиректим - остаёмся на странице
      if (data.requires2FA) {
        return;
      }

      // Обычный вход без 2FA
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Проверяем роль пользователя для автоматического перенаправления
      const userRoles = (data.user as any).userRoles || [];
      const isAdmin = userRoles.some((ur: any) => 
        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE'].includes(ur.role?.name)
      );
      
      // Если админ - перенаправляем в админ-панель, иначе в профиль
      navigate(isAdmin ? '/admin' : '/profile');
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerAPI,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      navigate('/profile');
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
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
