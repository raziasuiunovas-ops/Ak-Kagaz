import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './MobileBottomNav.module.css';

export function MobileBottomNav() {
  const { t } = useLocale();
  const location = useLocation();

  // Don't show on checkout page
  if (location.pathname === '/checkout') {
    return null;
  }

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          end
        >
          <Icon name="home" className={styles.icon} />
          <span className={styles.label}>{t('nav.home')}</span>
        </NavLink>

        <NavLink
          to="/catalog"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Icon name="grid_view" className={styles.icon} />
          <span className={styles.label}>{t('nav.catalog')}</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Icon name="favorite" className={styles.icon} />
          <span className={styles.label}>{t('nav.favorites')}</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Icon name="shopping_cart" className={styles.icon} />
          <span className={styles.label}>{t('nav.cart')}</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Icon name="person" className={styles.icon} />
          <span className={styles.label}>{t('nav.profile')}</span>
        </NavLink>
      </div>
    </nav>
  );
}

// Export spacer component for pages that need bottom padding
export function MobileBottomNavSpacer() {
  return <div className={styles.spacer} />;
}
