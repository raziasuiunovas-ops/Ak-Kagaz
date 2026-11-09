import { StatCard } from '@/components/StatCard';
import styles from './RecommendationsAdminPage.module.css';

export function RecommendationsAdminPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Рекомендации</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего рекомендаций" value="—" icon="recommend" color="blue" />
        <StatCard title="Активных" value="—" icon="check_circle" color="green" />
        <StatCard title="Просмотров" value="—" icon="visibility" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Recommendations</p>
      </div>
    </div>
  );
}
