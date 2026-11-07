import { Link } from 'react-router-dom';
import { Container } from '@/components/Container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  const { t } = useLocale();

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

        <div className={styles.categoriesGrid}>
          {/* Future: Dynamic categories from API */}
          {Array.from({ length: 8 }).map((_, index) => (
            <Link 
              key={index} 
              to={`/catalog/category-${index + 1}`} 
              className={styles.categoryCard}
            >
              <div className={styles.categoryImage} />
              <div className={styles.categoryInfo}>
                <h2 className={styles.categoryName}>Категория {index + 1}</h2>
                <p className={styles.categoryCount}>000 товаров</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
