import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart, Star, Tag } from 'lucide-react';
import { Container } from '@/components/Container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';
import { BackButton } from '@/components/BackButton';
import { FrequentlyBoughtTogether } from '@/components/FrequentlyBoughtTogether';
import { RecommendationsBlock } from '@/components/RecommendationsBlock';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useLocale } from '@/contexts/LocaleContext';
import { useAddProductToCart, useFavorites, useProductBySlug, useSimilarProducts, useTrackView, useProductCampaigns } from '@/hooks';
import { useProductMetadata } from '@/hooks/usePageMetadata';
import { getSessionId } from '@/utils/session';
import { CartToast } from '@/components/CartToast/CartToast';
import { getCurrentDisplayPrice } from '@/utils/productPrice';
import { getAbsoluteImageUrl } from '@/utils/metadata';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [selectedTab, setSelectedTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const { data: product, isLoading, error } = useProductBySlug(slug || '', locale);
  
  // Set page metadata for product
  const productTranslation = product?.translations.find((item) => item.locale === locale) ?? product?.translations[0];
  const productImage = product?.images?.[0]?.url ? getAbsoluteImageUrl(product.images[0].url) : undefined;
  
  useProductMetadata({
    name: productTranslation?.name ?? '',
    description: productTranslation?.description ?? productTranslation?.name ?? '',
    image: productImage,
    slug: slug || '',
  });
  const favorites = useFavorites();
  const addToCart = useAddProductToCart();
  const [cartNotice, setCartNotice] = useState<'added' | 'error' | null>(null);
  const trackView = useTrackView();

  const similarProducts = useSimilarProducts(product?.id || '', {
    limit: 8,
    locale,
  });

  const productCampaigns = useProductCampaigns(product?.id || '', locale);

  // Track product view
  useEffect(() => {
    if (product?.id) {
      trackView.mutate({
        productId: product.id,
        sessionId: getSessionId(),
      });
    }
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className={styles.productPage}>
        <Container>
          <LoadingState message={t('common.loading')} fullHeight />
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.productPage}>
        <Container>
          <ErrorState
            message={error?.message || t('error.404')}
            onRetry={() => window.location.reload()}
          />
        </Container>
      </div>
    );
  }

  const translation = product.translations.find((tr) => tr.locale === locale) || product.translations[0];
  const priceValue = getCurrentDisplayPrice(product.prices)?.price.sellingPrice;
  const price = priceValue === undefined ? undefined : Number(priceValue);
  const selectedVariant = product.variants?.find((variant) => variant.id === selectedVariantId && variant.isActive);
  const localizedVariantName = (name: string) => locale === 'ky'
    ? ({ 'Зелёный': 'Жашыл', 'Красный': 'Кызыл', 'Синий': 'Көк', 'Чёрный': 'Кара', 'Розовый': 'Кызгылт', 'Голубой': 'Көгүлтүр', 'Светло-голубой': 'Ачык көк' }[name] ?? name)
    : name;

  // Prepare gallery images
  const galleryImages = [
    selectedVariant?.imageUrl || product.thumbnailUrl,
    ...(product.images?.map((img) => img.url) || [])
  ].filter(Boolean) as string[];

  const currentImage = galleryImages[selectedImageIndex] || product.thumbnailUrl;

  // Preload adjacent images
  useEffect(() => {
    if (galleryImages.length > 1) {
      const nextIndex = (selectedImageIndex + 1) % galleryImages.length;
      const prevIndex = (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length;
      [galleryImages[nextIndex], galleryImages[prevIndex]].forEach((src) => {
        if (src) {
          const img = new Image();
          img.src = src;
        }
      });
    }
  }, [selectedImageIndex, galleryImages]);

  // Reset image loading when image changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentImage]);

  // Reset selected image when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariantId]);

  // Check if product is in active campaign
  const activeCampaign = productCampaigns.data?.[0];
  const campaignProduct = activeCampaign?.products.find((cp) => cp.productId === product.id);
  const campaignPrice = price === undefined ? undefined : campaignProduct?.specialPrice || (price * (100 - (campaignProduct?.discountPercentage || 0)) / 100);
  const hasDiscount = price !== undefined && !!campaignProduct && campaignPrice !== undefined && (campaignPrice < price);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.catalog'), path: '/catalog' },
    ...(product.category ? [{ label: product.category.translations.find(tr => tr.locale === locale)?.name || '', path: `/catalog/${product.category.slug}` }] : []),
    { label: translation?.name || 'Product' },
  ];

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    if (product.status !== 'ACTIVE' || price === undefined) return;
    setCartNotice(null);
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity });
      setCartNotice('added');
      window.setTimeout(() => setCartNotice(null), 2500);
    } catch {
      setCartNotice('error');
      window.setTimeout(() => setCartNotice(null), 3500);
    }
  };

  return (
    <div className={styles.productPage}>
      <Container>
        <BackButton fallback="/catalog" />
        <Breadcrumbs items={breadcrumbs} />

        <div className={styles.productGrid}>
          {/* Product Images Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {currentImage ? (
                <>
                  <img 
                    src={currentImage} 
                    alt={translation?.name}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onLoad={() => setImageLoading(false)}
                    style={{
                      opacity: imageLoading ? 0 : 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  {imageLoading && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '50px',
                      height: '50px',
                      border: '4px solid #e0e0e0',
                      borderTop: '4px solid #26577C',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  )}
                </>
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className={styles.thumbnails}>
                {galleryImages.slice(0, 4).map((imgSrc, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={imgSrc} 
                      alt={`${translation?.name} - ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{translation?.name}</h1>

            {!!product.variants?.filter((variant) => variant.isActive).length && (
              <div className={styles.variantSelector}>
                <p className={styles.variantLabel}>{locale === 'ru' ? 'Вариант' : 'Түрү'}</p>
                <div className={styles.variantOptions}>
                  {product.variants.filter((variant) => variant.isActive).map((variant) => (
                    <button key={variant.id} type="button" className={`${styles.variantOption} ${selectedVariantId === variant.id ? styles.variantSelected : ''}`} onClick={() => setSelectedVariantId(variant.id)} aria-pressed={selectedVariantId === variant.id}>
                      {variant.imageUrl && <img src={variant.imageUrl} alt="" />}{localizedVariantName(variant.name)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCampaign && (
              <Link to={`/campaigns/${activeCampaign.slug}`} className={styles.campaignTag}>
                <Tag className={styles.tagIcon} />
                <span>
                  {activeCampaign.translations.find((tr) => tr.locale === locale)?.name || activeCampaign.slug}
                </span>
              </Link>
            )}
            
            <div className={styles.productMeta}>
              <div className={styles.rating}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={styles.star} />
                ))}
                <span className={styles.ratingText}>(0 {t('product.reviews')})</span>
              </div>
              <div className={styles.availability}>
                <span className={`${styles.availabilityBadge} ${product.status === 'ACTIVE' ? styles.inStock : styles.outOfStock}`}>
                  {product.status === 'ACTIVE' ? t('product.inStock') : t('product.outOfStock')}
                </span>
              </div>
            </div>

            <div className={styles.priceSection}>
              {hasDiscount && price !== undefined && (
                <p className={styles.oldPrice}>{Number(price).toLocaleString()} сом</p>
              )}
              <p className={styles.price}>{price === undefined ? t('product.priceToConfirm') : `${Number(hasDiscount ? campaignPrice : price).toLocaleString()} сом`}</p>
              {hasDiscount && campaignProduct && (
                <p className={styles.discount}>
                  {locale === 'ru' ? 'Скидка' : 'Арзандатуу'}: {campaignProduct.discountPercentage}%
                </p>
              )}
            </div>

            {translation?.shortDescription && (
              <p className={styles.shortDescription}>{translation.shortDescription}</p>
            )}

            <div className={styles.quantitySection}>
              <label className={styles.quantityLabel}>{t('common.quantity')}</label>
              <div className={styles.quantityControl}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className={styles.quantityIcon} />
                </button>
                <input 
                  type="number"
                  className={styles.quantityInput}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button 
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className={styles.quantityIcon} />
                </button>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.addToCartBtn} onClick={() => void handleAddToCart()} disabled={product.status !== 'ACTIVE' || price === undefined || addToCart.isPending}>
                <ShoppingCart className={styles.btnIcon} />
                <span>{addToCart.isPending ? t('common.loading') : t('product.addToCart')}</span>
              </button>
              <button className={`${styles.favoriteBtn} ${favorites.isFavorite(product.id) ? styles.favoriteActive : ''}`} onClick={() => favorites.toggleFavorite(product.id)} aria-label={favorites.isFavorite(product.id) ? t('product.removeFromFavorites') : t('product.addToFavorites')} aria-pressed={favorites.isFavorite(product.id)}>
                <Heart className={styles.btnIcon} fill={favorites.isFavorite(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            {cartNotice && <CartToast type={cartNotice} message={cartNotice === 'added' ? t('product.addedToCart') : t('product.addToCartError')} />}
          </div>
        </div>

        {/* Frequently Bought Together */}
        {product.status === 'ACTIVE' && (
          <div className={styles.fbtSection}>
            <FrequentlyBoughtTogether productId={product.id} currentProduct={product} />
          </div>
        )}

        {/* Product Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabsList}>
            <button 
              className={`${styles.tab} ${selectedTab === 'description' ? styles.tabActive : ''}`}
              onClick={() => setSelectedTab('description')}
            >
              {t('product.description')}
            </button>
            <button 
              className={`${styles.tab} ${selectedTab === 'specifications' ? styles.tabActive : ''}`}
              onClick={() => setSelectedTab('specifications')}
            >
              {t('product.specifications')}
            </button>
            <button 
              className={`${styles.tab} ${selectedTab === 'reviews' ? styles.tabActive : ''}`}
              onClick={() => setSelectedTab('reviews')}
            >
              {t('product.reviews')}
            </button>
          </div>

          <div className={styles.tabContent}>
            {selectedTab === 'description' && (
              <div>
                {translation?.description ? (
                  <div className={styles.description}>{translation.description}</div>
                ) : (
                  <p className={styles.placeholder}>{locale === 'ru' ? 'Описание отсутствует' : 'Сүрөттөмө жок'}</p>
                )}
              </div>
            )}
            {selectedTab === 'specifications' && (
              <div>
                <p className={styles.placeholder}>
                  {locale === 'ru' ? 'Характеристики скоро появятся' : 'Мүнөздөмөлөр жакында'}
                </p>
              </div>
            )}
            {selectedTab === 'reviews' && (
              <div>
                <p className={styles.placeholder}>
                  {locale === 'ru' ? 'Отзывы отсутствуют' : 'Пикирлер жок'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        <RecommendationsBlock
          title={t('recommendations.similar')}
          products={similarProducts.data}
          isLoading={similarProducts.isLoading}
          error={similarProducts.error}
          linkTo="/catalog"
          linkText={t('common.showMore')}
        />
      </Container>
    </div>
  );
}
