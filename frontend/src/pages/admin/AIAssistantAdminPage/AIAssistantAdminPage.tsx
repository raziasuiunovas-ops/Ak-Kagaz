import { StatCard } from '@/components/StatCard';
import styles from './AIAssistantAdminPage.module.css';

export function AIAssistantAdminPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>AI-ассистент</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего запросов" value="—" icon="smart_toy" color="blue" />
        <StatCard title="Сегодня" value="—" icon="today" color="green" />
        <StatCard title="Среднее время" value="—" icon="schedule" color="orange" subtitle="сек" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы AIAssistant</p>
      </div>
    </div>
  );
}
