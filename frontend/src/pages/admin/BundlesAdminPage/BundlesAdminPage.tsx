import { StatCard } from '@/components/StatCard';
import styles from './BundlesAdminPage.module.css';

export function BundlesAdminPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Наборы</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего наборов" value="—" icon="inventory" color="blue" />
        <StatCard title="Активных" value="—" icon="check_circle" color="green" />
        <StatCard title="Со скидкой" value="—" icon="discount" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Bundles</p>
      </div>
    </div>
  );
}
