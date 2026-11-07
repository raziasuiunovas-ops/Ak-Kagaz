import { RotateCcw, Calendar } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { useLocale } from '@/contexts/LocaleContext';
import { useRepeatPurchases } from '@/hooks';
import { isAuthenticated } from '@/utils/session';
import styles from './RepeatPurchases.module.css';

interface RepeatPurchasesProps {
  onAddToCart?: (productId: string) => void;
  limit?: number;
}

export function RepeatPurchases({ onAddToCart, limit = 8 }: RepeatPurchasesProps) {
  const { t, locale } = useLocale();
  const authenticated = isAuthenticated();

  const { data: products, isLoading, error } = useRepeatPurchases({
    limit,
    locale,
  });

  if (!authenticated) {
    return null; // Only show for authenticated users
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <RotateCcw className={styles.icon} />
          <h3 className={styles.title}>{t('recommendations.repeat')}</h3>
        </div>
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <RotateCcw className={styles.icon} />
          <h3 className={styles.title}>{t('recommendations.repeat')}</h3>
        </div>
        <EmptyState
          icon={<Calendar className={styles.emptyIcon} />}
          message={
            locale === 'ru'
              ? 'У вас пока нет повторных покупок'
              : 'Учурда кайталануучу сатып алууларыңыз жок'
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <RotateCcw className={styles.icon} />
          <h3 className={styles.title}>{t('recommendations.repeat')}</h3>
        </div>
        <p className={styles.subtitle}>
          {locale === 'ru'
            ? 'Товары, которые вы покупали ранее'
            : 'Сиз мурда сатып алган товарлар'}
        </p>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            showQuickAdd={true}
          />
        ))}
      </div>
    </div>
  );
}
