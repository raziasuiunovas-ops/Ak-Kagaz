import { Icon } from '@/components/Icon';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export function LoadingState({ message, fullHeight = false }: LoadingStateProps) {
  const { t } = useLocale();

  return (
    <div className={`${styles.loadingState} ${fullHeight ? styles.fullHeight : ''}`}>
      <Icon name="progress_activity" className={styles.spinner} />
      <p className={styles.message}>{message || t('common.loading')}</p>
    </div>
  );
}
