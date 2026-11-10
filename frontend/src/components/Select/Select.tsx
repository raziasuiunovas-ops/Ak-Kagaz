import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Выберите значение',
  disabled = false,
  required = false,
  error,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          const nextOption = options[nextIndex];
          if (nextOption && !nextOption.disabled) {
            onChange(nextOption.value);
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          const prevOption = options[prevIndex];
          if (prevOption && !prevOption.disabled) {
            onChange(prevOption.value);
          }
        }
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className} ${disabled ? styles.disabled : ''} ${
        error ? styles.hasError : ''
      }`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ''} ${
          !selectedOption ? styles.placeholder : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        <span className={styles.text}>{displayText}</span>
        <Icon
          name="expand_more"
          size={20}
          className={`${styles.icon} ${isOpen ? styles.iconRotated : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${option.value === value ? styles.selected : ''} ${
                option.disabled ? styles.optionDisabled : ''
              }`}
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              role="option"
              aria-selected={option.value === value}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {option.value === value && (
                <Icon name="check" size={18} className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
