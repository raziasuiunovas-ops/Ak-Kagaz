import { useState } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { useLocale } from '@/contexts/LocaleContext';
import { useFrequentlyBought } from '@/hooks';
import type { Product } from '@/types';
import styles from './FrequentlyBoughtTogether.module.css';

interface FrequentlyBoughtTogetherProps {
  productId: string;
  currentProduct: Product;
  onAddToCart?: (productIds: string[]) => void;
}

export function FrequentlyBoughtTogether({
  productId,
  currentProduct,
  onAddToCart,
}: FrequentlyBoughtTogetherProps) {
  const { t, locale } = useLocale();
  const { data: relatedProducts, isLoading } = useFrequentlyBought(productId, {
    limit: 3,
    locale,
  });

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set([productId])
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('recommendations.frequentlyBought')}</h2>
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  const currentTranslation =
    currentProduct.translations.find((tr) => tr.locale === locale) ||
    currentProduct.translations[0];
  const currentPrice =
    currentProduct.prices.find((p) => p.isActive)?.sellingPrice || 0;

  const allProducts = [currentProduct, ...relatedProducts];

  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (id === productId) return; // Cannot deselect current product
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const totalPrice = allProducts
    .filter((p) => selectedProducts.has(p.id))
    .reduce((sum, p) => {
      const price = p.prices.find((pr) => pr.isActive)?.sellingPrice || 0;
      return sum + price;
    }, 0);

  const selectedCount = selectedProducts.size;

  const handleAddAllToCart = () => {
    if (onAddToCart) {
      onAddToCart(Array.from(selectedProducts));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('recommendations.frequentlyBought')}</h2>

      <div className={styles.content}>
        <div className={styles.products}>
          {/* Current Product */}
          <div className={styles.productItem}>
            <div
              className={`${styles.checkbox} ${styles.checkboxChecked}`}
            >
              <div className={styles.checkmark}>✓</div>
            </div>
            <div className={styles.productInfo}>
              {currentProduct.thumbnailUrl && (
                <img
                  src={currentProduct.thumbnailUrl}
                  alt={currentTranslation?.name}
                  className={styles.productImage}
                />
              )}
              <div className={styles.productDetails}>
                <div className={styles.productName}>
                  {currentTranslation?.name}
                </div>
                <div className={styles.productPrice}>
                  {currentPrice.toLocaleString()} сом
                </div>
              </div>
            </div>
          </div>

          {/* Plus Icons */}
          {relatedProducts.map((product) => {
            const translation =
              product.translations.find((tr) => tr.locale === locale) ||
              product.translations[0];
            const price =
              product.prices.find((p) => p.isActive)?.sellingPrice || 0;
            const isSelected = selectedProducts.has(product.id);

            return (
              <div key={product.id} className={styles.productGroup}>
                <div className={styles.plusIcon}>
                  <Plus />
                </div>
                <div className={styles.productItem}>
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ''}`}
                    aria-label={isSelected ? 'Deselect product' : 'Select product'}
                  >
                    {isSelected && <div className={styles.checkmark}>✓</div>}
                  </button>
                  <div className={styles.productInfo}>
                    {product.thumbnailUrl && (
                      <img
                        src={product.thumbnailUrl}
                        alt={translation?.name}
                        className={styles.productImage}
                      />
                    )}
                    <div className={styles.productDetails}>
                      <div className={styles.productName}>
                        {translation?.name}
                      </div>
                      <div className={styles.productPrice}>
                        {price.toLocaleString()} сом
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>
              {locale === 'ru' ? 'Общая стоимость' : 'Жалпы наркы'}
            </div>
            <div className={styles.summaryPrice}>
              {totalPrice.toLocaleString()} сом
            </div>
            <div className={styles.summaryCount}>
              {selectedCount} {locale === 'ru' ? 'товаров' : 'товар'}
            </div>
          </div>

          <button
            onClick={handleAddAllToCart}
            disabled={selectedCount === 0}
            className={styles.addAllBtn}
          >
            <ShoppingCart className={styles.cartIcon} />
            <span>
              {locale === 'ru'
                ? 'Добавить выбранные'
                : 'Тандалгандарды кошуу'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
