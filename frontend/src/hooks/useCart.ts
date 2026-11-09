import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Cart } from '@/types';
import { getSessionId, isAuthenticated } from '@/utils/session';

function getCartScope() {
  const authenticated = isAuthenticated();
  return {
    authenticated,
    sessionId: authenticated ? undefined : getSessionId(),
    queryKey: authenticated ? ['cart', 'account'] as const : ['cart', 'session', getSessionId()] as const,
  };
}

export function useCart() {
  const scope = getCartScope();
  return useQuery<Cart>({
    queryKey: scope.queryKey,
    queryFn: () => scope.authenticated
      ? apiClient.get<Cart>('/cart')
      : apiClient.get<Cart>(`/cart/session/${scope.sessionId}`),
  });
}

export function useAddProductToCart() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error, { productId: string; quantity?: number }>({
    mutationFn: ({ productId, quantity = 1 }) => {
      const scope = getCartScope();
      const body = { productId, quantity };
      return scope.authenticated
        ? apiClient.post<Cart>('/cart/items', body)
        : apiClient.post<Cart>(`/cart/session/${scope.sessionId}/items`, body);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(getCartScope().queryKey, cart);
      return queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error, { cartId: string; itemId: string; quantity: number }>({
    mutationFn: ({ cartId, itemId, quantity }) => {
      const scope = getCartScope();
      return scope.authenticated
        ? apiClient.put<Cart>(`/cart/${cartId}/items/${itemId}`, { quantity })
        : apiClient.put<Cart>(`/cart/session/${scope.sessionId}/items/${itemId}`, { quantity });
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(getCartScope().queryKey, cart);
      return queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { cartId: string; itemId: string }>({
    mutationFn: ({ cartId, itemId }) => {
      const scope = getCartScope();
      return scope.authenticated
        ? apiClient.delete<void>(`/cart/${cartId}/items/${itemId}`)
        : apiClient.delete<void>(`/cart/session/${scope.sessionId}/items/${itemId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}
