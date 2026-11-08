import { Navigate } from 'react-router-dom';
import { useCurrentUser, isAuthenticated } from '@/hooks';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: user, isLoading } = useCurrentUser();

  // Проверяем наличие токена
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Ждем загрузки данных пользователя
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Проверяем роль пользователя
  const hasAdminRole = user?.userRoles?.some(
    (ur: any) =>
      ur.role.name === 'SUPER_ADMIN' ||
      ur.role.name === 'ADMIN' ||
      ur.role.name === 'MANAGER' ||
      ur.role.name === 'WAREHOUSE'
  );

  if (!hasAdminRole) {
    // Если нет административной роли, редиректим на главную
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
