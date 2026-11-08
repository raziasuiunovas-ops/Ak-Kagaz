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
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
    };
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
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Search Modal */}
      <div className={styles.modal}>
        <form className={styles.searchForm} onSubmit={handleSubmit}>
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
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Icon name="close" className={styles.closeIcon} />
          </button>
        </form>

        <div className={styles.results}>
          {/* Future: Real-time search results */}
          <div className={styles.placeholder}>
            {query ? t('common.search') : t('header.search')}
          </div>
        </div>
      </div>
    </>
  );
}
