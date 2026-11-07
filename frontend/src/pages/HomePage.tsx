import { Link } from 'react-router-dom';
import { ArrowRight, Package, Star, MessageCircle } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t } = useLocale();

  return (
    <div className={styles.container}>
      {/* Section 1: Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('home.hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('home.hero.subtitle')}</p>
          <Link to="/catalog" className={styles.heroButton}>
            {t('home.hero.cta')}
            <ArrowRight className={styles.heroButtonIcon} />
          </Link>
        </div>
      </section>

      {/* Section 2: Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.categories.title')}</h2>
          <Link to="/catalog" className={styles.sectionLink}>
            {t('bundles.viewAll')}
            <ArrowRight className={styles.sectionLinkIcon} />
          </Link>
        </div>
        <div className={styles.categoriesGrid}>
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t('catalog.empty')}</p>
            <p className={styles.emptyHint}>Категории появятся после подключения к API</p>
          </div>
        </div>
      </section>

      {/* Section 3: Featured Products */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.popular.title')}</h2>
          <Link to="/catalog" className={styles.sectionLink}>
            {t('bundles.viewAll')}
            <ArrowRight className={styles.sectionLinkIcon} />
          </Link>
        </div>
        <div className={styles.productsGrid}>
          <div className={styles.emptyState}>
            <Star className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t('catalog.empty')}</p>
            <p className={styles.emptyHint}>Популярные товары появятся после подключения к API</p>
          </div>
        </div>
      </section>

      {/* Section 4: Bundles */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('bundles.title')}</h2>
          <Link to="/bundles" className={styles.sectionLink}>
            {t('bundles.viewAll')}
            <ArrowRight className={styles.sectionLinkIcon} />
          </Link>
        </div>
        <div className={styles.bundlesGrid}>
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t('recommendations.empty')}</p>
            <p className={styles.emptyHint}>Готовые наборы появятся после подключения к API</p>
          </div>
        </div>
      </section>

      {/* Section 5: About / USP */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.aboutTitle}>{t('home.about.title')}</h2>
          <div className={styles.uspGrid}>
            <div className={styles.uspCard}>
              <div className={styles.uspIcon}>🎯</div>
              <h3 className={styles.uspTitle}>Качественные товары</h3>
              <p className={styles.uspText}>Только проверенные канцелярские товары</p>
            </div>
            <div className={styles.uspCard}>
              <div className={styles.uspIcon}>🚚</div>
              <h3 className={styles.uspTitle}>Быстрая доставка</h3>
              <p className={styles.uspText}>Доставка по Ошу и самовывоз</p>
            </div>
            <div className={styles.uspCard}>
              <div className={styles.uspIcon}>💰</div>
              <h3 className={styles.uspTitle}>Оптовые цены</h3>
              <p className={styles.uspText}>Выгодные условия для оптовых покупателей</p>
            </div>
            <div className={styles.uspCard}>
              <div className={styles.uspIcon}>🎓</div>
              <h3 className={styles.uspTitle}>Для школы и офиса</h3>
              <p className={styles.uspText}>Всё необходимое в одном месте</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Reviews */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.reviews.title')}</h2>
        </div>
        <div className={styles.reviewsGrid}>
          <div className={styles.emptyState}>
            <MessageCircle className={styles.emptyIcon} />
            <p className={styles.emptyText}>Отзывы пока отсутствуют</p>
            <p className={styles.emptyHint}>Отзывы покупателей появятся после подключения к API</p>
          </div>
        </div>
      </section>
    </div>
  );
}
