import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Dropdown Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchContent}>
          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <Icon name="search" className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder={t('header.search')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setQuery('')}
                  aria-label="Clear"
                >
                  <Icon name="close" className={styles.clearIcon} />
                </button>
              )}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <Icon name="close" className={styles.closeIcon} />
            </button>
          </form>

          {/* Search Results Area */}
          <div className={styles.resultsArea}>
            {!query ? (
              <div className={styles.emptyState}>
                <Icon name="search" className={styles.emptyIcon} />
                <p className={styles.emptyText}>{t('header.searchPlaceholder')}</p>
              </div>
            ) : (
              <div className={styles.resultsContainer}>
                {/* Future: Real-time search results */}
                <div className={styles.placeholder}>
                  {t('common.search')}...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
