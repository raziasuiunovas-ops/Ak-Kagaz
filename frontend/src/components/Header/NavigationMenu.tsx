import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, 
  Home, 
  Grid3x3, 
  Heart, 
  ShoppingCart, 
  User,
  Info,
  Phone,
  Truck,
  CreditCard,
} from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './NavigationMenu.module.css';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Sidebar */}
      <aside className={styles.menu}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('header.menu')}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink
                to="/"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Home className={styles.navIcon} />
                <span>{t('nav.home')}</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/catalog"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Grid3x3 className={styles.navIcon} />
                <span>{t('nav.catalog')}</span>
              </NavLink>
            </li>

            <div className={styles.divider} />

            <li className={styles.navItem}>
              <NavLink
                to="/favorites"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Heart className={styles.navIcon} />
                <span>{t('nav.favorites')}</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/cart"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <ShoppingCart className={styles.navIcon} />
                <span>{t('nav.cart')}</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/profile"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <User className={styles.navIcon} />
                <span>{t('nav.profile')}</span>
              </NavLink>
            </li>

            <div className={styles.divider} />

            <li className={styles.navItem}>
              <NavLink
                to="/about"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Info className={styles.navIcon} />
                <span>{t('nav.about')}</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/contacts"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Phone className={styles.navIcon} />
                <span>{t('nav.contacts')}</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/delivery"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Truck className={styles.navIcon} />
                <span>{t('nav.delivery')}</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/installment"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <CreditCard className={styles.navIcon} />
                <span>{t('nav.installment')}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
