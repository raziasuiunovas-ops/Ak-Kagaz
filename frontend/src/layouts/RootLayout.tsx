import { Outlet } from 'react-router-dom';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.logo}>AK KAGAZ</h1>
          <nav className={styles.nav}>
            {/* Navigation will be implemented later */}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; 2026 AK KAGAZ. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
