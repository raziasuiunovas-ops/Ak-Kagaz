import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { CartToast } from '@/components/CartToast/CartToast';
import { useLocale } from '@/contexts/LocaleContext';
import { useAddProductToCart, useFavorites } from '@/hooks';
import { getCurrentDisplayPrice } from '@/utils/productPrice';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void | Promise<void>;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showQuickAdd?: boolean;
}

type ProductCardPhoto = { src: string; alt?: string; variantName?: string };

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const translation = product.translations.find((item) => item.locale === locale) ?? product.translations[0];
  const photos = useMemo(() => {
    const attached: ProductCardPhoto[] = [
      ...(product.images ?? []).map((image) => ({ src: image.url, alt: image.altText || undefined })),
      ...(product.variants ?? []).filter((variant) => variant.isActive && variant.imageUrl)
        .map((variant) => ({ src: variant.imageUrl as string, alt: variant.name, variantName: variant.name })),
    ];
    if (product.thumbnailUrl) attached.unshift({ src: product.thumbnailUrl, alt: undefined });
    const seen = new Set<string>();
    return attached.filter((photo) => {
      if (!photo.src || seen.has(photo.src)) return false;
      seen.add(photo.src);
      return true;
    });
  }, [product.images, product.variants, product.thumbnailUrl]);
  
  const displayPrice = getCurrentDisplayPrice(product.prices);
  const price = displayPrice?.price;
  const markedFavorite = isFavorite ?? favorites.isFavorite(product.id);
  const favoriteLabel = markedFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites');
  const canAdd = product.status === 'ACTIVE' && !addToCart.isPending;
  const currentPhotoIndex = photos.length ? photoIndex % photos.length : 0;
  const currentPhoto = photos[currentPhotoIndex];
  
  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentPhotoIndex, currentPhoto?.src]);
  
  // Preload next image on hover or after current image loads
  useEffect(() => {
    if (photos.length > 1 && imageLoaded) {
      const nextIndex = (currentPhotoIndex + 1) % photos.length;
      const nextPhoto = photos[nextIndex];
      if (nextPhoto?.src) {
        const img = new Image();
        img.src = nextPhoto.src;
      }
    }
  }, [photos, currentPhotoIndex, imageLoaded]);
  
  const movePhoto = (offset: number) => setPhotoIndex((current) => photos.length > 1
    ? (current + offset + photos.length) % photos.length
    : 0);

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
            <img 
              src={currentPhoto.src} 
              alt={currentPhoto.alt || translation?.name || ''} 
              className={styles.image} 
              loading="lazy"
              fetchPriority="auto"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ 
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            />
          ) : (
            <span className={styles.imagePlaceholder} aria-hidden="true" />
          )}
          {!imageLoaded && !imageError && currentPhoto && (
            <div 
              className={styles.imagePlaceholder}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e0e0e0',
                borderTop: '3px solid #26577C',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            </div>
          )}
        </Link>
        {photos.length > 1 && <span className={styles.photoCounter} aria-live="polite">{currentPhotoIndex + 1} / {photos.length}</span>}
        {photos.length > 1 && currentPhoto?.variantName && <span className={styles.photoVariant}>{currentPhoto.variantName}</span>}
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
            {price ? <>{Number(price.sellingPrice).toLocaleString(locale === 'ru' ? 'ru-RU' : 'ky-KG')} сом</> : t('product.priceUnavailable')}
          </span>
          {showQuickAdd && (
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={!canAdd}
              className={styles.addToCartBtn}
              aria-label={product.status === 'ACTIVE' ? t('product.addToCart') : t('product.outOfStock')}
              title={product.status === 'ACTIVE' ? t('product.addToCart') : t('product.outOfStock')}
            >
              <ShoppingCart className={styles.cartIcon} aria-hidden="true" />
              <span>{addToCart.isPending ? t('product.addingToCart') : t('product.addToCart')}</span>
            </button>
          )}
        </div>
        {notice && <CartToast type={notice} message={notice === 'added' ? t('product.addedToCart') : t('product.addToCartError')} />}
      </div>
    </article>
  );
}
