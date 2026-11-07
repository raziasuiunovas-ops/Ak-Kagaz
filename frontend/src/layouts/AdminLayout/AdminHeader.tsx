import { useNavigate } from 'react-router-dom';
import { useLogout, useCurrentUser } from '@/hooks';
import styles from './AdminHeader.module.css';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const handleLogout = () => {
    logout();
  };

  const goToSite = () => {
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className={styles.title}>Административная панель</h1>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={goToSite} title="Перейти на сайт">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        <div className={styles.divider} />

        <div className={styles.profile}>
          <span className={styles.userName}>
            {user?.profile?.firstName || user?.email || 'Администратор'}
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
