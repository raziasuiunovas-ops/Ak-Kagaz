import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showQuickAdd?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  showQuickAdd = true,
}: ProductCardProps) {
  const { locale } = useLocale();

  const translation = product.translations.find((t) => t.locale === locale) || product.translations[0];
  const price = product.prices.find((p) => p.isActive)?.sellingPrice || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  return (
    <Link to={`/products/${product.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={translation?.name || 'Product'}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        
        {product.status === 'OUT_OF_STOCK' && (
          <div className={styles.badge}>{locale === 'ru' ? 'Нет в наличии' : 'Жок'}</div>
        )}

        {onToggleFavorite && (
          <button
            onClick={handleToggleFavorite}
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteActive : ''}`}
            aria-label="Add to favorites"
          >
            <Heart className={styles.favoriteIcon} />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{translation?.name || 'Product'}</h3>
        
        {translation?.shortDescription && (
          <p className={styles.description}>{translation.shortDescription}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>{price.toLocaleString()} сом</span>
          </div>

          {showQuickAdd && onAddToCart && product.status === 'ACTIVE' && (
            <button
              onClick={handleAddToCart}
              className={styles.addToCartBtn}
              aria-label="Add to cart"
            >
              <ShoppingCart className={styles.cartIcon} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
