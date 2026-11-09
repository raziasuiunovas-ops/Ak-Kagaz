import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Container } from '@/components/Container';
import { CategoryCard } from '@/components/CategoryCard/CategoryCard';
import { RecommendationsBlock } from '@/components/RecommendationsBlock';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { CampaignBanner } from '@/components/CampaignBanner';
import { RepeatPurchases } from '@/components/RepeatPurchases';
import { HeroSection } from '@/components/Hero';
import { useLocale } from '@/contexts/LocaleContext';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import {
  usePersonalRecommendations,
  useGuestRecommendations,
  usePopularProducts,
  useTrendingProducts,
  useActiveCampaigns,
  useCategories,
  useProducts,
} from '@/hooks';
import { isAuthenticated, getSessionId } from '@/utils/session';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t, locale } = useLocale();
  
  // Set page metadata with Open Graph support
  usePageMetadata({
    title: 'meta.home.title',
    description: 'meta.home.description',
    path: '/',
  });
  const authenticated = isAuthenticated();
  const sessionId = getSessionId();

  // Fetch recommendations based on auth status
  const personalRecommendations = usePersonalRecommendations({
    limit: 8,
    locale,
  });

  const guestRecommendations = useGuestRecommendations({
    limit: 8,
    locale,
    sessionId,
  });

  const popularProducts = usePopularProducts({
    limit: 16,
    locale,
  });
  const publishedProducts = useProducts({ locale, status: 'ACTIVE', limit: 16 });

  const trendingProducts = useTrendingProducts({
    limit: 8,
    locale,
  });

  const activeCampaigns = useActiveCampaigns(locale);
  const categories = useCategories({ locale, isActive: true, limit: 100 });

  // Choose which recommendations to show
  const recommendations = authenticated ? personalRecommendations : guestRecommendations;
  const popularCandidates = Array.from(new Map((popularProducts.data ?? []).map((product) => [product.id, product])).values());
  const popularIds = new Set(popularCandidates.map((product) => product.id));
  const popularList = [
    ...popularCandidates,
    ...(publishedProducts.data?.data ?? []).filter((product) => !popularIds.has(product.id)),
  ].slice(0, 16);
  const popularLoading = popularProducts.isLoading || (popularList.length < 16 && publishedProducts.isLoading);
  const popularError = !popularList.length && popularProducts.error && publishedProducts.error
    ? publishedProducts.error
    : null;
  const trendingCandidates = Array.from(new Map((trendingProducts.data ?? []).map((product) => [product.id, product])).values());
  const trendingIds = new Set(trendingCandidates.map((product) => product.id));
  const trendingList = [
    ...trendingCandidates,
    ...(publishedProducts.data?.data ?? []).filter((product) => !trendingIds.has(product.id)),
  ].slice(0, 8);
  const trendingLoading = trendingProducts.isLoading || (trendingList.length < 8 && publishedProducts.isLoading);
  const trendingError = !trendingList.length && trendingProducts.error && publishedProducts.error
    ? publishedProducts.error
    : null;

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.categories.title')}</h2>
          </div>
          <div className={styles.categoriesGrid}>
            {categories.isLoading ? (
              <LoadingState message={t('common.loading')} />
            ) : categories.error ? (
              <ErrorState message={t('home.categories.error')} onRetry={() => void categories.refetch()} />
            ) : categories.data?.data.length ? (
              categories.data.data.map((category) => <CategoryCard key={category.id} category={category} locale={locale} />)
            ) : (
              <p>{t('home.categories.empty')}</p>
            )}
          </div>
        </Container>
      </section>

      {/* Active Campaigns */}
      {activeCampaigns.data && activeCampaigns.data.length > 0 && (
        <section className={styles.section}>
          <Container>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {locale === 'ru' ? 'Акции и спецпредложения' : 'Акциялар жана атайын сунуштар'}
              </h2>
            </div>
            <div className={styles.campaignsGrid}>
              {activeCampaigns.data.slice(0, 3).map((campaign) => (
                <CampaignBanner key={campaign.id} campaign={campaign} size="medium" />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Popular Products Section */}
      <section className={styles.section}>
        <Container>
          <RecommendationsBlock
            title={t('home.popular.title')}
            products={popularList}
            isLoading={popularLoading}
            error={popularError}
            linkTo="/catalog?sort=popular"
            linkText={t('common.showMore')}
            emptyMessage={t('recommendations.empty')}
            onRetry={() => { void popularProducts.refetch(); void publishedProducts.refetch(); }}
          />
        </Container>
      </section>

      {/* Personalized Recommendations */}
      {authenticated && (
        <section className={styles.section}>
          <Container>
            <RecommendationsBlock
              title={t('recommendations.forYou')}
              products={recommendations.data}
              isLoading={recommendations.isLoading}
              error={recommendations.error}
              linkTo="/catalog"
              linkText={t('common.showMore')}
            />
          </Container>
        </section>
      )}

      {/* Repeat Purchases - for authenticated users */}
      {authenticated && (
        <section className={styles.section}>
          <Container>
            <RepeatPurchases />
          </Container>
        </section>
      )}

      {/* Trending Products */}
      <section className={styles.section}>
        <Container>
          <RecommendationsBlock
            title={t('recommendations.trending')}
            products={trendingList}
            isLoading={trendingLoading}
            error={trendingError}
            linkTo="/catalog?sort=trending"
            linkText={t('common.showMore')}
            emptyMessage={t('recommendations.empty')}
            onRetry={() => { void trendingProducts.refetch(); void publishedProducts.refetch(); }}
          />
        </Container>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <Container>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <h2 className={styles.sectionTitle}>{t('home.about.title')}</h2>
              <p className={styles.aboutText}>
                {/* Placeholder text */}
                АК КАГАЗ — это современный интернет-магазин канцелярских товаров в городе Ош.
                Мы предлагаем широкий ассортимент качественной продукции для офиса, учёбы и творчества.
              </p>
              <Link to="/about" className={styles.aboutLink}>
                <span>{t('nav.about')}</span>
                <ArrowRight className={styles.sectionLinkIcon} />
              </Link>
            </div>
            <div className={styles.aboutVisual}>
              {/* Placeholder for about image */}
              <div className={styles.aboutImagePlaceholder} />
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews Section */}
      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.reviews.title')}</h2>
          </div>
          <div className={styles.reviewsGrid}>
            {/* Future: Dynamic reviews from API */}
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.reviewCardPlaceholder}>
                <div className={styles.reviewRating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={styles.reviewStar} />
                  ))}
                </div>
                <p className={styles.reviewText}>
                  Отличный магазин! Большой выбор товаров и быстрая доставка.
                </p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar} />
                  <div className={styles.reviewAuthorInfo}>
                    <p className={styles.reviewAuthorName}>Покупатель</p>
                    <p className={styles.reviewDate}>Дата отзыва</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
