import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Category } from '@/types';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icon';
import { ImageUpload } from '@/components/ImageUpload';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
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

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const category = useQuery({
    queryKey: ['admin', 'category', id],
    queryFn: () => apiClient.get<Category>(`/categories/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (category.data) {
      const ru = category.data.translations.find((t) => t.locale === 'ru');
      const ky = category.data.translations.find((t) => t.locale === 'ky');
      setDraft({
        slug: category.data.slug,
        ruName: ru?.name ?? '',
        kyName: ky?.name ?? '',
        ruDescription: ru?.description ?? '',
        kyDescription: ky?.description ?? '',
        imageUrl: category.data.imageUrl ?? '',
        sortOrder: String(category.data.sortOrder),
        isActive: category.data.isActive,
      });
    }
  }, [category.data]);

  const updateCategory = useMutation({
    mutationFn: (value: CategoryDraft) => {
      const payload = {
        slug: value.slug.trim().toLowerCase(),
        imageUrl: value.imageUrl.trim() || null,
        sortOrder: Number(value.sortOrder),
        isActive: value.isActive,
        translations: [
          { locale: 'ru', name: value.ruName.trim(), description: value.ruDescription.trim() || undefined },
          { locale: 'ky', name: value.kyName.trim(), description: value.kyDescription.trim() || undefined },
        ],
      };
      return apiClient.put(`/categories/${id}`, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['category', id] }),
      ]);
      navigate('/admin/categories');
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });

  const change = (field: keyof CategoryDraft, value: string | boolean) =>
    setDraft((current) => (current ? { ...current, [field]: value } : current));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft) updateCategory.mutate(draft);
  };

  if (category.isLoading || !draft) return <LoadingState />;
  if (category.error) return <ErrorState message={category.error.message} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton fallback="/admin/categories" />
        <h1 className={styles.title}>Редактировать категорию</h1>
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
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Описание (русский)</span>
              <textarea
                value={draft.ruDescription}
                onChange={(e) => change('ruDescription', e.target.value)}
                rows={3}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Описание (кыргызский)</span>
              <textarea
                value={draft.kyDescription}
                onChange={(e) => change('kyDescription', e.target.value)}
                rows={3}
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
            disabled={updateCategory.isPending}
          >
            {updateCategory.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
}
