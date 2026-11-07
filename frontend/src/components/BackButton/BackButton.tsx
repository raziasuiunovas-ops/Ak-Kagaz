import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BackButton.module.css';

interface BackButtonProps {
  fallback?: string;
}

export function BackButton({ fallback = '/admin' }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Проверяем, есть ли история
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Если истории нет, используем fallback
      navigate(fallback);
    }
  };

  // Не показываем кнопку на главной Dashboard
  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <button className={styles.backButton} onClick={handleBack}>
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>Назад</span>
    </button>
  );
}
