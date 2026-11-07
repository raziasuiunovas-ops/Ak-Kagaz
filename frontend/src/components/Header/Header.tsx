import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu } from 'lucide-react';
import { Container } from '@/components/Container';
import { NavigationMenu } from './NavigationMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SearchBar } from './SearchBar';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './Header.module.css';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useLocale();

  // Swipe gesture handling for mobile menu
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) {
        touchStartX = touch.screenX;
        touchStartY = touch.screenY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) {
        touchEndX = touch.screenX;
        touchEndY = touch.screenY;
        handleSwipe();
      }
    };

    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Check if horizontal swipe is more significant than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe right from left edge to open menu
        if (touchStartX < 50 && deltaX > 50 && !isMenuOpen) {
          setIsMenuOpen(true);
        }
        // Swipe left to close menu
        else if (deltaX < -50 && isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    // Only add listeners on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }

    return undefined;
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.wrapper}>
          {/* Left Section */}
          <div className={styles.leftSection}>
            <button
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(true)}
              aria-label={t('header.menu')}
            >
              <Menu className={styles.menuIcon} />
            </button>

            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoPlaceholder}>
                <img 
                  src="/icons/icon-192x192.png" 
                  alt="AK KAGAZ" 
                  className={styles.logoImage}
                />
              </div>
              <span className={styles.logoText}>АК КАГАЗ</span>
            </Link>
          </div>

          {/* Center Section */}
          <div className={styles.centerSection}>
            {/* Reserved for future content */}
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            <LanguageSwitcher />

            {/* Search */}
            <button
              className={styles.iconButton}
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('common.search')}
            >
              <Search className={styles.icon} />
            </button>

            <Link to="/favorites" className={styles.iconButton} aria-label={t('nav.favorites')}>
              <Heart className={styles.icon} />
            </Link>

            <Link to="/cart" className={styles.iconButton} aria-label={t('nav.cart')}>
              <ShoppingCart className={styles.icon} />
            </Link>

            <Link to="/profile" className={styles.iconButton} aria-label={t('nav.profile')}>
              <User className={styles.icon} />
            </Link>

            {/* Reserved space for developer studio info */}
            <div className={styles.studioPlaceholder}>
              {/* Future: Developer studio information */}
            </div>
          </div>
        </div>
      </Container>

      {/* Navigation Menu (Sidebar) */}
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Search Overlay */}
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
    </header>
  );
}
