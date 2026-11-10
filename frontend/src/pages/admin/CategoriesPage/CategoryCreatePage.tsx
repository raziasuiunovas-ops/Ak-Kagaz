import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icon';
import { ImageUpload } from '@/components/ImageUpload';
import styles from './CategoryForm.module.css';

type CategoryDraft = {
  slug: string;
  ruName: string;
  kyName: string;
  ruDescription: string;
  kyDescription: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

const blank: CategoryDraft = {
  slug: '',
  ruName: '',
  kyName: '',
  ruDescription: '',
  kyDescription: '',
  imageUrl: '',
  sortOrder: '0',
  isActive: false,
};

export function CategoryCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<CategoryDraft>(blank);
  const [errorMessage, setErrorMessage] = useState('');

  const saveCategory = useMutation({
    mutationFn: (value: CategoryDraft) => {
      const payload = {
        slug: value.slug.trim().toLowerCase(),
        imageUrl: value.imageUrl.trim() || undefined,
        sortOrder: Number(value.sortOrder),
        isActive: value.isActive,
        translations: [
          { locale: 'ru', name: value.ruName.trim(), description: value.ruDescription.trim() || undefined },
          { locale: 'ky', name: value.kyName.trim(), description: value.kyDescription.trim() || undefined },
        ],
      };
      return apiClient.post('/categories', payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ]);
      navigate('/admin/categories');
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });

  const change = (field: keyof CategoryDraft, value: string | boolean) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveCategory.mutate(draft);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton fallback="/admin/categories" />
        <h1 className={styles.title}>Новая категория</h1>
      </div>

      {errorMessage && (
        <div className={styles.errorBanner}>
          <Icon name="error" size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={submit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>
                Slug <span className={styles.required}>*</span>
              </span>
              <input
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                value={draft.slug}
                onChange={(e) => change('slug', e.target.value)}
                placeholder="category-slug"
              />
              <span className={styles.hint}>Латинские буквы, цифры и дефис</span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Порядок отображения <span className={styles.required}>*</span>
              </span>
              <input
                required
                type="number"
                min="0"
                value={draft.sortOrder}
                onChange={(e) => change('sortOrder', e.target.value)}
              />
              <span className={styles.hint}>Меньше значение — выше в списке</span>
            </label>

            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => change('isActive', e.target.checked)}
              />
              <span>Активна (отображается в каталоге)</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Изображение</h2>
          <ImageUpload
            label="Изображение категории"
            value={draft.imageUrl}
            onChange={(url) => change('imageUrl', url)}
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Названия и описания</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>
                Название (русский) <span className={styles.required}>*</span>
              </span>
              <input
                required
                maxLength={100}
                value={draft.ruName}
                onChange={(e) => change('ruName', e.target.value)}
                placeholder="Школьные принадлежности"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Название (кыргызский) <span className={styles.required}>*</span>
              </span>
              <input
                required
                maxLength={100}
                value={draft.kyName}
                onChange={(e) => change('kyName', e.target.value)}
                placeholder="Мектеп керектөөлөрү"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Описание (русский)</span>
              <textarea
                value={draft.ruDescription}
                onChange={(e) => change('ruDescription', e.target.value)}
                rows={3}
                placeholder="Краткое описание категории..."
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Описание (кыргызский)</span>
              <textarea
                value={draft.kyDescription}
                onChange={(e) => change('kyDescription', e.target.value)}
                rows={3}
                placeholder="Категориянын кыскача сыпаттамасы..."
              />
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/admin/categories')}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={saveCategory.isPending}
          >
            {saveCategory.isPending ? 'Сохранение...' : 'Создать категорию'}
          </button>
        </div>
      </form>
    </div>
  );
}
