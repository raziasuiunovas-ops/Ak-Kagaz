import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Package, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/Container';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useBundleBySlug, useAddBundleToCart } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './BundleDetailPage.module.css';

export function BundleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, locale } = useLocale();

  const { data: bundle, isLoading, error } = useBundleBySlug(slug || '', locale);
  const addToCart = useAddBundleToCart();

  // Track custom quantities for each item
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});

  const translation = bundle?.translations.find((tr) => tr.locale === locale) || bundle?.translations[0];

  // Calculate custom totals based on modified quantities
  const { customTotal, customFinalPrice } = useMemo(() => {
    if (!bundle) return { customTotal: 0, customFinalPrice: 0 };

    let total = 0;
    bundle.items.forEach((item) => {
      const quantity = customQuantities[item.productId] ?? item.quantity;
      const price = item.product?.prices.find((p) => p.isActive)?.sellingPrice || 0;
      total += price * quantity;
    });

    const discountAmount = (total * bundle.discountPercentage) / 100;
    const finalPrice = total - discountAmount;

    return { customTotal: total, customFinalPrice: finalPrice };
  }, [bundle, customQuantities]);

  const handleQuantityChange = (productId: string, delta: number) => {
    const currentItem = bundle?.items.find((item) => item.productId === productId);
    if (!currentItem) return;

    const currentQuantity = customQuantities[productId] ?? currentItem.quantity;
    const newQuantity = Math.max(0, currentQuantity + delta);

    setCustomQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleAddToCart = async () => {
    if (!bundle) return;

    const hasCustomQuantities = Object.keys(customQuantities).length > 0;

    try {
      await addToCart.mutateAsync({
        bundleId: bundle.id,
        ...(hasCustomQuantities && { customQuantities }),
      });
      
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add bundle to cart:', err);
    }
  };

  const isModified = Object.keys(customQuantities).length > 0;
  const hasItems = bundle?.items.every((item) => {
    const qty = customQuantities[item.productId] ?? item.quantity;
    return qty > 0;
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Container>
          <LoadingState message={t('common.loading')} fullHeight />
        </Container>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className={styles.page}>
        <Container>
          <ErrorState
            message={error?.message || t('error.404')}
            onRetry={() => navigate('/bundles')}
          />
        </Container>
      </div>
    );
  }

  const discount = Math.round(bundle.discountPercentage);
  const displayTotal = isModified ? customTotal : bundle.totalPrice;
  const displayFinal = isModified ? customFinalPrice : bundle.finalPrice;

  return (
    <div className={styles.page}>
      <Container>
        <button onClick={() => navigate('/bundles')} className={styles.backBtn}>
          <ArrowLeft className={styles.backIcon} />
          <span>{locale === 'ru' ? 'Все наборы' : 'Бардык топтомдор'}</span>
        </button>

        <div className={styles.content}>
          <div className={styles.imageSection}>
            {bundle.imageUrl ? (
              <img src={bundle.imageUrl} alt={translation?.name || 'Bundle'} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <Package className={styles.placeholderIcon} />
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <div className={styles.header}>
              <h1 className={styles.title}>{translation?.name || 'Bundle'}</h1>
              {discount > 0 && <div className={styles.discountBadge}>-{discount}%</div>}
            </div>

            {translation?.description && (
              <p className={styles.description}>{translation.description}</p>
            )}

            <div className={styles.priceBox}>
              {discount > 0 && (
                <div className={styles.oldPrice}>{displayTotal.toLocaleString()} сом</div>
              )}
              <div className={styles.price}>{displayFinal.toLocaleString()} сом</div>
              {discount > 0 && (
                <div className={styles.savings}>
                  {locale === 'ru' ? 'Вы экономите' : 'Үнөмдөө'}: {(displayTotal - displayFinal).toLocaleString()} сом
                </div>
              )}
            </div>

            <div className={styles.itemsSection}>
              <h2 className={styles.itemsTitle}>
                {locale === 'ru' ? 'Состав набора' : 'Топтомдун курамы'}
              </h2>
              <div className={styles.items}>
                {bundle.items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const productTranslation =
                    product.translations.find((tr) => tr.locale === locale) || product.translations[0];
                  const price = product.prices.find((p) => p.isActive)?.sellingPrice || 0;
                  const quantity = customQuantities[item.productId] ?? item.quantity;

                  return (
                    <div key={item.id} className={styles.item}>
                      <div className={styles.itemInfo}>
                        {product.thumbnailUrl && (
                          <img
                            src={product.thumbnailUrl}
                            alt={productTranslation?.name}
                            className={styles.itemImage}
                          />
                        )}
                        <div className={styles.itemDetails}>
                          <div className={styles.itemName}>{productTranslation?.name}</div>
                          <div className={styles.itemPrice}>{price.toLocaleString()} сом</div>
                        </div>
                      </div>

                      <div className={styles.itemActions}>
                        <button
                          onClick={() => handleQuantityChange(item.productId, -1)}
                          className={styles.qtyBtn}
                          disabled={quantity === 0}
                          aria-label="Decrease quantity"
                        >
                          <Minus className={styles.qtyIcon} />
                        </button>
                        <span className={styles.quantity}>{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, 1)}
                          className={styles.qtyBtn}
                          aria-label="Increase quantity"
                        >
                          <Plus className={styles.qtyIcon} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isModified && (
              <div className={styles.modifiedNote}>
                {locale === 'ru'
                  ? '✨ Вы изменили состав набора. Цена пересчитана с учётом скидки.'
                  : '✨ Сиз топтомдун курамын өзгөрттүңүз. Баасы арзандатуу менен эсептелди.'}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!bundle.isActive || !hasItems || addToCart.isPending}
              className={styles.addToCartBtn}
            >
              <ShoppingCart className={styles.cartIcon} />
              <span>
                {addToCart.isPending
                  ? t('common.loading')
                  : bundle.isActive
                    ? t('product.addToCart')
                    : locale === 'ru'
                      ? 'Недоступно'
                      : 'Жеткиликсиз'}
              </span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
