import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import type { Product } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './RecommendationsBlock.module.css';

interface RecommendationsBlockProps {
  title: string;
  products: Product[] | undefined;
  isLoading: boolean;
  error: Error | null;
  linkTo?: string;
  linkText?: string;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  getFavoriteStatus?: (productId: string) => boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  className?: string;
  loadingCount?: number;
}

export function RecommendationsBlock({
  title,
  products,
  isLoading,
  error,
  linkTo,
  linkText,
  onAddToCart,
  onToggleFavorite,
  getFavoriteStatus,
  emptyMessage,
  onRetry,
  className,
  loadingCount = 8,
}: RecommendationsBlockProps) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <section className={`${styles.block} ${className || ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <LoadingState message={t('recommendations.loading')} variant="section" skeletonCount={loadingCount} />
      </section>
    );
  }

  if (error) {
    return (
      <section className={`${styles.block} ${className || ''}`}>
        <div className={styles.header}><h2 className={styles.title}>{title}</h2></div>
        <ErrorState message={error.message} onRetry={onRetry} />
      </section>
    );
  }

  if (!products || products.length === 0) {
    if (emptyMessage) {
      return (
        <section className={`${styles.block} ${className || ''}`}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <EmptyState message={emptyMessage} />
        </section>
      );
    }
    return null; // Hide if no message provided
  }

  return (
    <section className={`${styles.block} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {linkTo && linkText && (
          <Link to={linkTo} className={styles.link}>
            <span>{linkText}</span>
            <ArrowRight className={styles.linkIcon} />
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={getFavoriteStatus?.(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
