import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Product, TrackViewData } from '@/types';

interface RecommendationParams {
  limit?: number;
  locale?: string;
  sessionId?: string;
}

export function usePersonalRecommendations(params: RecommendationParams = {}) {
  const { limit = 10, locale = 'ru' } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'personal', { limit, locale }],
    queryFn: () =>
      apiClient.get<Product[]>('/recommendations/for-you', {
        params: { limit, locale },
      }),
  });
}

export function useGuestRecommendations(params: RecommendationParams = {}) {
  const { limit = 10, locale = 'ru', sessionId } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'guest', { limit, locale, sessionId }],
    queryFn: () =>
      apiClient.get<Product[]>('/recommendations/for-guest', {
        params: { 
          limit, 
          locale, 
          ...(sessionId && { sessionId })
        },
      }),
    enabled: !!sessionId,
  });
}

export function useFrequentlyBought(productId: string, params: RecommendationParams = {}) {
  const { limit = 4, locale = 'ru' } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'fbt', productId, { limit, locale }],
    queryFn: () =>
      apiClient.get<Product[]>(`/recommendations/frequently-bought/${productId}`, {
        params: { limit, locale },
      }),
    enabled: !!productId,
  });
}

export function useSimilarProducts(productId: string, params: RecommendationParams = {}) {
  const { limit = 6, locale = 'ru' } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'similar', productId, { limit, locale }],
    queryFn: () =>
      apiClient.get<Product[]>(`/recommendations/similar/${productId}`, {
        params: { limit, locale },
      }),
    enabled: !!productId,
  });
}

export function useRecentlyViewed(params: RecommendationParams = {}) {
  const { limit = 8, locale = 'ru', sessionId } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'recent', { limit, locale, sessionId }],
    queryFn: () =>
      apiClient.get<Product[]>('/recommendations/recently-viewed', {
        params: { 
          limit, 
          locale, 
          ...(sessionId && { sessionId })
        },
      }),
  });
}

export function useRepeatPurchases(params: RecommendationParams = {}) {
  const { limit = 8, locale = 'ru' } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'repeat', { limit, locale }],
    queryFn: () =>
      apiClient.get<Product[]>('/recommendations/repeat-purchases', {
        params: { limit, locale },
      }),
  });
}

export function usePopularProducts(params: RecommendationParams = {}) {
  const { limit = 10, locale = 'ru' } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'popular', { limit, locale }],
    queryFn: () =>
      apiClient.get<Product[]>('/recommendations/popular', {
        params: { limit, locale },
      }),
  });
}

export function useTrendingProducts(params: RecommendationParams = {}) {
  const { limit = 10, locale = 'ru' } = params;

  return useQuery<Product[]>({
    queryKey: ['recommendations', 'trending', { limit, locale }],
    queryFn: () =>
      apiClient.get<Product[]>('/recommendations/trending', {
        params: { limit, locale },
      }),
  });
}

export function useTrackView() {
  return useMutation({
    mutationFn: (data: TrackViewData) =>
      apiClient.post('/recommendations/track-view', data),
  });
}
