import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useCurrentUser } from '@/hooks';
import type { Category } from '@/types';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import styles from './CategoriesPage.module.css';

const canonicalSchoolCategorySlug = 'backpacks';
const duplicateSchoolCategorySlug = 'school-supplies';
const canonicalSchoolCategoryImage = `/catalog/${encodeURIComponent('Школьные принадлежности с рюкзаком.png')}`;

type CategoryMergeResult = {
  sourceProductCount: number;
  movedProductCount: number;
  targetProductCount: number;
};

export function CategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.userRoles?.some((entry: { role: { name: string } }) => entry.role.name === 'SUPER_ADMIN') ?? false;
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => apiClient.get<{ data: Category[] }>('/categories', { params: { page: 1, limit: 100 } }),
  });

  const mergeSchoolCategories = useMutation({
    mutationFn: ({ source, target }: { source: Category; target: Category }) => {
      const russian = target.translations.find((translation) => translation.locale === 'ru');
      const kyrgyz = target.translations.find((translation) => translation.locale === 'ky');
      return apiClient.post<CategoryMergeResult>(`/categories/${source.id}/merge`, {
        targetCategoryId: target.id,
        imageUrl: canonicalSchoolCategoryImage,
        expectedSourceProductCount: source._count?.products ?? 0,
        expectedTargetProductCount: target._count?.products ?? 0,
        translations: [
          { locale: 'ru', name: 'Школа и канцелярские принадлежности', description: russian?.description },
          { locale: 'ky', name: 'Мектеп жана кеңсе буюмдары', description: kyrgyz?.description },
        ],
      });
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['category'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
      setErrorMessage('');
      setSuccessMessage(`Объединение выполнено: перенесено товаров ${result.movedProductCount} из ${result.sourceProductCount}; в основной категории теперь ${result.targetProductCount}.`);
    },
    onError: (error: Error) => {
      setSuccessMessage('');
      setErrorMessage(`Категории не объединены. Изменения транзакции отменены: ${error.message}`);
    },
  });

  const totalCategories = categories.data?.data.length ?? 0;
  const activeCategories = categories.data?.data.filter(c => c.isActive).length ?? 0;
  const totalProducts = categories.data?.data.reduce((sum, c) => sum + (c._count?.products ?? 0), 0) ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>Категории</h1>
          <p className={styles.muted}>Управление категориями каталога. Порядок отображения и переводы синхронизируются с публичным сайтом.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => navigate('/admin/categories/create')}>
          Добавить категорию
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Всего категорий" value={totalCategories} icon="folder_open" color="blue" />
        <StatCard title="Активных" value={activeCategories} icon="check_circle" color="green" />
        <StatCard title="Товаров" value={totalProducts} icon="inventory_2" color="orange" />
      </div>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      {successMessage && <p className={styles.success} role="status">{successMessage}</p>}
      {categories.isLoading && <p>Загрузка категорий…</p>}
      {categories.error && <p className={styles.error}>{categories.error.message}</p>}
      
      {!categories.isLoading && !categories.error && (categories.data?.data.length ? (
        <div className={styles.list}>
          {categories.data.data.map((category) => (
            <article className={styles.card} key={category.id}>
              {category.imageUrl ? (
                <img className={styles.image} src={category.imageUrl} alt="" />
              ) : category.slug === canonicalSchoolCategorySlug || category.slug === duplicateSchoolCategorySlug ? (
                <img className={styles.image} src={canonicalSchoolCategoryImage} alt="" />
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
              <div className={styles.details}>
                <h2>{category.translations.find((item) => item.locale === 'ru')?.name ?? category.slug}</h2>
                <p>{category.translations.find((item) => item.locale === 'ky')?.name ?? 'Котормосу жок'}</p>
                <small>
                  {category.slug} · {category._count?.products ?? 0} товаров · порядок {category.sortOrder} ·{' '}
                  {category.isActive ? 'Активна' : 'Неактивна'}
                </small>
              </div>
              <div className={styles.actionButtons}>
                {isSuperAdmin && category.slug === duplicateSchoolCategorySlug && (() => {
                  const target = categories.data.data.find((item) => item.slug === canonicalSchoolCategorySlug);
                  const canMerge = Boolean(target) && (category._count?.children ?? 0) === 0;
                  return (
                    <button
                      className={styles.secondaryButton}
                      disabled={!canMerge || mergeSchoolCategories.isPending}
                      onClick={() => {
                        if (!target || !canMerge) return;
                        const sourceCount = category._count?.products ?? 0;
                        const targetCount = target._count?.products ?? 0;
                        if (!window.confirm(`Перенести ${sourceCount} товаров из «Школьные принадлежности» в «Школа и канцелярия» и удалить дублирующую категорию? После операции в основной категории будет ${sourceCount + targetCount} товаров. Данные товаров сохранятся.`)) return;
                        setSuccessMessage('');
                        setErrorMessage('');
                        mergeSchoolCategories.mutate({ source: category, target });
                      }}
                    >
                      {mergeSchoolCategories.isPending ? 'Объединение…' : 'Объединить категории'}
                    </button>
                  );
                })()}
                <Link
                  className={styles.iconButton}
                  to={`/admin/products?categoryId=${encodeURIComponent(category.id)}`}
                  title="Товары категории"
                  aria-label={`Товары категории ${category.translations.find((item) => item.locale === 'ru')?.name ?? category.slug}`}
                >
                  <Icon name="inventory_2" size={20} />
                </Link>
                <button
                  className={styles.iconButton}
                  onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                  title="Редактировать"
                >
                  <Icon name="edit" size={20} />
                </button>
                {isSuperAdmin && (
                  <button
                    className={styles.iconButtonDelete}
                    onClick={async () => {
                      if (!window.confirm(`Удалить категорию «${category.translations.find((item) => item.locale === 'ru')?.name ?? category.slug}»?`))
                        return;
                      try {
                        await apiClient.delete(`/categories/${category.id}`);
                        await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
                        await queryClient.invalidateQueries({ queryKey: ['categories'] });
                      } catch (error) {
                        setErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить категорию');
                      }
                    }}
                    title="Удалить"
                  >
                    <Icon name="delete" size={20} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>Категорий пока нет.</p>
      ))}
    </div>
  );
}
