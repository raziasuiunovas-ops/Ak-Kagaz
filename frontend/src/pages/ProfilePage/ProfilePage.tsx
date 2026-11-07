import { Link } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { t } = useLocale();

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
            <h2 className={styles.userName}>Имя Пользователя</h2>
            <p className={styles.userEmail}>user@example.com</p>
          </div>

          {/* Menu Items */}
          <div className={styles.menuSection}>
            <Link to="/profile/orders" className={styles.menuItem}>
              <Package className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('profile.orders')}</span>
                <span className={styles.menuSubtitle}>История ваших заказов</span>
              </div>
            </Link>

            <Link to="/favorites" className={styles.menuItem}>
              <Heart className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('profile.favorites')}</span>
                <span className={styles.menuSubtitle}>Избранные товары</span>
              </div>
            </Link>

            <Link to="/profile/settings" className={styles.menuItem}>
              <Settings className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('profile.settings')}</span>
                <span className={styles.menuSubtitle}>Личные данные и адреса</span>
              </div>
            </Link>

            <button className={`${styles.menuItem} ${styles.logoutBtn}`}>
              <LogOut className={styles.menuIcon} />
              <div className={styles.menuText}>
                <span className={styles.menuTitle}>{t('auth.logout')}</span>
                <span className={styles.menuSubtitle}>Выйти из аккаунта</span>
              </div>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
