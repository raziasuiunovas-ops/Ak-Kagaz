import { AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './CartToast.module.css';

interface CartToastProps {
  type: 'added' | 'error';
  message: string;
}

export function CartToast({ type, message }: CartToastProps) {
  const success = type === 'added';

  return (
    <p className={`${styles.toast} ${success ? styles.success : styles.error}`} role={success ? 'status' : 'alert'} aria-live="polite">
      {success
        ? <CheckCircle2 className={styles.icon} aria-hidden="true" />
        : <AlertCircle className={styles.icon} aria-hidden="true" />}
      <span>{message}</span>
    </p>
  );
}
