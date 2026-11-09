import { useState } from 'react';
import { Package } from 'lucide-react';
import { Container } from '@/components/Container';
import { BundleCard } from '@/components/BundleCard';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { useBundles } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import type { BundleType } from '@/types';
import styles from './BundlesPage.module.css';

export function BundlesPage() {
  const { t, locale } = useLocale();
  
  // Set page metadata
  usePageMetadata({
    title: 'meta.bundles.title',
    description: 'meta.bundles.description',
    path: '/bundles',
  });
  
  const [selectedType, setSelectedType] = useState<BundleType | 'ALL'>('ALL');

  const { data: bundles, isLoading, error } = useBundles({
    locale,
    isActive: true,
    ...(selectedType !== 'ALL' && { type: selectedType }),
  });

  const bundleTypes: Array<{ value: BundleType | 'ALL'; label: string }> = [
    { value: 'ALL', label: locale === 'ru' ? 'Все наборы' : 'Бардык топтомдор' },
    { value: 'SCHOOL_KIT', label: locale === 'ru' ? 'Школьные наборы' : 'Мектеп топтомдору' },
    { value: 'OFFICE_SET', label: locale === 'ru' ? 'Офисные наборы' : 'Офис топтомдору' },
    { value: 'ART_SET', label: locale === 'ru' ? 'Творческие наборы' : 'Чыгармачылык топтомдору' },
    { value: 'SEASONAL', label: locale === 'ru' ? 'Сезонные наборы' : 'Сезондук топтомдор' },
  ];

  if (error) {
    return (
      <div className={styles.page}>
        <Container>
          <ErrorState
            message={error.message || t('error.unknown')}
            onRetry={() => window.location.reload()}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Package className={styles.titleIcon} />
            <h1 className={styles.title}>
              {locale === 'ru' ? 'Готовые наборы' : 'Даяр топтомдор'}
            </h1>
          </div>
          <p className={styles.subtitle}>
            {locale === 'ru'
              ? 'Удобные готовые наборы для школы, офиса и творчества со скидкой'
              : 'Мектепке, офиске жана чыгармачылыкка арзандатуу даяр топтомдор'}
          </p>
        </div>

        <div className={styles.filters}>
          {bundleTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`${styles.filterBtn} ${selectedType === type.value ? styles.filterBtnActive : ''}`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState message={t('common.loading')} fullHeight />
        ) : !bundles || bundles.length === 0 ? (
          <EmptyState
            message={
              locale === 'ru'
                ? 'Наборы не найдены'
                : 'Топтомдор табылган жок'
            }
          />
        ) : (
          <div className={styles.grid}>
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
