import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from '@/contexts/LocaleContext';
import { setToken } from '@/hooks/useAuth';

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) {
      setError(true);
      return;
    }

    setToken(token);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    void fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load profile');
        const payload = await response.json();
        const user = payload.data ?? payload;
        queryClient.setQueryData(['auth', 'user'], user);
        const isAdmin = user.userRoles?.some(({ role }: { role: { name: string } }) =>
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE'].includes(role.name),
        );
        navigate(isAdmin ? '/admin' : '/profile', { replace: true });
      })
      .catch(() => setError(true));
  }, [navigate, queryClient]);

  return (
    <main className="authStatusPage" role="status">
      {error ? t('auth.googleError') : t('common.loading')}
    </main>
  );
}
