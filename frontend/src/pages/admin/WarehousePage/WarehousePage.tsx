import { StatCard } from '@/components/StatCard';
import styles from './WarehousePage.module.css';

export function WarehousePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Склад</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Товаров на складе" value="—" icon="warehouse" color="blue" />
        <StatCard title="В наличии" value="—" icon="check_circle" color="green" />
        <StatCard title="Заканчивается" value="—" icon="warning" color="orange" />
        <StatCard title="Нет в наличии" value="—" icon="cancel" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Warehouse</p>
      </div>
    </div>
  );
}
