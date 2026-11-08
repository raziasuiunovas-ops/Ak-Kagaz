import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './LoginPage/LoginPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function ForgotPasswordPage() {
  const { t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsPending(true);
    try {
      if (token) {
        if (password !== confirmation) throw new Error(t('auth.passwordMismatch'));
        if (password.length < 8) throw new Error(t('auth.passwordTooShort'));
        const response = await fetch(`${API_URL}/auth/password-reset/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || t('auth.resetError'));
        setMessage(t('auth.resetSuccess'));
        setSearchParams({}, { replace: true });
      } else {
        const response = await fetch(`${API_URL}/auth/password-reset/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || t('auth.resetError'));
        setMessage(t('auth.resetRequested'));
        if (payload.data?.testResetUrl || payload.testResetUrl) {
          setResetUrl(payload.data?.testResetUrl || payload.testResetUrl);
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('auth.resetError'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <Container size="narrow">
        <div className={styles.formCard}>
          <h1 className={styles.title}>{token ? t('auth.chooseNewPassword') : t('auth.forgotPasswordTitle')}</h1>
          <p className={styles.authHint}>{token ? t('auth.resetPasswordHint') : t('auth.resetRequestHint')}</p>
          <form onSubmit={submit} className={styles.form}>
            {error && <div className={styles.errorMessage} role="alert">{error}</div>}
            {message && <div className={styles.successMessage} role="status">{message}</div>}
            {token ? (
              <>
                <label className={styles.formGroup}>
                  <span className={styles.label}>{t('auth.newPassword')}</span>
                  <input className={styles.input} type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <label className={styles.formGroup}>
                  <span className={styles.label}>{t('auth.confirmPassword')}</span>
                  <input className={styles.input} type="password" minLength={8} autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </label>
              </>
            ) : (
              <label className={styles.formGroup}>
                <span className={styles.label}>{t('auth.email')}</span>
                <input className={styles.input} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            )}
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? t('common.loading') : token ? t('auth.resetPassword') : t('auth.sendResetLink')}
            </button>
            {resetUrl && <a className={styles.testResetLink} href={resetUrl}>{t('auth.openTestResetLink')}</a>}
          </form>
          <Link to="/login" className={styles.authBackLink}>{t('auth.backToLogin')}</Link>
        </div>
      </Container>
    </div>
  );
}
