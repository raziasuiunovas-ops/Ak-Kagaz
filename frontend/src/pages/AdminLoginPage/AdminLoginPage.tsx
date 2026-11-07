import { FormEvent, useState } from 'react';
import { Container } from '@/components/Container';
import { useAdminLogin } from '@/hooks';
import styles from './AdminLoginPage.module.css';

export function AdminLoginPage() {
  const adminLoginMutation = useAdminLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate({ email, password });
  };

  return (
    <div className={styles.adminLoginPage}>
      <Container size="narrow">
        <div className={styles.formCard}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className={styles.title}>Вход в административную панель</h1>
            <p className={styles.subtitle}>
              После ввода учётных данных вам будет отправлен код подтверждения в Telegram
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {adminLoginMutation.isError && (
              <div className={styles.errorMessage}>
                {adminLoginMutation.error instanceof Error
                  ? adminLoginMutation.error.message
                  : 'Ошибка входа'}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ak-kagaz.kg"
                required
                disabled={adminLoginMutation.isPending}
                autoComplete="username"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <input
                type="password"
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={adminLoginMutation.isPending}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={adminLoginMutation.isPending}
            >
              {adminLoginMutation.isPending ? 'Проверка...' : 'Продолжить'}
            </button>
          </form>

          <div className={styles.footer}>
            <svg
              className={styles.securityIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className={styles.footerText}>
              Защищено двухфакторной аутентификацией через Telegram
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
