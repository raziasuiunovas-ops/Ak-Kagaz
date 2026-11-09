import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('adminSidebarCollapsed') === 'true';
  });

  useEffect(() => {
    const handleToggle = (event: CustomEvent) => {
      setIsCollapsed(event.detail.collapsed);
    };

    window.addEventListener('toggleSidebar', handleToggle as EventListener);
    return () => {
      window.removeEventListener('toggleSidebar', handleToggle as EventListener);
    };
  }, []);

  const menuItems = [
    { path: '/admin', label: 'Панель управления', icon: 'dashboard' },
    { path: '/admin/products', label: 'Товары', icon: 'inventory_2' },
    { path: '/admin/categories', label: 'Категории', icon: 'folder_open' },
    { path: '/admin/orders', label: 'Заказы', icon: 'shopping_cart' },
    { path: '/admin/customers', label: 'Покупатели', icon: 'people' },
    { path: '/admin/warehouse', label: 'Склад', icon: 'warehouse' },
    { path: '/admin/bundles', label: 'Наборы', icon: 'inventory' },
    { path: '/admin/recommendations', label: 'Рекомендации', icon: 'recommend' },
    { path: '/admin/campaigns', label: 'Акции', icon: 'celebration' },
    { path: '/admin/reviews', label: 'Отзывы', icon: 'star' },
    { path: '/admin/ai-assistant', label: 'AI-ассистент', icon: 'smart_toy' },
    { path: '/admin/employees', label: 'Сотрудники', icon: 'badge' },
    { path: '/admin/analytics', label: 'Аналитика', icon: 'analytics' },
    { path: '/admin/settings', label: 'Настройки', icon: 'settings' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <img 
            src="/icons/ak-kagaz-icon-192-transparent.png" 
            alt="AK KAGAZ" 
            className={styles.logoImage}
          />
          {!isCollapsed && <span className={styles.logoText}>АК КАГАЗ</span>}
        </div>
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
            <Icon name={item.icon} size={20} className={styles.icon} />
            {!isCollapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
