import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { EmptyState } from '@/components/EmptyState';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './OrderHistoryPage.module.css';

export function OrderHistoryPage() {
  const { t } = useLocale();
  const orders: any[] = []; // Future: Real orders data

  if (orders.length === 0) {
    return (
      <div className={styles.orderHistoryPage}>
        <Container>
          <BackButton fallback="/profile" />
          <h1 className={styles.title}>{t('orders.title')}</h1>
          <EmptyState
            icon={<Package className={styles.emptyIcon} />}
            title={t('orders.empty')}
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
    <div className={styles.orderHistoryPage}>
      <Container>
        <BackButton fallback="/profile" />
        <h1 className={styles.title}>{t('orders.title')}</h1>

        <div className={styles.ordersList}>
          {/* Future: Dynamic orders */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderNumber}>
                    {t('orders.orderNumber')}{index + 1000}
                  </h3>
                  <p className={styles.orderDate}>01.01.2026</p>
                </div>
                <div className={styles.orderStatus}>
                  <span className={styles.statusBadge}>Доставлен</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                <div className={styles.orderItem}>
                  <div className={styles.itemImage} />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>Товар {index + 1}</p>
                    <p className={styles.itemQuantity}>x 1</p>
                  </div>
                </div>
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                  <span>{t('orders.total')}:</span>
                  <span className={styles.totalAmount}>000 сом</span>
                </div>
                <Link to={`/profile/orders/${index + 1}`} className={styles.detailsBtn}>
                  {t('orders.details')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
