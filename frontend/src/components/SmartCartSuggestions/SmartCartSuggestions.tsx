import { Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { LoadingState } from '@/components/LoadingState';
import { useLocale } from '@/contexts/LocaleContext';
import { useSimilarProducts, usePopularProducts } from '@/hooks';
import type { Product } from '@/types';
import styles from './SmartCartSuggestions.module.css';

interface SmartCartSuggestionsProps {
  cartItems: Array<{ productId: string; product?: Product }>;
  onAddToCart?: (productId: string) => void;
}

export function SmartCartSuggestions({ cartItems, onAddToCart }: SmartCartSuggestionsProps) {
  const { t, locale } = useLocale();

  // Get suggestions based on first item in cart
  const firstProduct = cartItems[0]?.product;
  
  const similarProducts = useSimilarProducts(firstProduct?.id || '', {
    limit: 4,
    locale,
  });

  const popularProducts = usePopularProducts({
    limit: 4,
    locale,
  });

  // Use similar products if available, otherwise popular
  const suggestions = similarProducts.data && similarProducts.data.length > 0
    ? similarProducts.data
    : popularProducts.data;

  const isLoading = similarProducts.isLoading || popularProducts.isLoading;

  // Filter out products already in cart
  const cartProductIds = new Set(cartItems.map((item) => item.productId));
  const filteredSuggestions = suggestions?.filter(
    (product) => !cartProductIds.has(product.id)
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Sparkles className={styles.icon} />
          <h3 className={styles.title}>
            {locale === 'ru' ? 'Рекомендуем добавить' : 'Кошууну сунуштайбыз'}
          </h3>
        </div>
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  if (!filteredSuggestions || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Sparkles className={styles.icon} />
        <h3 className={styles.title}>
          {locale === 'ru' ? 'Рекомендуем добавить' : 'Кошууну сунуштайбыз'}
        </h3>
        <p className={styles.subtitle}>
          {locale === 'ru'
            ? 'Эти товары хорошо дополнят вашу покупку'
            : 'Бул товарлар сиздин сатып алууңузду жакшы толуктайт'}
        </p>
      </div>

      <div className={styles.grid}>
        {filteredSuggestions.slice(0, 4).map((product) => (
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
