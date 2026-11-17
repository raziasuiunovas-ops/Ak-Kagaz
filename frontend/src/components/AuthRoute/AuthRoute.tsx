import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, removeToken, useCurrentUser } from '@/hooks';
import { ProfileGuestPage } from '@/pages/ProfileGuestPage';

interface AuthRouteProps {
  children: React.ReactNode;
}

export function AuthRoute({ children }: AuthRouteProps) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const hasToken = isAuthenticated();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (hasToken && isError) {
      removeToken();
    }
  }, [hasToken, isError]);

  if (!hasToken) {
    // На мобильных показываем страницу гостя, на десктопе редирект
    if (isMobile) {
      return <ProfileGuestPage />;
    }
    // Сохраняем текущий путь для возврата после авторизации
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (isLoading) {
    return <div role="status" aria-live="polite">Загрузка профиля…</div>;
  }

  if (isError || !user) {
    // На мобильных показываем страницу гостя, на десктопе редирект
    if (isMobile) {
      return <ProfileGuestPage />;
    }
    // Сохраняем текущий путь для возврата после авторизации
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
