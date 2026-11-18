import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Cart } from '@/types';
import { getSessionId, isAuthenticated } from '@/utils/session';
import { removeToken } from './useAuth';

function isAuthorizationError(error: unknown): boolean {
  return error instanceof Error && /unauthorized|forbidden/i.test(error.message);
}

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
  const [useGuestCart, setUseGuestCart] = useState(false);
  const sessionId = scope.sessionId ?? getSessionId();
  const sessionQueryKey = ['cart', 'session', sessionId] as const;

  return useQuery<Cart>({
    queryKey: useGuestCart ? sessionQueryKey : scope.queryKey,
    queryFn: async () => {
      if (!scope.authenticated || useGuestCart) {
        return apiClient.get<Cart>(`/cart/session/${sessionId}`);
      }

      try {
        return await apiClient.get<Cart>('/cart');
      } catch (error) {
        if (!isAuthorizationError(error)) throw error;

        // A stale token must not make the public cart inaccessible to a guest.
        removeToken();
        setUseGuestCart(true);
        return apiClient.get<Cart>(`/cart/session/${sessionId}`);
      }
    },
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
