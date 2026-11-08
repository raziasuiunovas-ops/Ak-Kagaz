import { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  const { t } = useLocale();

  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        {icon || <PackageOpen className={styles.icon} size={48} />}
      </div>
      <h3 className={styles.title}>{title || t('common.noResults')}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
