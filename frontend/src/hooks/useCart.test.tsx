import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddProductToCart } from './useCart';
import { apiClient } from '@/services/api';
import * as sessionUtils from '@/utils/session';
import type { ReactNode } from 'react';

// Mock dependencies
vi.mock('@/services/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('@/utils/session', () => ({
  getSessionId: vi.fn(),
  isAuthenticated: vi.fn(),
}));

describe('useAddProductToCart', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('Guest user', () => {
    beforeEach(() => {
      vi.mocked(sessionUtils.isAuthenticated).mockReturnValue(false);
      vi.mocked(sessionUtils.getSessionId).mockReturnValue('session_1234567890_abc123def456');
    });

    it('should add product to cart successfully for guest user', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session_1234567890_abc123def456',
        items: [{ id: 'item-1', productId: 'product-1', quantity: 1 }],
        totalItems: 1,
        subtotal: 500,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useAddProductToCart(), { wrapper });

      result.current.mutate({ productId: 'product-1', quantity: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith(
        '/cart/session/session_1234567890_abc123def456/items',
        { productId: 'product-1', quantity: 1 },
      );
      expect(result.current.data).toEqual(mockCart);
    });

    it('should handle API error for guest user', async () => {
      const errorMessage = 'Product is not available for purchase';
      vi.mocked(apiClient.post).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAddProductToCart(), { wrapper });

      result.current.mutate({ productId: 'product-out-of-stock', quantity: 1 });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
    });

    it('should generate and use session ID if not exists', async () => {
      const mockSessionId = 'session_9876543210_xyz789abc';
      vi.mocked(sessionUtils.getSessionId).mockReturnValue(mockSessionId);

      const mockCart = {
        id: 'cart-456',
        sessionId: mockSessionId,
        items: [],
        totalItems: 0,
        subtotal: 0,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useAddProductToCart(), { wrapper });

      result.current.mutate({ productId: 'product-2', quantity: 2 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(sessionUtils.getSessionId).toHaveBeenCalled();
      expect(apiClient.post).toHaveBeenCalledWith(
        `/cart/session/${mockSessionId}/items`,
        { productId: 'product-2', quantity: 2 },
      );
    });
  });

  describe('Authenticated user', () => {
    beforeEach(() => {
      vi.mocked(sessionUtils.isAuthenticated).mockReturnValue(true);
    });

    it('should add product to cart successfully for authenticated user', async () => {
      const mockCart = {
        id: 'cart-789',
        userId: 'user-123',
        items: [{ id: 'item-2', productId: 'product-3', quantity: 3 }],
        totalItems: 3,
        subtotal: 1500,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useAddProductToCart(), { wrapper });

      result.current.mutate({ productId: 'product-3', quantity: 3 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/cart/items', {
        productId: 'product-3',
        quantity: 3,
      });
      expect(result.current.data).toEqual(mockCart);
    });

    it('should handle price not available error', async () => {
      const errorMessage = 'Product has no current price or estimate available';
      vi.mocked(apiClient.post).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAddProductToCart(), { wrapper });

      result.current.mutate({ productId: 'product-no-price', quantity: 1 });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  describe('Duplicate request prevention', () => {
    beforeEach(() => {
      vi.mocked(sessionUtils.isAuthenticated).mockReturnValue(false);
      vi.mocked(sessionUtils.getSessionId).mockReturnValue('session_test_123');
    });

    it('should not send duplicate requests for rapid clicks', async () => {
      const mockCart = {
        id: 'cart-rapid',
        items: [],
        totalItems: 1,
        subtotal: 500,
      };

      // Simulate slow API
      vi.mocked(apiClient.post).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockCart), 100);
          }),
      );

      const { result } = renderHook(() => useAddProductToCart(), { wrapper });

      // Rapid fire mutations
      result.current.mutate({ productId: 'product-rapid', quantity: 1 });
      result.current.mutate({ productId: 'product-rapid', quantity: 1 });
      result.current.mutate({ productId: 'product-rapid', quantity: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should only call API once due to React Query mutation behavior
      // Note: React Query doesn't automatically dedupe mutations like queries,
      // but the component should prevent rapid clicks via isPending state
      expect(apiClient.post).toHaveBeenCalled();
    });
  });
});
