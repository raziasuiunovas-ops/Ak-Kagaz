import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Bundle } from '@/types';

interface UseBundlesParams {
  locale?: string;
  type?: string;
  isActive?: boolean;
}

export function useBundles(params: UseBundlesParams = {}) {
  const { locale = 'ru', type, isActive } = params;

  return useQuery<Bundle[]>({
    queryKey: ['bundles', { locale, type, isActive }],
    queryFn: () =>
      apiClient.get<Bundle[]>('/bundles', {
        params: {
          locale,
          ...(type && { type }),
          ...(isActive !== undefined && { isActive }),
        },
      }),
  });
}

export function useBundle(id: string, locale: string = 'ru') {
  return useQuery<Bundle>({
    queryKey: ['bundle', id, locale],
    queryFn: () =>
      apiClient.get<Bundle>(`/bundles/id/${id}`, {
        params: { locale },
      }),
    enabled: !!id,
  });
}

export function useBundleBySlug(slug: string, locale: string = 'ru') {
  return useQuery<Bundle>({
    queryKey: ['bundle', 'slug', slug, locale],
    queryFn: () =>
      apiClient.get<Bundle>(`/bundles/slug/${slug}`, {
        params: { locale },
      }),
    enabled: !!slug,
  });
}

export function useAddBundleToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bundleId: string; customQuantities?: Record<string, number> }) => {
      const { bundleId, customQuantities } = data;
      
      // Add all bundle items to cart
      return apiClient.post('/cart/bundle', {
        bundleId,
        customQuantities,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
