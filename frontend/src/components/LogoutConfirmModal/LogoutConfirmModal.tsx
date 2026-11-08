import { X } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './LogoutConfirmModal.module.css';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  const { t } = useLocale();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>{t('auth.logoutConfirmTitle')}</h2>
          <p className={styles.description}>{t('auth.logoutConfirmMessage')}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
