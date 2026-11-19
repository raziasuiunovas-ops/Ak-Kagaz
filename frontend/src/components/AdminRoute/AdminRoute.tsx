import { Navigate } from 'react-router-dom';
import { useCurrentUser, isAuthenticated, removeToken } from '@/hooks';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: user, isLoading, isError, error } = useCurrentUser();

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

  // Обрабатываем ошибки с различением типов
  if (isError) {
    const errorObj = error as any;
    
    // Если 401/403 - токен невалиден, очищаем и редиректим на login
    if (errorObj?.status === 401 || errorObj?.status === 403) {
      removeToken();
      return <Navigate to="/login" replace />;
    }
    
    // Если network error или другая временная ошибка - показываем сообщение
    // но НЕ выкидываем пользователя
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        gap: '16px'
      }}>
        <p style={{ fontSize: '18px', fontWeight: 500 }}>
          ⚠️ Не удалось подключиться к серверу
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Проверьте соединение и попробуйте снова
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#26577c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Обновить страницу
        </button>
      </div>
    );
  }

  // Если нет данных пользователя (не должно происходить, но на всякий случай)
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Загрузка профиля...</p>
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
