import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Category, ProductAttribute, ProductStatus } from '@/types';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icon';
import { Select, SelectOption } from '@/components/Select';
import { ImageUpload } from '@/components/ImageUpload';
import styles from './ProductForm.module.css';

type ProductDraft = {
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
  image: string;
  extraImages: string;
  variants: string;
  attributeValues: Record<string, string>;
};

const emptyDraft: ProductDraft = {
  sku: '', slug: '', categoryId: '', status: 'INACTIVE', isFeatured: false,
  ruName: '', kyName: '', ruDescription: '', kyDescription: '', ruShort: '', kyShort: '',
  image: '', extraImages: '', variants: '', attributeValues: {},
};

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const statusOptions: SelectOption[] = [
  { value: 'INACTIVE', label: 'Не опубликован' },
  { value: 'ACTIVE', label: 'Опубликован' },
  { value: 'OUT_OF_STOCK', label: 'Нет в наличии' },
  { value: 'DISCONTINUED', label: 'Снят с продажи' },
];

export function ProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => apiClient.get<{ data: Category[] }>('/categories', { params: { page: 1, limit: 100 } }),
  });

  const attributes = useQuery({
    queryKey: ['admin', 'product-attributes'],
    queryFn: () => apiClient.get<ProductAttribute[]>('/products/attributes'),
  });

  const saveProduct = useMutation({
    mutationFn: (value: ProductDraft) => {
      const variants = value.variants.split('\n').map((line) => line.trim()).filter(Boolean)
        .map((line, index) => {
          const [name, sku, imageUrl] = line.split('|').map((part) => part.trim());
          return { name, sku, imageUrl: imageUrl || undefined, sortOrder: index, isActive: true };
        });
      const images = [value.image, ...value.extraImages.split('\n').map((line) => line.trim())].filter(Boolean)
        .map((url, sortOrder) => ({ url, altText: sortOrder === 0 ? value.ruName : undefined, sortOrder }));
      const payload = {
        sku: value.sku.trim().toUpperCase(),
        slug: value.slug.trim().toLowerCase(),
        categoryId: value.categoryId,
        status: value.status,
        isFeatured: value.isFeatured,
        hasVariants: variants.length > 0,
        thumbnailUrl: value.image.trim() || undefined,
        translations: [
          { locale: 'ru', name: value.ruName.trim(), description: value.ruDescription.trim() || undefined, shortDescription: value.ruShort.trim() || undefined },
          { locale: 'ky', name: value.kyName.trim(), description: value.kyDescription.trim() || undefined, shortDescription: value.kyShort.trim() || undefined },
        ],
        images, variants,
        attributes: Object.entries(value.attributeValues).filter(([, val]) => val.trim()).map(([attributeId, val]) => ({ attributeId, value: val.trim() })),
      };
      return apiClient.post('/products', payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ]);
      navigate('/admin/products');
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (wordCount(draft.ruDescription) < 40 || wordCount(draft.ruDescription) > 80 ||
        wordCount(draft.kyDescription) < 40 || wordCount(draft.kyDescription) > 80) {
      setErrorMessage('Описания должны содержать 40–80 слов каждое.');
      return;
    }
    if (wordCount(draft.ruShort) < 10 || wordCount(draft.ruShort) > 20 ||
        wordCount(draft.kyShort) < 10 || wordCount(draft.kyShort) > 20) {
      setErrorMessage('Краткие описания должны содержать 10–20 слов каждое.');
      return;
    }
    saveProduct.mutate(draft);
  };

  const change = (field: keyof ProductDraft, value: string | boolean) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'Выберите категорию' },
    ...(categories.data?.data.map((cat) => ({
      value: cat.id,
      label: cat.translations.find((t) => t.locale === 'ru')?.name ?? cat.slug,
    })) ?? []),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton fallback="/admin/products" />
        <h1 className={styles.title}>Новый товар</h1>
      </div>

      {errorMessage && <div className={styles.errorBanner}><Icon name="error" size={20} /><span>{errorMessage}</span></div>}

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>SKU <span className={styles.required}>*</span></span>
              <input required pattern="[A-Za-z0-9_-]+" value={draft.sku} onChange={(e) => change('sku', e.target.value)} placeholder="PRODUCT-001" />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Slug <span className={styles.required}>*</span></span>
              <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={draft.slug} onChange={(e) => change('slug', e.target.value)} placeholder="product-slug" />
            </label>

            <div className={styles.field}>
              <span className={styles.label}>Категория <span className={styles.required}>*</span></span>
              <Select value={draft.categoryId} onChange={(value) => change('categoryId', value)} options={categoryOptions} required />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Статус</span>
              <Select value={draft.status} onChange={(value) => change('status', value as ProductStatus)} options={statusOptions} />
            </div>

            <label className={styles.checkboxField}>
              <input type="checkbox" checked={draft.isFeatured} onChange={(e) => change('isFeatured', e.target.checked)} />
              <span>Показывать в «Популярные товары»</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Изображение</h2>
          <ImageUpload label="Основное изображение" value={draft.image} onChange={(url) => change('image', url)} required />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Названия</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Название (русский) <span className={styles.required}>*</span></span>
              <input required maxLength={200} value={draft.ruName} onChange={(e) => change('ruName', e.target.value)} />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Название (кыргызский) <span className={styles.required}>*</span></span>
              <input required maxLength={200} value={draft.kyName} onChange={(e) => change('kyName', e.target.value)} />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Описание (русский, 40–80 слов) <span className={styles.required}>*</span></span>
              <textarea required value={draft.ruDescription} onChange={(e) => change('ruDescription', e.target.value)} rows={4} />
              <span className={styles.hint}>Слов: {wordCount(draft.ruDescription)}</span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Описание (кыргызский, 40–80 слов) <span className={styles.required}>*</span></span>
              <textarea required value={draft.kyDescription} onChange={(e) => change('kyDescription', e.target.value)} rows={4} />
              <span className={styles.hint}>Слов: {wordCount(draft.kyDescription)}</span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Кратко (русский, 10–20 слов) <span className={styles.required}>*</span></span>
              <textarea required maxLength={300} value={draft.ruShort} onChange={(e) => change('ruShort', e.target.value)} rows={2} />
              <span className={styles.hint}>Слов: {wordCount(draft.ruShort)}</span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Кратко (кыргызский, 10–20 слов) <span className={styles.required}>*</span></span>
              <textarea required maxLength={300} value={draft.kyShort} onChange={(e) => change('kyShort', e.target.value)} rows={2} />
              <span className={styles.hint}>Слов: {wordCount(draft.kyShort)}</span>
            </label>
          </div>
        </div>

        {attributes.data && attributes.data.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Характеристики</h2>
            <div className={styles.formGrid}>
              {attributes.data.map((attr) => (
                <label key={attr.id} className={styles.field}>
                  <span className={styles.label}>{attr.displayNameRu}</span>
                  <input
                    value={draft.attributeValues[attr.id] ?? ''}
                    onChange={(e) => setDraft({ ...draft, attributeValues: { ...draft.attributeValues, [attr.id]: e.target.value } })}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={styles.note}>
          <Icon name="info" size={20} />
          <div>
            <strong>Важно:</strong> Цена и складской остаток задаются отдельно после создания товара.
            Не публикуйте карточку до внесения проверенных данных.
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate('/admin/products')}>Отмена</button>
          <button type="submit" className={styles.primaryButton} disabled={saveProduct.isPending}>
            {saveProduct.isPending ? 'Сохранение...' : 'Создать товар'}
          </button>
        </div>
      </form>
    </div>
  );
}
