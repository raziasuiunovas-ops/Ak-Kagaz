import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useCurrentUser } from '@/hooks';
import type { Category } from '@/types';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import styles from './CategoriesPage.module.css';

export function CategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.userRoles?.some((entry: { role: { name: string } }) => entry.role.name === 'SUPER_ADMIN') ?? false;
  const [errorMessage, setErrorMessage] = useState('');

  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => apiClient.get<{ data: Category[] }>('/categories', { params: { page: 1, limit: 100 } }),
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
      {categories.isLoading && <p>Загрузка категорий…</p>}
      {categories.error && <p className={styles.error}>{categories.error.message}</p>}
      
      {!categories.isLoading && !categories.error && (categories.data?.data.length ? (
        <div className={styles.list}>
          {categories.data.data.map((category) => (
            <article className={styles.card} key={category.id}>
              {category.imageUrl ? (
                <img className={styles.image} src={category.imageUrl} alt="" />
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
