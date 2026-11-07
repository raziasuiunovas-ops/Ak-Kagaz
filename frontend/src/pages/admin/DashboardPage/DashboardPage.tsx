import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Заказы</h3>
          <p className={styles.statValue}>—</p>
        </div>
        <div className={styles.statCard}>
          <h3>Продажи</h3>
          <p className={styles.statValue}>—</p>
        </div>
        <div className={styles.statCard}>
          <h3>Выручка</h3>
          <p className={styles.statValue}>—</p>
        </div>
        <div className={styles.statCard}>
          <h3>Покупатели</h3>
          <p className={styles.statValue}>—</p>
        </div>
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
