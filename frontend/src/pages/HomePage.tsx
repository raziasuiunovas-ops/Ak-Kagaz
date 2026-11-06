import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Добро пожаловать в AK KAGAZ</h1>
        <p className={styles.subtitle}>
          Интернет-магазин канцтоваров в Оше, Кыргызстан
        </p>
        <p className={styles.description}>
          Frontend приложение настроено и готово к разработке
        </p>
      </section>

      <section className={styles.info}>
        <div className={styles.infoCard}>
          <h2>⚙️ Архитектура настроена</h2>
          <ul>
            <li>React 19</li>
            <li>Vite</li>
            <li>TypeScript (strict mode)</li>
            <li>React Router DOM</li>
            <li>TanStack Query</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h2>🎨 UI инструменты готовы</h2>
          <ul>
            <li>CSS Modules</li>
            <li>Lucide React (icons)</li>
            <li>React Hook Form</li>
            <li>Zod валидация</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h2>📱 PWA настроен</h2>
          <ul>
            <li>Web App Manifest</li>
            <li>Service Worker</li>
            <li>Offline support</li>
            <li>Installable</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
