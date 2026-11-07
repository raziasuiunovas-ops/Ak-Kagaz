import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { useLocale } from '@/contexts/LocaleContext';
import { useRegister } from '@/hooks';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setPasswordError(t('auth.passwordTooShort'));
      return;
    }

    registerMutation.mutate({
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined,
      locale,
    });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.registerPage}>
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
          <h1 className={styles.title}>{t('auth.register')}</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            {registerMutation.isError && (
              <div className={styles.errorMessage}>
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
                  : 'Registration failed'}
              </div>
            )}

            {passwordError && (
              <div className={styles.errorMessage}>{passwordError}</div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  {t('auth.lastName')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

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
                disabled={registerMutation.isPending}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996"
                disabled={registerMutation.isPending}
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
                  minLength={8}
                  disabled={registerMutation.isPending}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  disabled={registerMutation.isPending}
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
              <span className={styles.hint}>{t('auth.passwordHint')}</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                {t('auth.confirmPassword')}
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={registerMutation.isPending}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  disabled={registerMutation.isPending}
                >
                  {showConfirmPassword ? (
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

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>

          <div className={styles.divider}>
            <span>{t('auth.haveAccount')}</span>
          </div>

          <Link to="/login" className={styles.loginLink}>
            {t('auth.signIn')}
          </Link>
        </div>
      </Container>
    </div>
  );
}
