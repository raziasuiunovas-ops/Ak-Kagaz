import { Package, Truck, CreditCard, HeadphonesIcon } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import { useInfoPageMetadata } from '@/hooks/usePageMetadata';
import styles from './AboutPage.module.css';

export function AboutPage() {
  const { t } = useLocale();
  
  // Set page metadata
  useInfoPageMetadata('meta.about.title', 'meta.about.description', '/about');

  return (
    <div className={styles.aboutPage}>
      <Container size="narrow">
        <BackButton />
        <h1 className={styles.title}>{t('about.title')}</h1>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>О нас</h2>
            <p className={styles.text}>
              АК КАГАЗ — это современный интернет-магазин канцелярских товаров в городе Ош, Кыргызстан.
            </p>
            <p className={styles.text}>
              Мы предлагаем широкий ассортимент качественной продукции для офиса, учёбы и творчества.
              Наша миссия — сделать покупку канцелярских товаров простой, удобной и доступной для каждого.
            </p>
          </section>

          <div className={styles.imageSection}>
            <div className={styles.imagePlaceholder} />
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Наши преимущества</h2>
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Package className={styles.icon} />
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Широкий ассортимент</h3>
                  <p className={styles.featureText}>
                    Большой выбор канцелярских товаров для любых нужд
                  </p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Truck className={styles.icon} />
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Доставка по Кыргызстану</h3>
                  <p className={styles.featureText}>
                    Доставка по всему Кыргызстану; стоимость зависит от адреса
                  </p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <CreditCard className={styles.icon} />
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Рассрочка</h3>
                  <p className={styles.featureText}>
                    Удобная система оплаты в рассрочку
                  </p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <HeadphonesIcon className={styles.icon} />
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Поддержка</h3>
                  <p className={styles.featureText}>
                    Профессиональная консультация и помощь
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
