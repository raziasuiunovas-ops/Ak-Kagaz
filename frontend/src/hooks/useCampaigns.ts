import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Campaign } from '@/types';

interface UseCampaignsParams {
  locale?: string;
  type?: string;
  isActive?: boolean;
}

export function useCampaigns(params: UseCampaignsParams = {}) {
  const { locale = 'ru', type, isActive } = params;

  return useQuery<Campaign[]>({
    queryKey: ['campaigns', { locale, type, isActive }],
    queryFn: () =>
      apiClient.get<Campaign[]>('/campaigns', {
        params: {
          locale,
          ...(type && { type }),
          ...(isActive !== undefined && { isActive }),
        },
      }),
  });
}

export function useActiveCampaigns(locale: string = 'ru') {
  return useQuery<Campaign[]>({
    queryKey: ['campaigns', 'active', locale],
    queryFn: () =>
      apiClient.get<Campaign[]>('/campaigns/active', {
        params: { locale },
      }),
  });
}

export function useCampaign(id: string, locale: string = 'ru') {
  return useQuery<Campaign>({
    queryKey: ['campaign', id, locale],
    queryFn: () =>
      apiClient.get<Campaign>(`/campaigns/id/${id}`, {
        params: { locale },
      }),
    enabled: !!id,
  });
}

export function useCampaignBySlug(slug: string, locale: string = 'ru') {
  return useQuery<Campaign>({
    queryKey: ['campaign', 'slug', slug, locale],
    queryFn: () =>
      apiClient.get<Campaign>(`/campaigns/slug/${slug}`, {
        params: { locale },
      }),
    enabled: !!slug,
  });
}

export function useProductCampaigns(productId: string, locale: string = 'ru') {
  return useQuery<Campaign[]>({
    queryKey: ['campaigns', 'product', productId, locale],
    queryFn: () =>
      apiClient.get<Campaign[]>(`/campaigns/product/${productId}`, {
        params: { locale },
      }),
    enabled: !!productId,
  });
}
