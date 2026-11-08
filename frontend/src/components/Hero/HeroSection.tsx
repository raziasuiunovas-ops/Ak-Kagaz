import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Truck, Heart } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { HeroComposition } from './HeroComposition';
import styles from './HeroSection.module.css';

// Rotating phrases for animated heading
const HERO_PHRASES = {
  ru: ['Учебы', 'Творчества', 'Работы', 'Вдохновения'],
  ky: ['Окуу', 'Чыгармачылык', 'Иш', 'Шыктануу'],
};

export function HeroSection() {
  const { locale } = useLocale();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const phrases = HERO_PHRASES[locale as keyof typeof HERO_PHRASES] || HERO_PHRASES.ru;

  // Rotate phrases every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsAnimating(false);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left Column - Content */}
          <div className={styles.leftColumn}>
            {/* Badge */}
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              <span className={styles.badgeText}>
                {locale === 'ru' ? 'Канцелярия с заботой о вас' : 'Сиз үчүн кеңсе буюмдары'}
              </span>
            </div>

            {/* Animated Heading */}
            <h1 className={styles.heading}>
              {locale === 'ru' ? (
                <>
                  Все для <span className={`${styles.headingAnimated} ${isAnimating ? styles.headingAnimating : ''}`}>{phrases[currentPhraseIndex]}</span> в одном месте
                </>
              ) : (
                <>
                  <span className={`${styles.headingAnimated} ${isAnimating ? styles.headingAnimating : ''}`}>{phrases[currentPhraseIndex]}</span> үчүн баары бир жерде
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className={styles.subtitle}>
              {locale === 'ru'
                ? 'Качественная канцелярия, стильные товары и вдохновение в каждой детали — всё необходимое для учёбы, работы и творчества в одном месте.'
                : 'Сапаттуу кеңсе буюмдары, стилдүү товарлар жана ар бир деталда шыктануу — окуу, иш жана чыгармачылык үчүн керектүү баары бир жерде.'}
            </p>

            {/* CTA Buttons */}
            <div className={styles.actions}>
              <Link to="/catalog" className={styles.primaryButton}>
                <span>{locale === 'ru' ? 'Перейти в каталог' : 'Каталогго өтүү'}</span>
                <ArrowRight size={20} className={styles.buttonIcon} />
              </Link>

              <Link to="/about" className={styles.secondaryButton}>
                <Play size={18} className={styles.playIcon} />
                <span>{locale === 'ru' ? 'Узнать больше' : 'Көбүрөөк билүү'}</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>
                  <Shield size={20} />
                </div>
                <span className={styles.benefitText}>
                  {locale === 'ru' ? 'Высокое качество' : 'Жогорку сапат'}
                </span>
              </div>

              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>
                  <Truck size={20} />
                </div>
                <span className={styles.benefitText}>
                  {locale === 'ru' ? 'Удобная доставка' : 'Ыңгайлуу жеткирүү'}
                </span>
              </div>

              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>
                  <Heart size={20} />
                </div>
                <span className={styles.benefitText}>
                  {locale === 'ru' ? 'Забота о клиентах' : 'Кардарларга камкордук'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Stationery Composition */}
          <div className={styles.rightColumn}>
            <HeroComposition />
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className={styles.backgroundDecor}>
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
        <div className={styles.kyrgyzLetters}></div>
      </div>
    </section>
  );
}
