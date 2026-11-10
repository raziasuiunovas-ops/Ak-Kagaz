import { useState, useRef, ChangeEvent } from 'react';
import { Icon } from '@/components/Icon';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value: string; // Current image URL
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void; // Callback for file selection
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onFileChange,
  label,
  required = false,
  disabled = false,
  error,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value);
  const [uploading] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setLocalError('Пожалуйста, выберите файл изображения');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setLocalError(`Файл слишком большой. Максимальный размер: ${maxSizeMB} МБ`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    if (onFileChange) {
      onFileChange(file);
    }

    // TODO: Upload to server when backend API is ready
    // For now, just use a placeholder path
    const tempPath = `/products/${file.name}`;
    onChange(tempPath);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (onFileChange) {
      onFileChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLocalError('');
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const displayError = error || localError;

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.uploadArea}>
        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.preview} />
            <div className={styles.previewOverlay}>
              <button
                type="button"
                className={styles.overlayButton}
                onClick={handleClick}
                disabled={disabled}
                title="Заменить изображение"
              >
                <Icon name="edit" size={20} />
              </button>
              <button
                type="button"
                className={styles.overlayButton}
                onClick={handleRemove}
                disabled={disabled}
                title="Удалить изображение"
              >
                <Icon name="delete" size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.uploadButton} ${displayError ? styles.hasError : ''}`}
            onClick={handleClick}
            disabled={disabled}
          >
            <Icon name="add_photo_alternate" size={48} className={styles.uploadIcon} />
            <span className={styles.uploadText}>
              {uploading ? 'Загрузка...' : 'Нажмите для выбора изображения'}
            </span>
            <span className={styles.uploadHint}>
              PNG, JPG, WEBP до {maxSizeMB} МБ
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className={styles.hiddenInput}
          aria-label={label || 'Выбрать изображение'}
        />
      </div>

      {displayError && <span className={styles.errorText}>{displayError}</span>}
    </div>
  );
}
