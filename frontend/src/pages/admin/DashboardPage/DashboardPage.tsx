import { StatCard } from '@/components/StatCard';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Панель управления</h1>
      
      <div className={styles.statsGrid}>
        <StatCard title="Заказы" value="—" icon="shopping_cart" color="blue" />
        <StatCard title="Продажи" value="—" icon="trending_up" color="green" />
        <StatCard title="Выручка" value="—" icon="payments" color="orange" subtitle="KGS" />
        <StatCard title="Покупатели" value="—" icon="people" color="orange" />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Последние заказы</h2>
        <div className={styles.emptyState}>
          <p>Нет данных для отображения</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Товары с низким остатком</h2>
        <div className={styles.emptyState}>
          <p>Нет данных для отображения</p>
        </div>
      </div>
    </div>
  );
}
