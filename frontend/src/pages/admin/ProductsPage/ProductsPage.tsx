import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Category, Product } from '@/types';
import { useCurrentUser } from '@/hooks';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import styles from './ProductsPage.module.css';

type PriceTier = { id: string; displayNameRu: string };
type PriceRecord = { id: string; productId: string; tierId: string; sellingPrice: number; purchasePrice: number | null; isActive: boolean; isEstimate: boolean; estimateBasis?: string };

export function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('categoryId') || undefined;
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.userRoles?.some((entry: { role: { name: string } }) => entry.role.name === 'SUPER_ADMIN') ?? false;
  const [errorMessage, setErrorMessage] = useState('');
  const products = useQuery({
    queryKey: ['admin', 'products', categoryFilter],
    queryFn: () => apiClient.get<{ data: Product[]; meta: { total: number } }>('/products/admin/list', { params: { page: 1, limit: 100, ...(categoryFilter && { categoryId: categoryFilter }) } }),
  });
  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => apiClient.get<{ data: Category[] }>('/categories', { params: { page: 1, limit: 100 } }),
  });
  const tiers = useQuery({
    queryKey: ['admin', 'price-tiers'],
    queryFn: () => apiClient.get<{ data: PriceTier[] }>('/pricing/tiers', { params: { page: 1, limit: 100, isActive: true } }),
  });
  const prices = useQuery({
    queryKey: ['admin', 'prices'],
    queryFn: () => apiClient.get<{ data: PriceRecord[] }>('/pricing/prices', { params: { page: 1, limit: 100 } }),
  });

  // Calculate statistics
  const totalProducts = products.data?.data.length ?? 0;
  const activeProducts = products.data?.data.filter(p => p.status === 'ACTIVE').length ?? 0;
  const productsWithPrice = prices.data?.data.filter(p => p.isActive).length ?? 0;
  const featuredProducts = products.data?.data.filter(p => p.isFeatured).length ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div><h1 className={styles.title}>Товары</h1><p className={styles.muted}>Управление каталогом товаров. Для публикации товара обязательно укажите цену и остаток на складе.</p></div>
        <button className={styles.primaryButton} onClick={() => navigate('/admin/products/create')}>Добавить товар</button>
      </div>

      {categoryFilter && <p className={styles.muted}>Фильтр по категории: {categories.data?.data.find((category) => category.id === categoryFilter)?.translations.find((translation) => translation.locale === 'ru')?.name ?? categoryFilter}. <Link className={styles.textButton} to="/admin/products">Показать все товары</Link></p>}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Всего товаров" value={totalProducts} icon="inventory_2" color="blue" />
        <StatCard title="Активных" value={activeProducts} icon="check_circle" color="green" />
        <StatCard title="С ценой" value={productsWithPrice} icon="payments" color="orange" />
        <StatCard title="Популярные" value={featuredProducts} icon="star" color="orange" />
      </div>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      {products.isLoading && <p>Загрузка товаров…</p>}
      {products.error && <p className={styles.error}>{products.error.message}</p>}
      {!products.isLoading && !products.error && (products.data?.data.length ? (
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Фото</th><th>Название</th><th>SKU</th><th>Категория</th><th>Статус</th><th>Цена</th><th></th></tr></thead><tbody>
          {products.data.data.map((product) => {
            const translation = product.translations.find((item) => item.locale === 'ru') ?? product.translations[0];
            const category = categories.data?.data.find((item) => item.id === product.categoryId);
            const categoryName = category?.translations.find((item) => item.locale === 'ru')?.name ?? '—';
            const price = prices.data?.data.find((item) => item.productId === product.id);
            return <tr key={product.id}><td>{product.thumbnailUrl && <img className={styles.thumbnail} src={product.thumbnailUrl} alt="" />}</td><td>{translation?.name ?? product.slug}</td><td>{product.sku}</td><td>{categoryName}</td><td><span className={product.status === 'ACTIVE' ? styles.active : styles.inactive}>{product.status === 'ACTIVE' ? 'Опубликован' : product.status}</span></td><td>{price?.isEstimate ? <span className={styles.inactive}>{Number(price.sellingPrice).toLocaleString()} KGS</span> : price?.isActive ? `${Number(price.sellingPrice).toLocaleString()} KGS` : 'Не задана'}</td><td><div className={styles.actionButtons}><button className={styles.iconButton} onClick={() => navigate(`/admin/products/${product.id}/edit`)} title="Редактировать"><Icon name="edit" size={20} /></button>{isSuperAdmin && <button className={styles.iconButtonDelete} onClick={async () => { if (!window.confirm(`Удалить «${translation?.name ?? product.sku}»?`)) return; try { await apiClient.delete(`/products/${product.id}`); await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }), queryClient.invalidateQueries({ queryKey: ['products'] }), queryClient.invalidateQueries({ queryKey: ['categories'] }), queryClient.invalidateQueries({ queryKey: ['recommendations', 'popular'] })]); } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить товар'); } }} title="Удалить"><Icon name="delete" size={20} /></button>}</div></td></tr>;
          })}
        </tbody></table></div>
      ) : <p className={styles.muted}>Товаров пока нет.</p>)}
    </div>
  );
}
