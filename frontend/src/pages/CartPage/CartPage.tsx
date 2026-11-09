import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CartPage.module.css';

export function CartPage() {
  const { t, locale } = useLocale();
  const cart = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const [actionError, setActionError] = useState(false);
  const minOrderAmount = 400;
  const subtotal = Number(cart.data?.subtotal ?? 0);
  const hasEstimatedItems = cart.data?.items.some((item) => item.priceIsEstimate) ?? false;
  const canCheckout = subtotal >= minOrderAmount && !hasEstimatedItems;
  const currency = locale === 'ru' ? 'ru-RU' : 'ky-KG';

  const changeQuantity = (cartId: string, itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setActionError(false);
    updateItem.mutate({ cartId, itemId, quantity }, { onError: () => setActionError(true) });
  };

  return (
    <div className={styles.cartPage}>
      <Container>
        <BackButton />
        <h1 className={styles.title}>{t('cart.title')}</h1>
        {cart.isLoading ? (
          <LoadingState message={t('common.loading')} />
        ) : cart.error ? (
          <ErrorState message={cart.error.message} onRetry={() => void cart.refetch()} />
        ) : !cart.data?.items.length ? (
          <EmptyState
            icon={<ShoppingBag className={styles.emptyIcon} />}
            title={t('cart.empty')}
            action={<Link to="/catalog" className={styles.continueBtn}>{t('cart.continueShopping')}</Link>}
          />
        ) : (
          <>
            {actionError && <p className={styles.actionError} role="alert">{t('cart.updateError')}</p>}
            {hasEstimatedItems && <p className={styles.minOrderWarning} role="status">{t('cart.estimateNotice')}</p>}
            <div className={styles.cartGrid}>
              <div className={styles.cartItems}>
                {cart.data.items.map((item) => {
                  const translation = item.product?.translations.find((value) => value.locale === locale)
                    ?? item.product?.translations[0];
                  const isPending = updateItem.isPending || removeItem.isPending;
                  return (
                    <article className={styles.cartItem} key={item.id}>
                      {item.product?.thumbnailUrl ? (
                        <img className={styles.itemImage} src={item.product.thumbnailUrl} alt={translation?.name ?? ''} />
                      ) : <div className={styles.itemImage} aria-hidden="true" />}
                      <div className={styles.itemDetails}>
                        <Link className={styles.itemName} to={`/product/${item.product?.slug ?? ''}`}>
                          {translation?.name ?? item.product?.sku}
                        </Link>
                        <p className={styles.itemPrice}>{Number(item.price).toLocaleString(currency)} сом</p>
                      </div>
                      <div className={styles.itemActions}>
                        <div className={styles.quantityControl}>
                          <button type="button" className={styles.quantityBtn} disabled={isPending || item.quantity <= 1} aria-label={t('cart.decreaseQuantity')} onClick={() => changeQuantity(item.cartId, item.id, item.quantity - 1)}>
                            <Minus className={styles.quantityIcon} />
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button type="button" className={styles.quantityBtn} disabled={isPending} aria-label={t('cart.increaseQuantity')} onClick={() => changeQuantity(item.cartId, item.id, item.quantity + 1)}>
                            <Plus className={styles.quantityIcon} />
                          </button>
                        </div>
                        <button type="button" className={styles.removeBtn} disabled={isPending} aria-label={t('cart.remove')} onClick={() => removeItem.mutate({ cartId: item.cartId, itemId: item.id }, { onError: () => setActionError(true) })}>
                          <Trash2 className={styles.removeIcon} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className={styles.cartSummary}>
                <h2 className={styles.summaryTitle}>{t('cart.total')}</h2>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{t('cart.itemCount')}:</span>
                  <span className={styles.summaryValue}>{cart.data?.totalItems ?? 0}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{t('cart.subtotal')}:</span>
                  <span className={styles.summaryValue}>{subtotal.toLocaleString(currency)} сом</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabelTotal}>{t('cart.total')}:</span>
                  <span className={styles.summaryValueTotal}>{subtotal.toLocaleString(currency)} сом</span>
                </div>
                {!canCheckout && <p className={styles.minOrderWarning}>{t('cart.minOrder')}</p>}
                <Link to="/checkout" className={`${styles.checkoutBtn} ${!canCheckout ? styles.checkoutBtnDisabled : ''}`} onClick={(event) => { if (!canCheckout) event.preventDefault(); }} aria-disabled={!canCheckout}>
                  {t('cart.checkout')}
                </Link>
                <Link to="/catalog" className={styles.continueLinkBtn}>{t('cart.continueShopping')}</Link>
              </aside>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
