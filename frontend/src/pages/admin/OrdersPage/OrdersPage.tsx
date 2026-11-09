import { StatCard } from '@/components/StatCard';
import styles from './OrdersPage.module.css';

export function OrdersPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Заказы</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего заказов" value="—" icon="shopping_cart" color="blue" />
        <StatCard title="В обработке" value="—" icon="pending" color="orange" />
        <StatCard title="Завершено" value="—" icon="check_circle" color="green" />
        <StatCard title="Отменено" value="—" icon="cancel" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Orders</p>
      </div>
    </div>
  );
}
