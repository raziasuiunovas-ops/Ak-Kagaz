import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import type { Bundle } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './BundleCard.module.css';

interface BundleCardProps {
  bundle: Bundle;
  onAddToCart?: (bundleId: string) => void;
  showQuickAdd?: boolean;
}

export function BundleCard({ bundle, onAddToCart, showQuickAdd = true }: BundleCardProps) {
  const { locale, t } = useLocale();

  const translation = bundle.translations.find((tr) => tr.locale === locale) || bundle.translations[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(bundle.id);
  };

  const itemsCount = bundle.items.reduce((sum, item) => sum + item.quantity, 0);
  const discount = Math.round(bundle.discountPercentage);

  return (
    <Link to={`/bundles/${bundle.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {bundle.imageUrl ? (
          <img src={bundle.imageUrl} alt={translation?.name || 'Bundle'} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Package className={styles.placeholderIcon} />
          </div>
        )}

        {discount > 0 && (
          <div className={styles.discountBadge}>-{discount}%</div>
        )}

        {!bundle.isActive && (
          <div className={styles.inactiveBadge}>
            {locale === 'ru' ? 'Недоступно' : 'Жеткиликсиз'}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{translation?.name || 'Bundle'}</h3>
          <div className={styles.itemsCount}>
            {itemsCount} {locale === 'ru' ? 'товаров' : 'товар'}
          </div>
        </div>

        {translation?.description && (
          <p className={styles.description}>{translation.description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            {discount > 0 && (
              <span className={styles.oldPrice}>{bundle.totalPrice.toLocaleString()} сом</span>
            )}
            <span className={styles.price}>{bundle.finalPrice.toLocaleString()} сом</span>
            {discount > 0 && (
              <span className={styles.savings}>
                {locale === 'ru' ? 'Экономия' : 'Үнөмдөө'}: {(bundle.totalPrice - bundle.finalPrice).toLocaleString()} сом
              </span>
            )}
          </div>

          {showQuickAdd && onAddToCart && bundle.isActive && (
            <button onClick={handleAddToCart} className={styles.addToCartBtn} aria-label="Add bundle to cart">
              <ShoppingCart className={styles.cartIcon} />
              <span>{t('product.addToCart')}</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
