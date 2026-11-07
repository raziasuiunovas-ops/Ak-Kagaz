import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './InstallmentPage.module.css';

export function InstallmentPage() {
  const { t } = useLocale();

  return (
    <div className={styles.installmentPage}>
      <Container size="narrow">
        <BackButton />
        <h1 className={styles.title}>{t('installment.title')}</h1>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <CreditCard className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>О рассрочке</h2>
            </div>
            <p className={styles.text}>
              Мы предлагаем удобную систему оплаты в рассрочку для наших покупателей.
            </p>
            <p className={styles.text}>
              Оформите покупку сейчас, а платите частями без переплат и скрытых комиссий.
            </p>
            <p className={styles.note}>
              Подробная информация о рассрочке будет добавлена после согласования условий.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <CheckCircle className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>Преимущества</h2>
            </div>
            <ul className={styles.list}>
              <li>Без первоначального взноса</li>
              <li>Без процентов и переплат</li>
              <li>Гибкие сроки рассрочки</li>
              <li>Простое оформление</li>
            </ul>
            <p className={styles.note}>
              Условия рассрочки будут уточнены.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <AlertCircle className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>Как оформить</h2>
            </div>
            <ol className={styles.orderedList}>
              <li>Выберите товары и добавьте в корзину</li>
              <li>При оформлении заказа выберите оплату в рассрочку</li>
              <li>Заполните необходимые данные</li>
              <li>Получите одобрение</li>
              <li>Заберите товар и платите по графику</li>
            </ol>
            <p className={styles.note}>
              Процесс оформления будет детализирован.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
