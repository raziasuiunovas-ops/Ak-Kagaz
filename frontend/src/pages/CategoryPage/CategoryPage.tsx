import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Container } from '@/components/Container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CategoryPage.module.css';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLocale();
  const [showFilters, setShowFilters] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.catalog'), path: '/catalog' },
    { label: slug || 'Category' },
  ];

  return (
    <div className={styles.categoryPage}>
      <Container>
        <BackButton fallback="/catalog" />
        <Breadcrumbs items={breadcrumbs} />
        
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Категория товаров</h1>
            <p className={styles.subtitle}>000 товаров найдено</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button 
            className={styles.filtersButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className={styles.filtersIcon} />
            <span>{t('catalog.filters')}</span>
          </button>

          <select className={styles.sortSelect}>
            <option value="popular">{t('catalog.sort.popular')}</option>
            <option value="price_asc">{t('catalog.sort.priceAsc')}</option>
            <option value="price_desc">{t('catalog.sort.priceDesc')}</option>
            <option value="newest">{t('catalog.sort.newest')}</option>
          </select>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            {/* Future: Dynamic filters based on category */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Фильтры</h3>
              <p className={styles.filterPlaceholder}>Фильтры будут добавлены</p>
            </div>
          </div>
        )}

        <div className={styles.productsGrid}>
          {/* Future: Dynamic products from API */}
          {Array.from({ length: 12 }).map((_, index) => (
            <Link 
              key={index} 
              to={`/product/product-${index + 1}`} 
              className={styles.productCard}
            >
              <div className={styles.productImage} />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>Товар {index + 1}</h3>
                <p className={styles.productPrice}>000 сом</p>
                <button className={styles.addToCartBtn}>
                  {t('product.addToCart')}
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className={styles.pagination}>
          {/* Future: Pagination component */}
        </div>
      </Container>
    </div>
  );
}
