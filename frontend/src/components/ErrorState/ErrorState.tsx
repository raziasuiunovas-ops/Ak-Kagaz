import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useLocale();

  return (
    <div className={styles.errorState}>
      <div className={styles.iconWrapper}>
        <AlertCircle className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title || t('common.error')}</h3>
      <p className={styles.message}>{message || t('error.unknown')}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          <RefreshCw className={styles.retryIcon} />
          <span>{t('common.tryAgain')}</span>
        </button>
      )}
    </div>
  );
}
