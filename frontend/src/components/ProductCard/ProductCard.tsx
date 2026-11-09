import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
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
  const [photoIndex, setPhotoIndex] = useState(0);
  const translation = product.translations.find((item) => item.locale === locale) ?? product.translations[0];
  const photos = useMemo(() => {
    const attached = [
      ...(product.images ?? []).map((image) => ({ src: image.url, alt: image.altText || undefined })),
      ...(product.variants ?? []).filter((variant) => variant.isActive && variant.imageUrl)
        .map((variant) => ({ src: variant.imageUrl as string, alt: variant.name })),
    ];
    if (product.thumbnailUrl) attached.unshift({ src: product.thumbnailUrl, alt: undefined });
    const seen = new Set<string>();
    return attached.filter((photo) => {
      if (!photo.src || seen.has(photo.src)) return false;
      seen.add(photo.src);
      return true;
    });
  }, [product.images, product.variants, product.thumbnailUrl]);
  const price = getCurrentConfirmedPrice(product.prices);
  const markedFavorite = isFavorite ?? favorites.isFavorite(product.id);
  const favoriteLabel = markedFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites');
  const canAdd = product.status === 'ACTIVE' && !!price && !addToCart.isPending;
  const currentPhoto = photos[photoIndex % Math.max(photos.length, 1)];
  const movePhoto = (offset: number) => setPhotoIndex((current) => (current + offset + photos.length) % photos.length);

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
          {currentPhoto ? (
            <img src={currentPhoto.src} alt={currentPhoto.alt || translation?.name || ''} className={styles.image} loading="lazy" />
          ) : (
            <span className={styles.imagePlaceholder} aria-hidden="true" />
          )}
        </Link>
        {photos.length > 1 && <span className={styles.photoCounter} aria-live="polite">{photoIndex + 1} / {photos.length}</span>}
        {photos.length > 1 && <>
          <button type="button" className={`${styles.photoArrow} ${styles.photoPrevious}`} onClick={() => movePhoto(-1)} aria-label={t('product.previousPhoto')} title={t('product.previousPhoto')}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" className={`${styles.photoArrow} ${styles.photoNext}`} onClick={() => movePhoto(1)} aria-label={t('product.nextPhoto')} title={t('product.nextPhoto')}><ChevronRight aria-hidden="true" /></button>
        </>}
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
        {(product.attributes ?? []).filter((item) => item.value?.trim()).slice(0, 2).length > 0 && (
          <ul className={styles.attributes} aria-label={t('product.specifications')}>
            {(product.attributes ?? []).filter((item) => item.value?.trim()).slice(0, 2).map((item) => (
              <li key={item.id}><span>{locale === 'ru' ? item.attribute.displayNameRu : item.attribute.displayNameKy}</span><strong>{item.value}</strong></li>
            ))}
          </ul>
        )}

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
