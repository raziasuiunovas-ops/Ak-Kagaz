import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { LogoutConfirmModal } from '@/components/LogoutConfirmModal';
import { useCurrentUser, useLogout } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { t } = useLocale();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const fullName = [user?.profile?.firstName, user?.profile?.lastName]
    .filter(Boolean)
    .join(' ');
  const displayName = fullName || user?.email?.split('@')[0] || '';

  return (
    <div className={styles.profilePage}>
      <Container>
        <BackButton />
        <h1 className={styles.title}>{t('profile.title')}</h1>

        <div className={styles.profileGrid}>
          {/* Profile Info */}
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              <User className={styles.avatarIcon} />
            </div>
            <h2 className={styles.userName}>{displayName}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className={styles.menuSection}>
            <Link to="/profile/orders" className={styles.menuItem}>
              <Package className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('profile.orders')}</span>
                <span className={styles.menuSubtitle}>{t('profile.ordersSubtitle')}</span>
              </div>
            </Link>

            <Link to="/favorites" className={styles.menuItem}>
              <Heart className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('profile.favorites')}</span>
                <span className={styles.menuSubtitle}>{t('profile.favoritesSubtitle')}</span>
              </div>
            </Link>

            <Link to="/profile/settings" className={styles.menuItem}>
              <Settings className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('profile.settings')}</span>
                <span className={styles.menuSubtitle}>{t('profile.settingsSubtitle')}</span>
              </div>
            </Link>

            <button 
              className={`${styles.menuItem} ${styles.logoutBtn}`}
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('auth.logout')}</span>
                <span className={styles.menuSubtitle}>{t('profile.logoutSubtitle')}</span>
              </div>
            </button>
          </div>
        </div>

        <LogoutConfirmModal 
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      </Container>
    </div>
  );
}
