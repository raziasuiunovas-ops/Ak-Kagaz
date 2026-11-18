import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { apiClient } from '@/services/api';
import { useCart } from '@/hooks/useCart';
import { useLocale } from '@/contexts/LocaleContext';
import { useQuery } from '@tanstack/react-query';
import styles from './CheckoutPage.module.css';

interface Address {
  id: string;
  label: string | null;
  addressLine1: string;
  city: string;
  region: string | null;
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
}

export function CheckoutPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const cart = useCart();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [createdOrderId, setCreatedOrderId] = useState(() => sessionStorage.getItem('ak-kagaz-pending-checkout-order') ?? '');
  const [addressId, setAddressId] = useState('');
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const addresses = useQuery({
    queryKey: ['checkout', 'addresses'],
    queryFn: () => apiClient.get<Address[]>('/users/me/addresses'),
  });
  const locations = useQuery({
    queryKey: ['checkout', 'pickup-locations'],
    queryFn: () => apiClient.get<PickupLocation[]>('/orders/pickup-locations'),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    const form = new FormData(event.currentTarget);
    try {
      let currentOrderId = createdOrderId;
      if (!currentOrderId) {
        let selectedAddressId = addressId;
        if (deliveryType === 'delivery' && (useNewAddress || !selectedAddressId)) {
          const address = await apiClient.post<Address>('/users/me/addresses', {
            label: String(form.get('label') || ''),
            addressLine1: String(form.get('addressLine1') || ''),
            city: String(form.get('city') || ''),
            region: String(form.get('region') || ''),
            country: 'KG',
            isDefault: addresses.data?.length === 0,
          });
          selectedAddressId = address.id;
        }
        
        // Собираем контактные данные и комментарий
        const contactInfo = {
          firstName: String(form.get('firstName') || ''),
          lastName: String(form.get('lastName') || ''),
          phone: String(form.get('phone') || ''),
          comment: String(form.get('comment') || ''),
        };
        
        const order = await apiClient.post<{ id: string }>('/orders', {
          fulfillmentType: deliveryType === 'delivery' ? 'DELIVERY' : 'PICKUP',
          ...(deliveryType === 'delivery' ? { deliveryAddressId: selectedAddressId } : { pickupLocationId }),
          ...contactInfo, // Добавляем контактные данные в заказ
        });
        currentOrderId = order.id;
        sessionStorage.setItem('ak-kagaz-pending-checkout-order', currentOrderId);
        setCreatedOrderId(currentOrderId);
      }
      const payment = await apiClient.post<{ paymentUrl: string }>('/payments/finik', { orderId: currentOrderId, locale });
      window.location.assign(payment.paymentUrl);
    } catch {
      setSubmitError(true);
      setIsSubmitting(false);
    }
  };

  if (cart.isLoading || addresses.isLoading || locations.isLoading) return <LoadingState />;
  if (cart.error) return <ErrorState message={t('checkout.loadError')} onRetry={() => void cart.refetch()} />;
  if (!cart.data?.items.length && !createdOrderId) {
    return <div className={styles.checkoutPage}><Container size="narrow"><BackButton fallback="/cart" /><ErrorState message={t('checkout.emptyCart')} onRetry={() => navigate('/cart')} /></Container></div>;
  }

  const savedAddresses = addresses.data ?? [];
  const pickupLocations = locations.data ?? [];

  return (
    <div className={styles.checkoutPage}>
      <Container size="narrow">
        <BackButton fallback="/cart" />
        <h1 className={styles.title}>{t('checkout.title')}</h1>
        {submitError && <p className={styles.submitError} role="alert">{t('checkout.paymentError')}</p>}
        <form onSubmit={(event) => void handleSubmit(event)} className={styles.checkoutForm}>
          {createdOrderId ? <p className={styles.pendingNotice}>{t('checkout.pendingOrderNotice')}</p> : <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('checkout.deliveryType')}</h2>
            <div className={styles.deliveryTypeGroup}>
              {(['delivery', 'pickup'] as const).map((type) => (
                <label className={styles.radioLabel} key={type}>
                  <input type="radio" name="deliveryType" checked={deliveryType === type} onChange={() => setDeliveryType(type)} className={styles.radio} />
                  <span>{t(`checkout.deliveryType.${type}`)}</span>
                </label>
              ))}
            </div>
          </section>

          {deliveryType === 'delivery' ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.address')}</h2>
              {savedAddresses.length > 0 && !useNewAddress && (
                <>
                  <label className={styles.formGroup}>
                    <span className={styles.label}>{t('checkout.savedAddress')}</span>
                    <select className={styles.input} value={addressId || savedAddresses[0]?.id || ''} onChange={(event) => setAddressId(event.target.value)}>
                      {savedAddresses.map((address) => <option key={address.id} value={address.id}>{address.label || address.addressLine1}, {address.city}</option>)}
                    </select>
                  </label>
                  <button type="button" className={styles.textButton} onClick={() => setUseNewAddress(true)}>{t('checkout.addAddress')}</button>
                </>
              )}
              {(useNewAddress || savedAddresses.length === 0) && (
                <div className={styles.formGrid}>
                  <label className={styles.formGroup}><span className={styles.label}>{t('checkout.addressLabel')}</span><input className={styles.input} name="label" maxLength={50} /></label>
                  <label className={styles.formGroup}><span className={styles.label}>{t('checkout.city')}</span><input className={styles.input} name="city" required maxLength={100} /></label>
                  <label className={`${styles.formGroup} ${styles.fullWidth}`}><span className={styles.label}>{t('checkout.streetAddress')}</span><input className={styles.input} name="addressLine1" required maxLength={200} autoComplete="street-address" /></label>
                  <label className={styles.formGroup}><span className={styles.label}>{t('checkout.region')}</span><input className={styles.input} name="region" maxLength={100} /></label>
                  {savedAddresses.length > 0 && <button type="button" className={styles.textButton} onClick={() => setUseNewAddress(false)}>{t('checkout.useSavedAddress')}</button>}
                </div>
              )}
            </section>
          ) : (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.pickupLocation')}</h2>
              {pickupLocations.length ? pickupLocations.map((location) => (
                <label className={styles.radioLabel} key={location.id}>
                  <input type="radio" name="pickupLocation" required checked={pickupLocationId === location.id} onChange={() => setPickupLocationId(location.id)} className={styles.radio} />
                  <span>{location.name} — {location.address}, {location.city}</span>
                </label>
              )) : <p role="status">{t('checkout.noPickupLocations')}</p>}
            </section>
          )}
          </>}

          {!createdOrderId && <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('checkout.contactInfo')}</h2>
            <div className={styles.formGrid}>
              <label className={styles.formGroup}>
                <span className={styles.label}>{t('checkout.firstName')}</span>
                <input className={styles.input} name="firstName" required maxLength={50} autoComplete="given-name" />
              </label>
              <label className={styles.formGroup}>
                <span className={styles.label}>{t('checkout.lastName')}</span>
                <input className={styles.input} name="lastName" required maxLength={50} autoComplete="family-name" />
              </label>
              <label className={`${styles.formGroup} ${styles.fullWidth}`}>
                <span className={styles.label}>{t('checkout.phone')}</span>
                <input className={styles.input} name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+996 XXX XXX XXX" />
              </label>
              <label className={`${styles.formGroup} ${styles.fullWidth}`}>
                <span className={styles.label}>{t('checkout.comment')}</span>
                <textarea className={styles.textarea} name="comment" maxLength={500} rows={4} placeholder={t('checkout.commentPlaceholder')} />
              </label>
            </div>
          </section>}

          {!createdOrderId && <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('checkout.orderSummary')}</h2>
            <div className={styles.orderSummary}>
              {cart.data?.items.map((item) => <div className={styles.orderItem} key={item.id}><span>{item.product?.translations?.find((translation) => translation.locale === locale)?.name || item.product?.translations?.[0]?.name || item.productId} × {item.quantity}</span><span>{Number(item.subtotal).toLocaleString(locale)} сом</span></div>)}
              <div className={styles.orderDivider} />
              <div className={styles.orderTotal}><span>{t('cart.total')}:</span><span className={styles.totalAmount}>{Number(cart.data?.subtotal ?? 0).toLocaleString(locale)} сом</span></div>
              <p>{t('checkout.serverTotalNotice')}</p>
            </div>
          </section>}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || (deliveryType === 'pickup' && pickupLocations.length === 0)}>
            {isSubmitting ? t('checkout.redirecting') : createdOrderId ? t('payment.retry') : t('checkout.placeOrder')}
          </button>
        </form>
      </Container>
    </div>
  );
}
