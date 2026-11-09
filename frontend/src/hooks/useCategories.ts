import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Category, PaginatedResponse } from '@/types';

interface UseCategoriesParams {
  page?: number;
  limit?: number;
  locale?: string;
  parentId?: string;
  isActive?: boolean;
}

export function useCategories(params: UseCategoriesParams = {}) {
  const { page = 1, limit = 50, locale = 'ru', parentId, isActive } = params;

  return useQuery<PaginatedResponse<Category>>({
    queryKey: ['categories', { page, limit, locale, parentId, isActive }],
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    queryFn: () =>
      apiClient.get<PaginatedResponse<Category>>('/categories', {
        params: {
          page,
          limit,
          locale,
          ...(parentId !== undefined && { parentId }),
          ...(isActive !== undefined && { isActive }),
        },
      }),
  });
}

export function useCategoriesTree(locale: string = 'ru', isActive?: boolean) {
  return useQuery<Category[]>({
    queryKey: ['categories', 'tree', { locale, isActive }],
    queryFn: () =>
      apiClient.get<Category[]>('/categories/tree', {
        params: {
          locale,
          ...(isActive !== undefined && { isActive }),
        },
      }),
  });
}

export function useCategory(id: string, locale: string = 'ru') {
  return useQuery<Category>({
    queryKey: ['category', id, locale],
    queryFn: () =>
      apiClient.get<Category>(`/categories/id/${id}`, {
        params: { locale },
      }),
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string, locale: string = 'ru') {
  return useQuery<Category>({
    queryKey: ['category', 'slug', slug, locale],
    queryFn: () =>
      apiClient.get<Category>(`/categories/slug/${slug}`, {
        params: { locale },
      }),
    enabled: !!slug,
  });
}
