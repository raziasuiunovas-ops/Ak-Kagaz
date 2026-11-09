import { Container } from '@/components/Container';
import { CategoryCard } from '@/components/CategoryCard/CategoryCard';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';
import { BackButton } from '@/components/BackButton';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useCategories } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  const { t, locale } = useLocale();
  
  // Set page metadata
  usePageMetadata({
    title: 'meta.catalog.title',
    description: 'meta.catalog.description',
    path: '/catalog',
  });
  
  const categories = useCategories({ locale, isActive: true, limit: 100 });
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.catalog') },
  ];

  return (
    <div className={styles.catalogPage}>
      <Container>
        <BackButton />
        <Breadcrumbs items={breadcrumbs} />
        <h1 className={styles.title}>{t('catalog.title')}</h1>
        {categories.isLoading ? (
          <LoadingState message={t('common.loading')} />
        ) : categories.error ? (
          <ErrorState message={categories.error.message} onRetry={() => void categories.refetch()} />
        ) : categories.data?.data.length ? (
          <div className={styles.categoriesGrid}>
            {categories.data.data.map((category) => <CategoryCard key={category.id} category={category} locale={locale} count={category._count?.products ?? 0} />)}
          </div>
        ) : (
          <p>{locale === 'ru' ? 'Категории пока не добавлены.' : 'Азырынча бөлүмдөр кошула элек.'}</p>
        )}
      </Container>
    </div>
  );
}
