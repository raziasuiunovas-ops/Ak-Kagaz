import { useLocale, type Locale } from '@/contexts/LocaleContext';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.button} ${locale === 'ru' ? styles.active : ''}`}
        onClick={() => handleChange('ru')}
        aria-label="Русский"
      >
        RU
      </button>
      <button
        className={`${styles.button} ${locale === 'ky' ? styles.active : ''}`}
        onClick={() => handleChange('ky')}
        aria-label="Кыргызча"
      >
        KG
      </button>
    </div>
  );
}
