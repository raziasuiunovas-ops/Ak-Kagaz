import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useCurrentUser } from '@/hooks';
import type { Category } from '@/types';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import styles from './CategoriesPage.module.css';

type CategoryDraft = { id?: string; slug: string; ruName: string; kyName: string; ruDescription: string; kyDescription: string; imageUrl: string; sortOrder: string; isActive: boolean };
const blank: CategoryDraft = { slug: '', ruName: '', kyName: '', ruDescription: '', kyDescription: '', imageUrl: '', sortOrder: '0', isActive: true };

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.userRoles?.some((entry: { role: { name: string } }) => entry.role.name === 'SUPER_ADMIN') ?? false;
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => apiClient.get<{ data: Category[] }>('/categories', { params: { page: 1, limit: 100 } }),
  });
  const saveCategory = useMutation({
    mutationFn: (value: CategoryDraft) => {
      const payload = {
        slug: value.slug.trim().toLowerCase(), imageUrl: value.imageUrl.trim() || (value.id ? null : undefined),
        sortOrder: Number(value.sortOrder), isActive: value.isActive,
        translations: [
          { locale: 'ru', name: value.ruName.trim(), description: value.ruDescription.trim() || undefined },
          { locale: 'ky', name: value.kyName.trim(), description: value.kyDescription.trim() || undefined },
        ],
      };
      return value.id ? apiClient.put(`/categories/${value.id}`, payload) : apiClient.post('/categories', payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['category'] }),
      ]);
      setDraft(null); setErrorMessage('');
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });
  const beginEdit = (category: Category) => {
    const ru = category.translations.find((translation) => translation.locale === 'ru');
    const ky = category.translations.find((translation) => translation.locale === 'ky');
    setDraft({ id: category.id, slug: category.slug, ruName: ru?.name ?? '', kyName: ky?.name ?? '', ruDescription: ru?.description ?? '', kyDescription: ky?.description ?? '', imageUrl: category.imageUrl ?? '', sortOrder: String(category.sortOrder), isActive: category.isActive });
  };
  const change = (field: keyof CategoryDraft, value: string | boolean) => setDraft((current) => current ? { ...current, [field]: value } : current);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (draft) saveCategory.mutate(draft); };

  // Calculate statistics
  const totalCategories = categories.data?.data.length ?? 0;
  const activeCategories = categories.data?.data.filter(c => c.isActive).length ?? 0;
  const totalProducts = categories.data?.data.reduce((sum, c) => sum + (c._count?.products ?? 0), 0) ?? 0;

  return <div className={styles.page}>
    <div className={styles.heading}><div><h1 className={styles.title}>Категории</h1><p className={styles.muted}>Переводы, изображение и порядок отображения синхронизируются с публичным каталогом.</p></div><button className={styles.primaryButton} onClick={() => setDraft({ ...blank })}>Добавить категорию</button></div>
    
    {/* Statistics Cards */}
    <div className={styles.statsGrid}>
      <StatCard title="Всего категорий" value={totalCategories} icon="folder_open" color="blue" />
      <StatCard title="Активных" value={activeCategories} icon="check_circle" color="green" />
      <StatCard title="Товаров" value={totalProducts} icon="inventory_2" color="orange" />
    </div>
    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    {categories.isLoading && <p>Загрузка категорий…</p>}
    {categories.error && <p className={styles.error}>{categories.error.message}</p>}
    {!categories.isLoading && !categories.error && (categories.data?.data.length ? <div className={styles.list}>{categories.data.data.map((category) => <article className={styles.card} key={category.id}>
      {category.imageUrl ? <img className={styles.image} src={category.imageUrl} alt="" /> : <div className={styles.imagePlaceholder} />}
      <div className={styles.details}><h2>{category.translations.find((item) => item.locale === 'ru')?.name ?? category.slug}</h2><p>{category.translations.find((item) => item.locale === 'ky')?.name ?? 'Котормосу жок'}</p><small>{category.slug} · {category._count?.products ?? 0} товаров · порядок {category.sortOrder} · {category.isActive ? 'Активна' : 'Неактивна'}</small></div>
      <div className={styles.actionButtons}>
        <button className={styles.iconButton} onClick={() => beginEdit(category)} title="Редактировать"><Icon name="edit" size={20} /></button>
        {isSuperAdmin && <button className={styles.iconButtonDelete} onClick={async () => { if (!window.confirm(`Удалить категорию «${category.translations.find((item) => item.locale === 'ru')?.name ?? category.slug}»?`)) return; try { await apiClient.delete(`/categories/${category.id}`); await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }); await queryClient.invalidateQueries({ queryKey: ['categories'] }); } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить категорию'); } }} title="Удалить"><Icon name="delete" size={20} /></button>}
      </div>
    </article>)}</div> : <p className={styles.muted}>Категорий пока нет.</p>)}
    {draft && <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null); }}><form className={styles.dialog} onSubmit={submit}>
      <div className={styles.dialogHeader}><h2>{draft.id ? 'Редактировать категорию' : 'Новая категория'}</h2><button type="button" className={styles.textButton} onClick={() => setDraft(null)}>Закрыть</button></div>
      <div className={styles.formGrid}>
        <label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={draft.slug} onChange={(event) => change('slug', event.target.value)} /></label>
        <label>Порядок отображения<input required type="number" min="0" value={draft.sortOrder} onChange={(event) => change('sortOrder', event.target.value)} /></label>
        <label>Название (русский)<input required maxLength={100} value={draft.ruName} onChange={(event) => change('ruName', event.target.value)} /></label>
        <label>Название (кыргызский)<input required maxLength={100} value={draft.kyName} onChange={(event) => change('kyName', event.target.value)} /></label>
        <label>Описание (русский)<textarea value={draft.ruDescription} onChange={(event) => change('ruDescription', event.target.value)} /></label>
        <label>Описание (кыргызский)<textarea value={draft.kyDescription} onChange={(event) => change('kyDescription', event.target.value)} /></label>
        <label className={styles.fullWidth}>Изображение<input placeholder="/products/файл.png" value={draft.imageUrl} onChange={(event) => change('imageUrl', event.target.value)} /></label>
        <label className={styles.check}><input type="checkbox" checked={draft.isActive} onChange={(event) => change('isActive', event.target.checked)} /> Активна</label>
      </div>
      <div className={styles.actions}><button type="button" className={styles.secondaryButton} onClick={() => setDraft(null)}>Отмена</button><button className={styles.primaryButton} disabled={saveCategory.isPending}>{saveCategory.isPending ? 'Сохранение…' : 'Сохранить'}</button></div>
    </form></div>}
  </div>;
}
