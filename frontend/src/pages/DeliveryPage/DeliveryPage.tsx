import { Truck, MapPin, CreditCard, Clock } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './DeliveryPage.module.css';

export function DeliveryPage() {
  const { t } = useLocale();

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
              Мы осуществляем доставку по городу Ош. Стоимость и сроки доставки будут уточнены.
            </p>
            <p className={styles.note}>
              Информация о стоимости доставки будет добавлена после согласования с владельцем.
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
              Адрес и режим работы уточняются.
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
              Доставка осуществляется в течение 1-2 рабочих дней.
            </p>
            <p className={styles.note}>
              Точные сроки будут уточнены после оформления заказа.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
