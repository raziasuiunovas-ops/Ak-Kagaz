import { Link, useParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';
import { BackButton } from '@/components/BackButton';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ProductCard } from '@/components/ProductCard';
import { useCategoryBySlug, useProducts } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CategoryPage.module.css';

export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, locale } = useLocale();
  const category = useCategoryBySlug(slug, locale);
  const products = useProducts({ categoryId: category.data?.id, locale, status: 'ACTIVE', limit: 100 });
  const translation = category.data?.translations.find((item) => item.locale === locale) ?? category.data?.translations[0];
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.catalog'), path: '/catalog' },
    { label: translation?.name ?? slug },
  ];

  return (
    <div className={styles.categoryPage}>
      <Container>
        <BackButton fallback="/catalog" />
        <Breadcrumbs items={breadcrumbs} />
        {category.isLoading ? (
          <LoadingState message={t('common.loading')} />
        ) : category.error ? (
          <ErrorState message={category.error.message} onRetry={() => void category.refetch()} />
        ) : (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>{translation?.name}</h1>
                {translation?.description && <p className={styles.subtitle}>{translation.description}</p>}
              </div>
            </div>
            {products.isLoading ? (
              <LoadingState message={t('common.loading')} />
            ) : products.error ? (
              <ErrorState message={products.error.message} onRetry={() => void products.refetch()} />
            ) : products.data?.data.length ? (
              <>
                <p className={styles.subtitle}>{products.data.meta.total} {locale === 'ru' ? 'товаров' : 'товар'}</p>
                <div className={styles.productsGrid}>
                  {products.data.data.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>{locale === 'ru' ? 'В этой категории пока нет опубликованных товаров.' : 'Бул бөлүмдө азырынча жарыяланган товарлар жок.'}</p>
                <Link to="/catalog">{locale === 'ru' ? 'Все категории' : 'Бардык бөлүмдөр'}</Link>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
