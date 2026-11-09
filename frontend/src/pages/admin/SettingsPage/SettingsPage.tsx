import { StatCard } from '@/components/StatCard';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Версия системы" value="1.0.0" icon="settings" color="blue" />
        <StatCard title="Последнее обновление" value="—" icon="update" color="green" />
        <StatCard title="Активных модулей" value="—" icon="apps" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Settings</p>
      </div>
    </div>
  );
}
