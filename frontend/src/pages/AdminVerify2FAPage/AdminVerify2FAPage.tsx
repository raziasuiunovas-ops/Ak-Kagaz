import { FormEvent, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { useAdminVerify2FA } from '@/hooks';
import styles from './AdminVerify2FAPage.module.css';

export function AdminVerify2FAPage() {
  const navigate = useNavigate();
  const verify2FAMutation = useAdminVerify2FA();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Проверяем наличие данных для 2FA
    const storedUserId = sessionStorage.getItem('admin_2fa_userId');
    const storedEmail = sessionStorage.getItem('admin_2fa_email');

    if (!storedUserId || !storedEmail) {
      // Если данных нет, возвращаем на страницу входа
      navigate('/login');
      return;
    }

    setUserId(storedUserId);
    setEmail(storedEmail);

    // Фокус на первый инпут
    inputRefs.current[0]?.focus();
  }, [navigate]);

  const handleInputChange = (index: number, value: string) => {
    // Разрешаем только цифры
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автоматический переход на следующий инпут
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Переход на предыдущий инпут при Backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Проверяем, что это 6 цифр
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Автоматическая отправка
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = (fullCode?: string) => {
    const codeToSubmit = fullCode || code.join('');
    
    if (codeToSubmit.length !== 6) {
      return;
    }

    console.log('=== ADMIN VERIFY 2FA DEBUG ===');
    console.log('userId:', userId);
    console.log('code:', codeToSubmit);
    console.log('code length:', codeToSubmit.length);

    verify2FAMutation.mutate({
      userId,
      code: codeToSubmit,
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : local;
    
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className={styles.verify2FAPage}>
      <Container size="narrow">
        <div className={styles.formCard}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h1 className={styles.title}>Введите код подтверждения</h1>
            <p className={styles.subtitle}>
              Мы отправили 6-значный код в Telegram на аккаунт, связанный с{' '}
              <span className={styles.email}>{maskEmail(email)}</span>
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className={styles.form}>
            {verify2FAMutation.isError && (
              <div className={styles.errorMessage}>
                {verify2FAMutation.error instanceof Error
                  ? verify2FAMutation.error.message
                  : 'Неверный код'}
              </div>
            )}

            <div className={styles.codeInputWrapper}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.codeInput}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={verify2FAMutation.isPending}
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={verify2FAMutation.isPending || code.join('').length !== 6}
            >
              {verify2FAMutation.isPending ? 'Проверка...' : 'Подтвердить'}
            </button>
          </form>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate('/login')}
              disabled={verify2FAMutation.isPending}
            >
              ← Вернуться к входу
            </button>
          </div>

          <div className={styles.info}>
            <svg className={styles.infoIcon} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className={styles.infoText}>
              Код действителен в течение 5 минут. Максимум 3 попытки ввода.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
