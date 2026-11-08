import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, removeToken, useCurrentUser } from '@/hooks';

interface AuthRouteProps {
  children: React.ReactNode;
}

export function AuthRoute({ children }: AuthRouteProps) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const hasToken = isAuthenticated();

  useEffect(() => {
    if (hasToken && isError) {
      removeToken();
    }
  }, [hasToken, isError]);

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div role="status" aria-live="polite">Загрузка профиля…</div>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
