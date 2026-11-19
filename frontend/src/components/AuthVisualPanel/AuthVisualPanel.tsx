import { useEffect, useRef } from 'react';
import styles from './AuthVisualPanel.module.css';

interface AuthVisualPanelProps {
  variant?: 'login' | 'register';
}

export function AuthVisualPanel({ variant = 'login' }: AuthVisualPanelProps) {
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !planeRef.current) return;

    let animationFrame: number;
    let progress = 0;

    const animate = () => {
      progress += 0.002;
      if (progress > 1) progress = 0;

      if (planeRef.current) {
        const x = progress * 100;
        const y = Math.sin(progress * Math.PI * 2) * 10 + 50;
        planeRef.current.style.transform = `translate(${x}%, ${y}%)`;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const description = variant === 'register'
    ? 'Создайте аккаунт и оформляйте покупки ещё удобнее.'
    : 'Канцелярские товары для школы, офиса, творчества и повседневных задач.';

  return (
    <div className={styles.visualPanel}>
      <div className={styles.backgroundImage}>
        <img
          src="/login/acbf0695-7755-419d-ba0c-d501f1840eb6.png"
          alt="AK KAGAZ"
          className={styles.image}
        />
      </div>

      <div className={styles.overlay}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              <span className={styles.titleBlue}>Всё для ваших</span>{' '}
              <span className={styles.titleOrange}>идей</span>
            </h2>
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Большой ассортимент</h3>
                <p className={styles.featureDesc}>Товары для школы, офиса и творчества</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Удобный онлайн-заказ</h3>
                <p className={styles.featureDesc}>Выбирайте и оформляйте покупки на сайте</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 16L19 19L23 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 16V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H17C17.5304 6 18.0391 6.21071 18.4142 6.58579C18.7893 6.96086 19 7.46957 19 8V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 10H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Доставка по Кыргызстану</h3>
                <p className={styles.featureDesc}>Заказывайте товары из разных регионов страны</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Покупка в рассрочку</h3>
                <p className={styles.featureDesc}>Узнавайте условия у продавцов</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={planeRef} className={styles.paperPlane} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="#E55604" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#E55604" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
