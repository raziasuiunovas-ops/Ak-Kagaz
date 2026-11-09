// API Hooks
export { useCategories, useCategoriesTree, useCategory, useCategoryBySlug } from './useCategories';
export { useProducts, useProduct, useProductBySlug, useProductBySku } from './useProducts';
export { useBundles, useBundle, useBundleBySlug, useAddBundleToCart } from './useBundles';
export { useFavorites } from './useFavorites';
export { useCart, useAddProductToCart, useUpdateCartItem, useRemoveCartItem } from './useCart';
export { useCampaigns, useActiveCampaigns, useCampaign, useCampaignBySlug, useProductCampaigns } from './useCampaigns';
export {
  usePersonalRecommendations,
  useGuestRecommendations,
  useFrequentlyBought,
  useSimilarProducts,
  useRecentlyViewed,
  useRepeatPurchases,
  usePopularProducts,
  useTrendingProducts,
  useTrackView,
} from './useRecommendations';
export { useChat, useQuickQuestions, useChatHistory } from './useAI';

// Auth Hooks
export {
  useLogin,
  useVerify2FA,
  useRegister,
  useLogout,
  useCurrentUser,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
} from './useAuth';

// Admin Auth Hooks
export { useAdminLogin, useAdminVerify2FA } from './useAdminAuth';
