import { StatCard } from '@/components/StatCard';
import styles from './CustomersPage.module.css';

export function CustomersPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Покупатели</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего клиентов" value="—" icon="people" color="blue" />
        <StatCard title="Активных" value="—" icon="check_circle" color="green" />
        <StatCard title="Новых за месяц" value="—" icon="person_add" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Customers</p>
      </div>
    </div>
  );
}
