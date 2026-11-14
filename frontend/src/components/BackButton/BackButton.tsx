import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BackButton.module.css';
import { useLocale } from '@/contexts/LocaleContext';

interface BackButtonProps {
  fallback?: string;
  label?: string;
}

export function BackButton({ fallback = '/catalog', label }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const buttonLabel = label ?? t('common.back');

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
    <button type="button" className={styles.backButton} onClick={handleBack} aria-label={buttonLabel}>
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{buttonLabel}</span>
    </button>
  );
}
