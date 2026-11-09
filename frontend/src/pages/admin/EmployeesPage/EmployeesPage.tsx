import { StatCard } from '@/components/StatCard';
import styles from './EmployeesPage.module.css';

export function EmployeesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Сотрудники</h1>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего сотрудников" value="—" icon="badge" color="blue" />
        <StatCard title="Активных" value="—" icon="check_circle" color="green" />
        <StatCard title="Администраторов" value="—" icon="admin_panel_settings" color="orange" />
      </div>
      
      <div className={styles.content}>
        <p>Структурный каркас страницы Employees</p>
      </div>
    </div>
  );
}
