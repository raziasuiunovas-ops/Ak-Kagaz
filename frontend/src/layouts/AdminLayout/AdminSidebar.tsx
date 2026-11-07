import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: AdminSidebarProps) {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Товары', icon: '📦' },
    { path: '/admin/categories', label: 'Категории', icon: '🗂️' },
    { path: '/admin/orders', label: 'Заказы', icon: '🛒' },
    { path: '/admin/customers', label: 'Покупатели', icon: '👥' },
    { path: '/admin/warehouse', label: 'Склад', icon: '🏭' },
    { path: '/admin/bundles', label: 'Наборы', icon: '📚' },
    { path: '/admin/recommendations', label: 'Рекомендации', icon: '🎯' },
    { path: '/admin/campaigns', label: 'Акции', icon: '🎉' },
    { path: '/admin/reviews', label: 'Отзывы', icon: '⭐' },
    { path: '/admin/ai-assistant', label: 'AI-ассистент', icon: '🤖' },
    { path: '/admin/employees', label: 'Сотрудники', icon: '👔' },
    { path: '/admin/analytics', label: 'Аналитика', icon: '📈' },
    { path: '/admin/settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          {!isCollapsed && <span className={styles.logoText}>АК КАГАЗ</span>}
          {isCollapsed && <span className={styles.logoIcon}>АК</span>}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!isCollapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
