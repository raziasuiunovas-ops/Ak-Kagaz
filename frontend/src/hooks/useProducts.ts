import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Product, PaginatedResponse } from '@/types';

interface UseProductsParams {
  page?: number;
  limit?: number;
  locale?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  search?: string;
}

export function useProducts(params: UseProductsParams = {}) {
  const {
    page = 1,
    limit = 20,
    locale = 'ru',
    categoryId,
    brandId,
    status,
    search,
  } = params;

  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', { page, limit, locale, categoryId, brandId, status, search }],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Product>>('/products', {
        params: {
          page,
          limit,
          locale,
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
          ...(status && { status }),
          ...(search && { search }),
        },
      }),
  });
}

export function useProduct(id: string, locale: string = 'ru') {
  return useQuery<Product>({
    queryKey: ['product', id, locale],
    queryFn: () =>
      apiClient.get<Product>(`/products/id/${id}`, {
        params: { locale },
      }),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string, locale: string = 'ru') {
  return useQuery<Product>({
    queryKey: ['product', 'slug', slug, locale],
    queryFn: () =>
      apiClient.get<Product>(`/products/slug/${slug}`, {
        params: { locale },
      }),
    enabled: !!slug,
  });
}

export function useProductBySku(sku: string) {
  return useQuery<Product>({
    queryKey: ['product', 'sku', sku],
    queryFn: () => apiClient.get<Product>(`/products/sku/${sku}`),
    enabled: !!sku,
  });
}
