import { StatCard } from '@/components/StatCard';
import styles from './CampaignsAdminPage.module.css';

export function CampaignsAdminPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Акции</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего акций" value="—" icon="celebration" color="blue" />
        <StatCard title="Активных" value="—" icon="check_circle" color="green" />
        <StatCard title="Запланировано" value="—" icon="schedule" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Campaigns</p>
      </div>
    </div>
  );
}
