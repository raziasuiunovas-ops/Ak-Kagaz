import { useLocale } from '@/contexts/LocaleContext';
import styles from './HeroComposition.module.css';

export function HeroComposition() {
  const { locale } = useLocale();

  return (
    <div className={styles.composition}>
      {/* Background decorative ribbon */}
      <div className={styles.ribbonLayer}>
        <img 
          src="/herosection/Атласная синяя лента в форме S.png" 
          alt="Decorative ribbon"
          className={styles.ribbon}
        />
      </div>

      {/* Main composition layers */}
      <div className={styles.mainLayers}>
        {/* Bottom: Platform/Podium */}
        <div className={styles.platformLayer}>
          <img 
            src="/herosection/Кремовая платформа с цветными акцентами.png" 
            alt="Platform"
            className={styles.platform}
          />
        </div>

        {/* Middle: Books stack */}
        <div className={styles.booksLayer}>
          <img 
            src="/herosection/Стопка оранжевой и синей книг.png" 
            alt="Books"
            className={styles.books}
          />
        </div>

        {/* Top: Organizer with stationery */}
        <div className={styles.organizerLayer}>
          <img 
            src="/herosection/Каталоговый стакан для канцтоваров.png" 
            alt="Stationery organizer"
            className={styles.organizer}
          />
        </div>
      </div>

      {/* Foreground: Sticker (language-dependent) */}
      <div className={styles.stickerLayer}>
        {locale === 'ru' ? (
          <img 
            src="/herosection/Кремовая записка «Читай, пиши, создавай».png" 
            alt="Читай, пиши, создавай"
            className={styles.sticker}
          />
        ) : (
          <img 
            src="/herosection/Наклейка «Оку, жаз, жарат!».png" 
            alt="Оку, жаз, жарат!"
            className={styles.sticker}
          />
        )}
      </div>
    </div>
  );
}
