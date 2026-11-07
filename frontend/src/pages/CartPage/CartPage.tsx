import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { EmptyState } from '@/components/EmptyState';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CartPage.module.css';

export function CartPage() {
  const { t } = useLocale();
  const [cartItems] = useState<any[]>([]); // Future: Real cart data

  const MIN_ORDER_AMOUNT = 400;
  const subtotal = 0; // Future: Calculate from cart items

  const canCheckout = subtotal >= MIN_ORDER_AMOUNT;

  if (cartItems.length === 0) {
    return (
      <div className={styles.cartPage}>
        <Container>
          <BackButton />
          <h1 className={styles.title}>{t('cart.title')}</h1>
          <EmptyState
            icon={<ShoppingBag className={styles.emptyIcon} />}
            title={t('cart.empty')}
            action={
              <Link to="/catalog" className={styles.continueBtn}>
                {t('cart.continueShopping')}
              </Link>
            }
          />
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <Container>
        <BackButton />
        <h1 className={styles.title}>{t('cart.title')}</h1>

        <div className={styles.cartGrid}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            {/* Future: Dynamic cart items */}
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.cartItem}>
                <div className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>Товар {index + 1}</h3>
                  <p className={styles.itemPrice}>000 сом</p>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button className={styles.quantityBtn}>
                      <Minus className={styles.quantityIcon} />
                    </button>
                    <span className={styles.quantity}>1</span>
                    <button className={styles.quantityBtn}>
                      <Plus className={styles.quantityIcon} />
                    </button>
                  </div>
                  <button className={styles.removeBtn}>
                    <Trash2 className={styles.removeIcon} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className={styles.cartSummary}>
            <h2 className={styles.summaryTitle}>{t('cart.total')}</h2>
            
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('cart.subtotal')}:</span>
              <span className={styles.summaryValue}>000 сом</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('cart.delivery')}:</span>
              <span className={styles.summaryValue}>000 сом</span>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabelTotal}>{t('cart.total')}:</span>
              <span className={styles.summaryValueTotal}>000 сом</span>
            </div>

            {!canCheckout && (
              <p className={styles.minOrderWarning}>
                {t('cart.minOrder')}
              </p>
            )}

            <Link 
              to="/checkout" 
              className={`${styles.checkoutBtn} ${!canCheckout ? styles.checkoutBtnDisabled : ''}`}
              onClick={(e) => !canCheckout && e.preventDefault()}
            >
              {t('cart.checkout')}
            </Link>

            <Link to="/catalog" className={styles.continueLinkBtn}>
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
