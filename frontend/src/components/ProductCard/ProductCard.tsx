import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import { useAddProductToCart, useFavorites } from '@/hooks';
import { getCurrentConfirmedPrice } from '@/utils/productPrice';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void | Promise<void>;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showQuickAdd?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  showQuickAdd = true,
}: ProductCardProps) {
  const { locale, t } = useLocale();
  const favorites = useFavorites();
  const addToCart = useAddProductToCart();
  const [notice, setNotice] = useState<'added' | 'error' | null>(null);
  const translation = product.translations.find((item) => item.locale === locale) ?? product.translations[0];
  const price = getCurrentConfirmedPrice(product.prices);
  const markedFavorite = isFavorite ?? favorites.isFavorite(product.id);
  const favoriteLabel = markedFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites');
  const canAdd = product.status === 'ACTIVE' && !!price && !addToCart.isPending;

  const handleAddToCart = async () => {
    if (!canAdd) return;
    setNotice(null);
    try {
      if (onAddToCart) await onAddToCart(product.id);
      else await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      setNotice('added');
      window.setTimeout(() => setNotice(null), 2500);
    } catch {
      setNotice('error');
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) onToggleFavorite(product.id);
    else favorites.toggleFavorite(product.id);
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <Link to={`/product/${product.slug}`} className={styles.imageLink} aria-label={translation?.name}>
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={translation?.name ?? ''} className={styles.image} loading="lazy" />
          ) : (
            <span className={styles.imagePlaceholder} aria-hidden="true" />
          )}
        </Link>
        {product.status === 'OUT_OF_STOCK' && (
          <span className={styles.badge}>{locale === 'ru' ? 'Нет в наличии' : 'Жок'}</span>
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`${styles.favoriteBtn} ${markedFavorite ? styles.favoriteActive : ''}`}
          aria-label={favoriteLabel}
          aria-pressed={markedFavorite}
          title={favoriteLabel}
        >
          <Heart className={styles.favoriteIcon} fill={markedFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className={styles.content}>
        <Link to={`/product/${product.slug}`} className={styles.detailsLink}>
          <h3 className={styles.name}>{translation?.name ?? product.slug}</h3>
          {translation?.shortDescription && <p className={styles.description}>{translation.shortDescription}</p>}
        </Link>

        <div className={styles.footer}>
          <span className={`${styles.price} ${!price ? styles.pricePending : ''}`}>
            {price ? `${Number(price.sellingPrice).toLocaleString(locale === 'ru' ? 'ru-RU' : 'ky-KG')} сом` : t('product.priceToConfirm')}
          </span>
          {showQuickAdd && (
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={!canAdd}
              className={styles.addToCartBtn}
              aria-label={price ? t('product.addToCart') : t('product.priceToConfirm')}
              title={!price ? t('product.priceToConfirm') : t('product.addToCart')}
            >
              <ShoppingCart className={styles.cartIcon} aria-hidden="true" />
              <span>{addToCart.isPending ? t('common.loading') : t('product.addToCart')}</span>
            </button>
          )}
        </div>
        {notice && (
          <p className={notice === 'added' ? styles.successMessage : styles.errorMessage} role="status" aria-live="polite">
            {notice === 'added' ? t('product.addedToCart') : t('product.addToCartError')}
          </p>
        )}
      </div>
    </article>
  );
}
