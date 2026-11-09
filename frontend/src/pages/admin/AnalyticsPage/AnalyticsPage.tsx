import { StatCard } from '@/components/StatCard';
import styles from './AnalyticsPage.module.css';

export function AnalyticsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Аналитика</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Выручка" value="—" icon="payments" color="blue" subtitle="KGS" />
        <StatCard title="Продаж" value="—" icon="shopping_cart" color="green" />
        <StatCard title="Посетителей" value="—" icon="visibility" color="orange" />
        <StatCard title="Конверсия" value="—" icon="trending_up" color="orange" subtitle="%" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Analytics</p>
      </div>
    </div>
  );
}
