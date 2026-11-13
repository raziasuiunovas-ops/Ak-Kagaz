import { Icon } from '@/components/Icon';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './LoadingState.module.css';

export type LoadingVariant = 'global' | 'section' | 'inline';

interface LoadingStateProps {
  message?: string;
  variant?: LoadingVariant;
  /** Kept for existing page call sites; prefer `variant="global"`. */
  fullHeight?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function LoadingState({
  message,
  variant = 'section',
  fullHeight = false,
  skeletonCount = 0,
  className = '',
}: LoadingStateProps) {
  const { t } = useLocale();
  const mode = fullHeight ? 'global' : variant;
  const label = message || t('common.loading');

  return (
    <div
      className={`${styles.loadingState} ${styles[mode]} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {mode === 'section' && skeletonCount > 0 ? (
        <div className={styles.skeletonGrid} aria-hidden="true">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <div className={styles.skeletonCard} key={index}>
              <span className={styles.skeletonImage} />
              <span className={styles.skeletonLine} />
              <span className={`${styles.skeletonLine} ${styles.shortLine}`} />
              <span className={`${styles.skeletonLine} ${styles.actionLine}`} />
            </div>
          ))}
        </div>
      ) : (
        <span className={styles.mark} aria-hidden="true">
          <span className={styles.markRing} />
          <Icon name="progress_activity" className={styles.spinner} />
        </span>
      )}
      {mode !== 'inline' && <p className={styles.message}>{label}</p>}
      {mode === 'inline' && <span className={styles.srOnly}>{label}</span>}
    </div>
  );
}
