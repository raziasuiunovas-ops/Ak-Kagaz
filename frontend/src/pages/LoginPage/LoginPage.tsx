import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { useLocale } from '@/contexts/LocaleContext';
import { useLogin, useVerify2FA, useAdminLogin } from '@/hooks';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const adminLoginMutation = useAdminLogin();
  const verify2FAMutation = useVerify2FA();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [code2FA, setCode2FA] = useState('');

  // Автоматически определяем админа по домену email
  const isAdminEmail = (email: string): boolean => {
    return email.toLowerCase().includes('@ak-kagaz.kg');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (requires2FA) {
      // Этап 2: проверка 2FA кода
      verify2FAMutation.mutate({ userId, code: code2FA });
    } else {
      // Этап 1: отправка email/password
      const isAdmin = isAdminEmail(email);
      
      if (isAdmin) {
        // Для админов используем adminLoginMutation БЕЗ переопределения onSuccess
        // Хук сам сделает redirect на /admin/verify-2fa
        adminLoginMutation.mutate({ email, password });
      } else {
        // Для обычных пользователей используем loginMutation
        loginMutation.mutate(
          { email, password },
          {
            onSuccess: (data) => {
              if ('requires2FA' in data && data.requires2FA) {
                setRequires2FA(true);
                setUserId(data.userId);
              }
            },
          }
        );
      }
    }
  };

  const handleGoBack = () => {
    if (requires2FA) {
      // Вернуться к первому этапу
      setRequires2FA(false);
      setCode2FA('');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.loginPage}>
      <Container size="narrow">
        <button 
          type="button" 
          onClick={handleGoBack} 
          className={styles.backButton}
          aria-label="Назад"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12.5 5L7.5 10L12.5 15" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>Назад</span>
        </button>

        <div className={styles.formCard}>
          <h1 className={styles.title}>
            {requires2FA ? 'Введите код из Telegram' : t('auth.login')}
          </h1>

          {requires2FA && (
            <p className={styles.twoFactorHint}>
              6-значный код был отправлен в Telegram-бот
            </p>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {(loginMutation.isError || adminLoginMutation.isError || verify2FAMutation.isError) && (
              <div className={styles.errorMessage}>
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : adminLoginMutation.error instanceof Error
                  ? adminLoginMutation.error.message
                  : verify2FAMutation.error instanceof Error
                  ? verify2FAMutation.error.message
                  : 'Login failed'}
              </div>
            )}

            {!requires2FA ? (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loginMutation.isPending || adminLoginMutation.isPending}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    {t('auth.password')}
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={styles.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loginMutation.isPending || adminLoginMutation.isPending}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      disabled={loginMutation.isPending || adminLoginMutation.isPending}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.5 3.5L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M8.5 8.5C8.18031 8.8193 8 9.2612 8 9.75C8 10.7165 8.78349 11.5 9.75 11.5C10.2388 11.5 10.6807 11.3197 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M6.5 6C4.5 7 3 9 3 9C3 9 5 13.5 10 13.5C10.8 13.5 11.5 13.3 12.1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M14.5 12C15.8 11 17 9 17 9C17 9 15 4.5 10 4.5C9.5 4.5 9 4.6 8.5 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Link to="/forgot-password" className={styles.forgotLink}>
                  {t('auth.forgotPassword')}
                </Link>
              </>
            ) : (
              <div className={styles.formGroup}>
                <label htmlFor="code2fa" className={styles.label}>
                  Код подтверждения
                </label>
                <input
                  type="text"
                  id="code2fa"
                  className={styles.input}
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={verify2FAMutation.isPending}
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '0.5em' }}
                />
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loginMutation.isPending || adminLoginMutation.isPending || verify2FAMutation.isPending}
            >
              {loginMutation.isPending || adminLoginMutation.isPending || verify2FAMutation.isPending 
                ? t('common.loading') 
                : requires2FA 
                ? 'Подтвердить' 
                : t('auth.signIn')}
            </button>
          </form>

          {!requires2FA && (
            <>
              <div className={styles.divider}>
                <span>{t('auth.noAccount')}</span>
              </div>

              <Link to="/register" className={styles.registerLink}>
                {t('auth.signUp')}
              </Link>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
