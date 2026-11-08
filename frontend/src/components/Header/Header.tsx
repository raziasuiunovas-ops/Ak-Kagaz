import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, ChevronDown, Menu } from 'lucide-react';
import { NavigationMenu } from './NavigationMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SearchBar } from './SearchBar';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './Header.module.css';
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, locale } = useLocale();

  // Track scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (touchStartX < 50 && deltaX > 50 && !isMenuOpen) {
          setIsMenuOpen(true);
        } else if (deltaX < -50 && isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

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
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerContainer}>
        <div className={styles.wrapper}>
            {/* Left Section - Logo */}
            <div className={styles.leftSection}>
              <button
                className={styles.mobileMenuButton}
                onClick={() => setIsMenuOpen(true)}
                aria-label={t('header.menu')}
              >
                <Menu size={24} />
              </button>

              <Link to="/" className={styles.logoLink}>
                <div className={styles.logoImage}>
                  <img 
                    src="/icons/ak-kagaz-icon-192-transparent.png" 
                    alt="AK KAGAZ" 
                  />
                </div>
                <span className={styles.logoText}>АК КАГАЗ</span>
              </Link>
            </div>

            {/* Center Section - Desktop Navigation */}
            <nav className={styles.centerSection}>
              <Link to="/catalog" className={styles.navLink}>
                <span>{locale === 'ru' ? 'Каталог' : 'Каталог'}</span>
                <ChevronDown size={16} className={styles.navIcon} />
              </Link>
              <Link to="/campaigns" className={styles.navLink}>
                {locale === 'ru' ? 'Акции' : 'Акциялар'}
              </Link>
              <Link to="/about" className={styles.navLink}>
                {locale === 'ru' ? 'О магазине' : 'Дүкөн жөнүндө'}
              </Link>
              <Link to="/delivery" className={styles.navLink}>
                {locale === 'ru' ? 'Доставка' : 'Жеткирүү'}
              </Link>
              <Link to="/contacts" className={styles.navLink}>
                {locale === 'ru' ? 'Контакты' : 'Байланыштар'}
              </Link>
            </nav>

            {/* Right Section - Actions */}
            <div className={styles.rightSection}>
              <button
                className={styles.iconButton}
                onClick={() => setIsSearchOpen(true)}
                aria-label={t('common.search')}
              >
                <Search size={20} />
              </button>

              <LanguageSwitcher />

              <ThemeSwitcher />

              <Link to="/favorites" className={styles.iconButton} aria-label={t('nav.favorites')}>
                <Heart size={20} />
              </Link>

              <Link to="/cart" className={styles.iconButton} aria-label={t('nav.cart')}>
                <ShoppingCart size={20} />
              </Link>

              <Link to="/profile" className={styles.iconButton} aria-label={t('nav.profile')}>
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>

      {/* Navigation Menu (Sidebar for mobile) */}
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Search Overlay */}
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
    </header>
  );
}
