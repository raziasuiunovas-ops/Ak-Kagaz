import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Category, Product, ProductAttribute, ProductStatus } from '@/types';
import { useCurrentUser } from '@/hooks';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import styles from './ProductsPage.module.css';

type ProductDraft = {
  id?: string;
  sku: string;
  slug: string;
  categoryId: string;
  status: ProductStatus;
  isFeatured: boolean;
  ruName: string;
  kyName: string;
  ruDescription: string;
  kyDescription: string;
  ruShort: string;
  kyShort: string;
  ruMetaTitle: string;
  kyMetaTitle: string;
  ruMetaDescription: string;
  kyMetaDescription: string;
  image: string;
  extraImages: string;
  variants: string;
  attributeValues: Record<string, string>;
};
type PriceTier = { id: string; displayNameRu: string };
type PriceRecord = { id: string; productId: string; tierId: string; sellingPrice: number; purchasePrice: number | null; isActive: boolean; isEstimate: boolean; estimateBasis?: string };

const emptyDraft: ProductDraft = {
  sku: '', slug: '', categoryId: '', status: 'INACTIVE', isFeatured: false, ruName: '', kyName: '',
  ruDescription: '', kyDescription: '', ruShort: '', kyShort: '', ruMetaTitle: '', kyMetaTitle: '',
  ruMetaDescription: '', kyMetaDescription: '', image: '', extraImages: '', variants: '', attributeValues: {},
};
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.userRoles?.some((entry: { role: { name: string } }) => entry.role.name === 'SUPER_ADMIN') ?? false;
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [priceDraft, setPriceDraft] = useState<{ productId: string; tierId: string; sellingPrice: string; purchasePrice: string; estimateBasis: string; mode: 'estimate' | 'confirmed' } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const products = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => apiClient.get<{ data: Product[]; meta: { total: number } }>('/products/admin/list', { params: { page: 1, limit: 100 } }),
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
  const attributes = useQuery({
    queryKey: ['admin', 'product-attributes'],
    queryFn: () => apiClient.get<ProductAttribute[]>('/products/attributes'),
  });

  const saveProduct = useMutation({
    mutationFn: (value: ProductDraft) => {
      const variants = value.variants.split('\n').map((line) => line.trim()).filter(Boolean).map((line, index) => {
        const [name, sku, imageUrl] = line.split('|').map((part) => part.trim());
        return { name, sku, imageUrl: imageUrl || undefined, sortOrder: index, isActive: true };
      });
      const images = [value.image, ...value.extraImages.split('\n').map((line) => line.trim())].filter(Boolean)
        .map((url, sortOrder) => ({ url, altText: sortOrder === 0 ? value.ruName : undefined, sortOrder }));
      const payload = {
        sku: value.sku.trim().toUpperCase(), slug: value.slug.trim().toLowerCase(), categoryId: value.categoryId,
        status: value.status, isFeatured: value.isFeatured, hasVariants: variants.length > 0, thumbnailUrl: value.image.trim() || (value.id ? null : undefined),
        translations: [
          { locale: 'ru', name: value.ruName.trim(), description: value.ruDescription.trim() || undefined, shortDescription: value.ruShort.trim() || undefined, metaTitle: value.ruMetaTitle.trim() || undefined, metaDescription: value.ruMetaDescription.trim() || undefined },
          { locale: 'ky', name: value.kyName.trim(), description: value.kyDescription.trim() || undefined, shortDescription: value.kyShort.trim() || undefined, metaTitle: value.kyMetaTitle.trim() || undefined, metaDescription: value.kyMetaDescription.trim() || undefined },
        ],
        images, variants,
        attributes: Object.entries(value.attributeValues).filter(([, attributeValue]) => attributeValue.trim()).map(([attributeId, attributeValue]) => ({ attributeId, value: attributeValue.trim() })),
      };
      return value.id
        ? apiClient.put(`/products/${value.id}`, payload)
        : apiClient.post('/products', payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations', 'popular'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations', 'trending'] }),
      ]);
      setDraft(null);
      setErrorMessage('');
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });
  const saveEstimate = useMutation({
    mutationFn: async (value: { productId: string; tierId: string; sellingPrice: string; purchasePrice: string; estimateBasis: string; mode: 'estimate' | 'confirmed' }) => {
      const existing = prices.data?.data.find((price) => price.productId === value.productId && price.tierId === value.tierId);
      const estimate = value.mode === 'estimate'
        ? { sellingPrice: Number(value.sellingPrice), currency: 'KGS', isEstimate: true, isActive: false, estimateBasis: value.estimateBasis.trim() }
        : { sellingPrice: Number(value.sellingPrice), purchasePrice: Number(value.purchasePrice), currency: 'KGS', isEstimate: false, isActive: true, estimateBasis: null };
      return existing
        ? apiClient.put(`/pricing/prices/${existing.id}`, estimate)
        : apiClient.post('/pricing/prices', { ...estimate, productId: value.productId, tierId: value.tierId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'prices'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product'] });
      await queryClient.invalidateQueries({ queryKey: ['recommendations', 'popular'] });
      setPriceDraft(null); setErrorMessage('');
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });

  const beginEdit = (product: Product) => {
    const ru = product.translations.find((translation) => translation.locale === 'ru');
    const ky = product.translations.find((translation) => translation.locale === 'ky');
    setDraft({
      id: product.id, sku: product.sku, slug: product.slug, categoryId: product.categoryId,
      status: product.status, isFeatured: product.isFeatured, ruName: ru?.name ?? '', kyName: ky?.name ?? '',
      ruDescription: ru?.description ?? '', kyDescription: ky?.description ?? '',
      ruShort: ru?.shortDescription ?? '', kyShort: ky?.shortDescription ?? '',
      ruMetaTitle: ru?.metaTitle ?? '', kyMetaTitle: ky?.metaTitle ?? '',
      ruMetaDescription: ru?.metaDescription ?? '', kyMetaDescription: ky?.metaDescription ?? '',
      image: product.thumbnailUrl ?? '', extraImages: product.images.filter((image) => image.url !== product.thumbnailUrl).map((image) => image.url).join('\n'),
      variants: (product.variants ?? []).map((variant) => `${variant.name}|${variant.sku}|${variant.imageUrl ?? ''}`).join('\n'),
      attributeValues: Object.fromEntries((product.attributes ?? []).map((item) => [item.attributeId, item.value])),
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    if (wordCount(draft.ruDescription) < 40 || wordCount(draft.ruDescription) > 80 || wordCount(draft.kyDescription) < 40 || wordCount(draft.kyDescription) > 80) {
      setErrorMessage('Полные описания на русском и кыргызском должны содержать 40–80 слов каждое.');
      return;
    }
    if (wordCount(draft.ruShort) < 10 || wordCount(draft.ruShort) > 20 || wordCount(draft.kyShort) < 10 || wordCount(draft.kyShort) > 20) {
      setErrorMessage('Краткие описания на обоих языках должны содержать 10–20 слов каждое.');
      return;
    }
    saveProduct.mutate(draft);
  };

  const change = (field: keyof ProductDraft, value: string) => setDraft((current) => current ? { ...current, [field]: value } : current);
  const defaultTier = tiers.data?.data[0];

  // Calculate statistics
  const totalProducts = products.data?.data.length ?? 0;
  const activeProducts = products.data?.data.filter(p => p.status === 'ACTIVE').length ?? 0;
  const productsWithPrice = prices.data?.data.filter(p => p.isActive).length ?? 0;
  const featuredProducts = products.data?.data.filter(p => p.isFeatured).length ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div><h1 className={styles.title}>Товары</h1><p className={styles.muted}>Каталог из API. Новые карточки сохраняются неопубликованными, пока вы не укажете актуальную цену и остаток.</p></div>
        <button className={styles.primaryButton} onClick={() => setDraft({ ...emptyDraft })}>Добавить товар</button>
      </div>

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
            return <tr key={product.id}><td>{product.thumbnailUrl && <img className={styles.thumbnail} src={product.thumbnailUrl} alt="" />}</td><td>{translation?.name ?? product.slug}</td><td>{product.sku}</td><td>{categoryName}</td><td><span className={product.status === 'ACTIVE' ? styles.active : styles.inactive}>{product.status === 'ACTIVE' ? 'Опубликован' : product.status}</span></td><td>{price?.isEstimate ? <span className={styles.inactive}>{Number(price.sellingPrice).toLocaleString()} KGS</span> : price?.isActive ? `${Number(price.sellingPrice).toLocaleString()} KGS` : 'Не задана'}</td><td><div className={styles.actionButtons}><button className={styles.iconButton} onClick={() => beginEdit(product)} title="Редактировать"><Icon name="edit" size={20} /></button>{defaultTier && <button className={styles.iconButton} onClick={() => { const current = prices.data?.data.find((item) => item.productId === product.id); setPriceDraft({ productId: product.id, tierId: current?.tierId ?? defaultTier.id, sellingPrice: current ? String(current.sellingPrice) : '', purchasePrice: current?.purchasePrice === null || current?.purchasePrice === undefined ? '' : String(current.purchasePrice), estimateBasis: current?.estimateBasis ?? '', mode: current?.isEstimate === false ? 'confirmed' : 'estimate' }); }} title="Цена"><Icon name="payments" size={20} /></button>}{isSuperAdmin && <button className={styles.iconButtonDelete} onClick={async () => { if (!window.confirm(`Удалить «${translation?.name ?? product.sku}»?`)) return; try { await apiClient.delete(`/products/${product.id}`); await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }), queryClient.invalidateQueries({ queryKey: ['products'] }), queryClient.invalidateQueries({ queryKey: ['categories'] }), queryClient.invalidateQueries({ queryKey: ['recommendations', 'popular'] })]); } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить товар'); } }} title="Удалить"><Icon name="delete" size={20} /></button>}</div></td></tr>;
          })}
        </tbody></table></div>
      ) : <p className={styles.muted}>Товаров пока нет.</p>)}

      {draft && <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null); }}>
        <form className={styles.dialog} onSubmit={onSubmit}>
          <div className={styles.dialogHeader}><h2>{draft.id ? 'Редактировать товар' : 'Новый товар'}</h2><button type="button" className={styles.textButton} onClick={() => setDraft(null)}>Закрыть</button></div>
          <div className={styles.formGrid}>
            <label>SKU<input required pattern="[A-Za-z0-9_-]+" value={draft.sku} onChange={(event) => change('sku', event.target.value)} /></label>
            <label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={draft.slug} onChange={(event) => change('slug', event.target.value)} /></label>
            <label>Категория<select required value={draft.categoryId} onChange={(event) => change('categoryId', event.target.value)}><option value="">Выберите категорию</option>{categories.data?.data.map((category) => <option key={category.id} value={category.id}>{category.translations.find((item) => item.locale === 'ru')?.name ?? category.slug}</option>)}</select></label>
            <label>Статус<select value={draft.status} onChange={(event) => change('status', event.target.value)}><option value="INACTIVE">Не опубликован</option><option value="ACTIVE">Опубликован</option><option value="OUT_OF_STOCK">Нет в наличии</option><option value="DISCONTINUED">Снят с продажи</option></select></label>
            <label className={styles.fullWidth}><span><input type="checkbox" checked={draft.isFeatured} onChange={(event) => setDraft({ ...draft, isFeatured: event.target.checked })} /> Показывать в подборке «Популярные товары»</span></label>
            <label>Название (русский)<input required maxLength={200} value={draft.ruName} onChange={(event) => change('ruName', event.target.value)} /></label>
            <label>Название (кыргызский)<input required maxLength={200} value={draft.kyName} onChange={(event) => change('kyName', event.target.value)} /></label>
            <label>Описание (русский, 40–80 слов)<textarea required value={draft.ruDescription} onChange={(event) => change('ruDescription', event.target.value)} /></label>
            <label>Описание (кыргызский, 40–80 слов)<textarea required value={draft.kyDescription} onChange={(event) => change('kyDescription', event.target.value)} /></label>
            <label>Кратко для карточки (русский, 10–20 слов)<textarea required maxLength={300} value={draft.ruShort} onChange={(event) => change('ruShort', event.target.value)} /></label>
            <label>Кыскача маалымат (кыргызча, 10–20 сөз)<textarea required maxLength={300} value={draft.kyShort} onChange={(event) => change('kyShort', event.target.value)} /></label>
            <label>SEO title RU<input maxLength={200} value={draft.ruMetaTitle} onChange={(event) => change('ruMetaTitle', event.target.value)} /></label>
            <label>SEO title KY<input maxLength={200} value={draft.kyMetaTitle} onChange={(event) => change('kyMetaTitle', event.target.value)} /></label>
            <label>SEO description RU<textarea maxLength={500} value={draft.ruMetaDescription} onChange={(event) => change('ruMetaDescription', event.target.value)} /></label>
            <label>SEO description KY<textarea maxLength={500} value={draft.kyMetaDescription} onChange={(event) => change('kyMetaDescription', event.target.value)} /></label>
            <label>Основное изображение<input required placeholder="/products/файл.png" value={draft.image} onChange={(event) => change('image', event.target.value)} /></label>
            <label>Дополнительные изображения<textarea placeholder="По одному пути на строку" value={draft.extraImages} onChange={(event) => change('extraImages', event.target.value)} /></label>
            <label className={styles.fullWidth}>Варианты<textarea placeholder={'По одному на строку: название|SKU|/products/фото.png'} value={draft.variants} onChange={(event) => change('variants', event.target.value)} /></label>
            {attributes.data?.map((attribute) => <label key={attribute.id}>{attribute.displayNameRu}<input value={draft.attributeValues[attribute.id] ?? ''} onChange={(event) => setDraft({ ...draft, attributeValues: { ...draft.attributeValues, [attribute.id]: event.target.value } })} /></label>)}
          </div>
          <p className={styles.note}>Цена и складской остаток здесь не заполняются. Не публикуйте карточку до внесения проверенных данных в разделы цен и склада.</p>
          <div className={styles.actions}><button type="button" className={styles.secondaryButton} onClick={() => setDraft(null)}>Отмена</button><button className={styles.primaryButton} disabled={saveProduct.isPending}>{saveProduct.isPending ? 'Сохранение…' : 'Сохранить'}</button></div>
        </form>
      </div>}
      {priceDraft && <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPriceDraft(null); }}><form className={styles.dialog} onSubmit={(event) => { event.preventDefault(); saveEstimate.mutate(priceDraft); }}>
        <div className={styles.dialogHeader}><h2>{priceDraft.mode === 'estimate' ? 'Предварительная оценка' : 'Подтвердить цену'}</h2><button type="button" className={styles.textButton} onClick={() => setPriceDraft(null)}>Закрыть</button></div>
        <div className={styles.formGrid}>
          <label>Ценовой уровень<select required value={priceDraft.tierId} onChange={(event) => setPriceDraft({ ...priceDraft, tierId: event.target.value })}>{tiers.data?.data.map((tier) => <option key={tier.id} value={tier.id}>{tier.displayNameRu}</option>)}</select></label>
          <label>{priceDraft.mode === 'estimate' ? 'Оценка цены (KGS)' : 'Утверждённая цена (KGS)'}<input required type="number" min="1" step="1" value={priceDraft.sellingPrice} onChange={(event) => setPriceDraft({ ...priceDraft, sellingPrice: event.target.value })} /></label>
          <label className={styles.fullWidth}>Режим цены<select value={priceDraft.mode} onChange={(event) => setPriceDraft({ ...priceDraft, mode: event.target.value as 'estimate' | 'confirmed' })}><option value="estimate">Предварительная оценка</option><option value="confirmed">Утверждённая цена</option></select></label>
          {priceDraft.mode === 'estimate' ? <label className={styles.fullWidth}>Основание оценки<textarea required maxLength={1000} value={priceDraft.estimateBasis} onChange={(event) => setPriceDraft({ ...priceDraft, estimateBasis: event.target.value })} /></label> : <label>Подтверждённая закупочная цена (KGS)<input required type="number" min="0" step="0.01" value={priceDraft.purchasePrice} onChange={(event) => setPriceDraft({ ...priceDraft, purchasePrice: event.target.value })} /></label>}
        </div>
        <p className={styles.note}>{priceDraft.mode === 'estimate' ? 'Оценка сохранится как неактивная и не будет видна покупателям.' : 'Утверждённая цена станет активной и будет показана покупателям. Введите проверенную закупочную стоимость.'}</p>
        <div className={styles.actions}><button type="button" className={styles.secondaryButton} onClick={() => setPriceDraft(null)}>Отмена</button><button className={styles.primaryButton} disabled={saveEstimate.isPending}>{saveEstimate.isPending ? 'Сохранение…' : priceDraft.mode === 'estimate' ? 'Сохранить оценку' : 'Подтвердить цену'}</button></div>
      </form></div>}
    </div>
  );
}
