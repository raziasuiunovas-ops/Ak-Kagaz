import { Link } from 'react-router-dom';
import { UserCircle, LogIn, UserPlus, ShoppingBag, Heart } from 'lucide-react';
import { Container } from '@/components/Container';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ProfileGuestPage.module.css';

export function ProfileGuestPage() {
  const { t } = useLocale();

  return (
    <div className={styles.guestPage}>
      <Container>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <UserCircle className={styles.icon} />
            </div>
            <h1 className={styles.title}>{t('profile.guest.title')}</h1>
            <p className={styles.subtitle}>{t('profile.guest.subtitle')}</p>
          </div>

          <div className={styles.actions}>
            <Link to="/login" className={styles.primaryButton}>
              <LogIn className={styles.buttonIcon} />
              <span>{t('auth.signIn')}</span>
            </Link>

            <Link to="/register" className={styles.secondaryButton}>
              <UserPlus className={styles.buttonIcon} />
              <span>{t('auth.signUp')}</span>
            </Link>
          </div>

          <div className={styles.features}>
            <h2 className={styles.featuresTitle}>{t('profile.guest.benefits')}</h2>
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <ShoppingBag className={styles.featureIcon} />
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>{t('profile.guest.feature1Title')}</h3>
                  <p className={styles.featureDescription}>{t('profile.guest.feature1Desc')}</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <Heart className={styles.featureIcon} />
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>{t('profile.guest.feature2Title')}</h3>
                  <p className={styles.featureDescription}>{t('profile.guest.feature2Desc')}</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <UserCircle className={styles.featureIcon} />
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>{t('profile.guest.feature3Title')}</h3>
                  <p className={styles.featureDescription}>{t('profile.guest.feature3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
