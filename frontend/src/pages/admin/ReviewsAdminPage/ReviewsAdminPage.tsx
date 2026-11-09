import { StatCard } from '@/components/StatCard';
import styles from './ReviewsAdminPage.module.css';

export function ReviewsAdminPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Отзывы</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего отзывов" value="—" icon="star" color="blue" />
        <StatCard title="Опубликовано" value="—" icon="check_circle" color="green" />
        <StatCard title="На модерации" value="—" icon="pending" color="orange" />
        <StatCard title="Средняя оценка" value="—" icon="grade" color="orange" subtitle="из 5" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Reviews</p>
      </div>
    </div>
  );
}
