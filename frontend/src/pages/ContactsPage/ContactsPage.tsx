import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './ContactsPage.module.css';

export function ContactsPage() {
  const { t } = useLocale();

  return (
    <div className={styles.contactsPage}>
      <Container size="narrow">
        <BackButton />
        <h1 className={styles.title}>{t('contacts.title')}</h1>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Свяжитесь с нами</h2>
            
            <div className={styles.contactsList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <MapPin className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <h3 className={styles.contactTitle}>Адрес</h3>
                  <p className={styles.contactText}>
                    г. Ош, Кыргызстан
                  </p>
                  <p className={styles.contactNote}>
                    (Точный адрес будет добавлен)
                  </p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <Phone className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <h3 className={styles.contactTitle}>Телефон</h3>
                  <p className={styles.contactText}>
                    +996 XXX XXX XXX
                  </p>
                  <p className={styles.contactNote}>
                    (Номер телефона будет добавлен)
                  </p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <Mail className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <h3 className={styles.contactTitle}>Email</h3>
                  <p className={styles.contactText}>
                    info@ak-kagaz.kg
                  </p>
                  <p className={styles.contactNote}>
                    (Email будет добавлен)
                  </p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <Clock className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <h3 className={styles.contactTitle}>Режим работы</h3>
                  <p className={styles.contactText}>
                    Пн-Сб: 09:00 - 19:00
                  </p>
                  <p className={styles.contactText}>
                    Вс: Выходной
                  </p>
                  <p className={styles.contactNote}>
                    (Режим работы будет уточнён)
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.mapSection}>
            <h2 className={styles.sectionTitle}>Как нас найти</h2>
            <div className={styles.mapPlaceholder}>
              {/* Future: Map integration */}
              <p>Карта будет добавлена</p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
