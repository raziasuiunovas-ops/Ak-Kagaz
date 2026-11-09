import { Truck, MapPin, CreditCard, Clock } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import { useInfoPageMetadata } from '@/hooks/usePageMetadata';
import styles from './DeliveryPage.module.css';

export function DeliveryPage() {
  const { t } = useLocale();
  
  // Set page metadata
  useInfoPageMetadata('meta.delivery.title', 'meta.delivery.description', '/delivery');

  return (
    <div className={styles.deliveryPage}>
      <Container size="narrow">
        <BackButton />
        <h1 className={styles.title}>{t('delivery.title')}</h1>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Truck className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>Доставка</h2>
            </div>
            <p className={styles.text}>
              Минимальная сумма заказа — <strong>400 сом</strong>.
            </p>
            <p className={styles.text}>
              Доставляем по всему Кыргызстану. Стоимость зависит от места доставки и будет уточнена по вашему адресу до подтверждения заказа.
            </p>
            <p className={styles.note}>
              Наш магазин находится в городе Ош.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>Самовывоз</h2>
            </div>
            <p className={styles.text}>
              Вы можете забрать заказ самостоятельно из нашего магазина.
            </p>
            <p className={styles.text}>
              Адрес точки самовывоза уточняется при согласовании заказа.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <CreditCard className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>Оплата</h2>
            </div>
            <p className={styles.text}>
              Мы принимаем следующие способы оплаты:
            </p>
            <ul className={styles.list}>
              <li>Наличные при получении</li>
              <li>Банковские карты</li>
              <li>Онлайн-переводы</li>
            </ul>
            <p className={styles.note}>
              Информация о способах оплаты будет уточнена.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Clock className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>Сроки доставки</h2>
            </div>
            <p className={styles.text}>
              Обработка заказа занимает до 1 рабочего дня.
            </p>
            <p className={styles.text}>
              Срок доставки уточняется при согласовании заказа.
            </p>
            <p className={styles.note}>
              Стоимость и срок доставки сообщим до подтверждения заказа.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
