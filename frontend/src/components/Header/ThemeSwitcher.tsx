import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ThemeSwitcher.module.css';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();

  const label = locale === 'ru' 
    ? (theme === 'light' ? 'Темная тема' : 'Светлая тема')
    : (theme === 'light' ? 'Караңгы тема' : 'Жарык тема');

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeSwitcher}
      aria-label={label}
      title={label}
    >
      <div className={styles.iconWrapper}>
        {theme === 'light' ? (
          <Moon className={styles.icon} size={20} />
        ) : (
          <Sun className={styles.icon} size={20} />
        )}
      </div>
    </button>
  );
}
