import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { getSessionId, isAuthenticated } from '@/utils/session';

const GUEST_FAVORITES_KEY = 'ak-kagaz-favorites';
const guestQueryKey = ['favorites', 'guest', getSessionId()] as const;
const accountQueryKey = ['favorites', 'account'] as const;

function readGuestFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const authenticated = isAuthenticated();
  const queryKey = authenticated ? accountQueryKey : guestQueryKey;
  const favorites = useQuery<string[]>({
    queryKey,
    queryFn: () => authenticated
      ? apiClient.get<string[]>('/users/me/favorites')
      : Promise.resolve(readGuestFavorites()),
    initialData: authenticated ? undefined : readGuestFavorites(),
  });

  const saveFavorites = useMutation<string[], Error, string[], { previous?: string[] }>({
    mutationFn: async (productIds) => {
      if (authenticated) {
        return apiClient.put<string[]>('/users/me/favorites', { productIds });
      }
      localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(productIds));
      return productIds;
    },
    onMutate: async (productIds) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData(queryKey, productIds);
      return { previous };
    },
    onError: (_error, _productIds, context) => {
      const previous = context?.previous;
      if (previous) queryClient.setQueryData(queryKey, previous);
    },
    onSuccess: (productIds) => queryClient.setQueryData(queryKey, productIds),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const productIds = favorites.data ?? [];
  const toggleFavorite = (productId: string) => {
    const next = productIds.includes(productId)
      ? productIds.filter((id) => id !== productId)
      : [...productIds, productId];
    saveFavorites.mutate(next);
  };

  return {
    productIds,
    isFavorite: (productId: string) => productIds.includes(productId),
    toggleFavorite,
    isLoading: favorites.isLoading,
    error: saveFavorites.error ?? favorites.error,
    refetch: favorites.refetch,
  };
}
