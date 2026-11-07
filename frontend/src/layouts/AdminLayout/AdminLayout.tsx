import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      if (!isSwiping.current) {
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
        
        // Определяем, это горизонтальный свайп или вертикальная прокрутка
        if (deltaX > deltaY && deltaX > 10) {
          isSwiping.current = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return;
      if (!isSwiping.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const threshold = 50; // минимальная дистанция свайпа

      // Свайп вправо от левого края экрана - открыть
      if (deltaX > threshold && touchStartX.current < 50 && !sidebarOpen) {
        setSidebarOpen(true);
      }
      // Свайп влево - закрыть
      else if (deltaX < -threshold && sidebarOpen) {
        setSidebarOpen(false);
      }

      isSwiping.current = false;
    };

    // Только для тач-устройств
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
    
    return undefined;
  }, [sidebarOpen]);

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapse={toggleCollapse}
      />
      
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <AdminHeader onMenuClick={toggleSidebar} />
        
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* Overlay для mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}
    </div>
  );
}
