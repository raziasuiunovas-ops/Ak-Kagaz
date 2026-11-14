import { Check, CircleX, LoaderCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './PaymentResultPage.module.css';

interface PublicPayment {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  completedAt: string | null;
}

interface PaymentResultProps { variant: 'success' | 'failed' }

export function PaymentResultPage({ variant }: PaymentResultProps) {
  const { t, locale } = useLocale();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId') ?? '';
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(false);
  const payment = useQuery({
    queryKey: ['public-payment', paymentId],
    queryFn: () => apiClient.get<PublicPayment>(`/payments/public/${encodeURIComponent(paymentId)}`),
    enabled: paymentId.length > 0,
    retry: 1,
    refetchInterval: (query) => query.state.data?.status === 'COMPLETED' || query.state.data?.status === 'FAILED' || query.state.data?.status === 'CANCELLED' ? false : 2500,
  });
  const confirmed = payment.data?.status === 'COMPLETED';
  const terminalFailure = payment.data?.status === 'FAILED';
  const serverConfirmedFailure = terminalFailure || payment.data?.status === 'CANCELLED';

  useEffect(() => {
    if (confirmed && payment.data?.orderId === sessionStorage.getItem('ak-kagaz-pending-checkout-order')) {
      sessionStorage.removeItem('ak-kagaz-pending-checkout-order');
    }
  }, [confirmed, payment.data?.orderId]);

  const retryPayment = async () => {
    if (!payment.data?.orderId || !terminalFailure) return;
    setRetrying(true);
    setRetryError(false);
    try {
      const result = await apiClient.post<{ paymentUrl: string }>('/payments/finik', { orderId: payment.data.orderId, locale });
      window.location.assign(result.paymentUrl);
    } catch {
      setRetrying(false);
      setRetryError(true);
    }
  };

  const showFailure = !confirmed && (variant === 'failed' || serverConfirmedFailure);
  const title = confirmed
    ? t('payment.successTitle')
    : showFailure
      ? t('payment.failedTitle')
      : t('payment.pendingTitle');
  const message = confirmed
    ? t('payment.successMessage')
    : showFailure
      ? t('payment.failedMessage')
      : t('payment.pendingMessage');

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-live="polite">
        <div className={`${styles.icon} ${confirmed ? styles.iconSuccess : showFailure ? styles.iconFailed : styles.iconPending}`}>
          {confirmed ? <Check aria-hidden="true" /> : showFailure ? <CircleX aria-hidden="true" /> : <LoaderCircle aria-hidden="true" className={styles.spinner} />}
        </div>
        <h1>{title}</h1>
        <p className={styles.message}>{message}</p>
        {payment.isPending && <p className={styles.status}>{t('payment.checking')}</p>}
        {payment.isError && <p className={styles.status}>{t('payment.statusUnavailable')}</p>}
        {payment.data && (
          <dl className={styles.details}>
            <div><dt>{t('payment.order')}</dt><dd>{payment.data.orderNumber}</dd></div>
            <div><dt>{t('payment.amount')}</dt><dd>{payment.data.amount.toLocaleString(locale)} сом</dd></div>
            {confirmed && payment.data.completedAt && <div><dt>{t('payment.confirmed')}</dt><dd>{new Intl.DateTimeFormat(locale === 'ky' ? 'ky-KG' : 'ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(payment.data.completedAt))}</dd></div>}
          </dl>
        )}
        {retryError && <p className={styles.error} role="alert">{t('payment.retryError')}</p>}
        <div className={styles.actions}>
          {terminalFailure && <button className={styles.retryButton} type="button" onClick={() => void retryPayment()} disabled={retrying}>{retrying ? t('payment.retrying') : t('payment.retry')}</button>}
          <Link className={styles.storeButton} to="/catalog">{t('payment.backToStore')}</Link>
        </div>
      </section>
    </main>
  );
}
