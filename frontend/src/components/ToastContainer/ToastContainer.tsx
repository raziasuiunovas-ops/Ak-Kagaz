import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className={styles.icon} aria-hidden="true" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className={styles.icon} aria-hidden="true" />
          )}
          {toast.type === 'info' && <Info className={styles.icon} aria-hidden="true" />}
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => removeToast(toast.id)}
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
