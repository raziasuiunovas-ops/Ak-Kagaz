import { useState, FormEvent } from 'react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const { t } = useLocale();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Future: Submit order
    console.log('Order submitted');
  };

  return (
    <div className={styles.checkoutPage}>
      <Container size="narrow">
        <BackButton fallback="/cart" />
        <h1 className={styles.title}>{t('checkout.title')}</h1>

        <form onSubmit={handleSubmit} className={styles.checkoutForm}>
          {/* Contacts Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('checkout.contacts')}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  {t('auth.lastName')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Delivery Type Selection */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('checkout.deliveryType')}</h2>
            <div className={styles.deliveryTypeGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={deliveryType === 'delivery'}
                  onChange={(e) => setDeliveryType(e.target.value as 'delivery')}
                  className={styles.radio}
                />
                <span>{t('checkout.deliveryType.delivery')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={deliveryType === 'pickup'}
                  onChange={(e) => setDeliveryType(e.target.value as 'pickup')}
                  className={styles.radio}
                />
                <span>{t('checkout.deliveryType.pickup')}</span>
              </label>
            </div>
          </section>

          {/* Delivery Address (if delivery selected) */}
          {deliveryType === 'delivery' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.address')}</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="address" className={styles.label}>
                    {t('checkout.address')}
                  </label>
                  <textarea
                    id="address"
                    className={styles.textarea}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </section>
          )}

          {/* Order Summary */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('checkout.orderSummary')}</h2>
            <div className={styles.orderSummary}>
              {/* Future: Dynamic order items */}
              <div className={styles.orderItem}>
                <span>Товар 1 × 1</span>
                <span>000 сом</span>
              </div>
              <div className={styles.orderDivider} />
              <div className={styles.orderTotal}>
                <span>{t('cart.total')}:</span>
                <span className={styles.totalAmount}>000 сом</span>
              </div>
            </div>
          </section>

          <button type="submit" className={styles.submitBtn}>
            {t('checkout.placeOrder')}
          </button>
        </form>
      </Container>
    </div>
  );
}
