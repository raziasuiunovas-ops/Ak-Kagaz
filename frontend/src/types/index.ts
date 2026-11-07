// Global type definitions

// User roles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'CUSTOMER';

// Locales
export type Locale = 'ru' | 'ky';

// Common API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================================
// CATEGORIES
// ============================================================

export interface CategoryTranslation {
  id: string;
  categoryId: string;
  locale: Locale;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  slug: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: CategoryTranslation[];
  children?: Category[];
}

// ============================================================
// PRODUCTS
// ============================================================

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface ProductTranslation {
  id: string;
  productId: string;
  locale: Locale;
  name: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  sortOrder: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductPrice {
  id: string;
  productId: string;
  tierId: string;
  purchasePrice: number;
  sellingPrice: number;
  currency: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  categoryId: string;
  brandId?: string;
  status: ProductStatus;
  hasVariants: boolean;
  thumbnailUrl?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  translations: ProductTranslation[];
  images: ProductImage[];
  variants?: ProductVariant[];
  prices: ProductPrice[];
  category?: Category;
}

// ============================================================
// CART
// ============================================================

export type CartStatus = 'ACTIVE' | 'ABANDONED' | 'CONVERTED';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  status: CartStatus;
  totalItems: number;
  subtotal: number;
  expiresAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

// ============================================================
// ORDERS
// ============================================================

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type FulfillmentType = 'DELIVERY' | 'PICKUP';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  deliveryAddressId?: string;
  billingAddressId?: string;
  pickupLocationId?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

// ============================================================
// USER & ADDRESS
// ============================================================

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_VERIFICATION';

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatarUrl?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  status: UserStatus;
  locale: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  addresses?: UserAddress[];
}

// ============================================================
// REVIEWS
// ============================================================

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewImage {
  id: string;
  reviewId: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  images?: ReviewImage[];
  user?: User;
}

// ============================================================
// PAYMENT
// ============================================================

export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'MBANK';
export type PaymentMethod = 'CARD' | 'CASH' | 'ONLINE_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerTransactionId?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// BUNDLES (Product Bundles - School Kits)
// ============================================================

export interface BundleTranslation {
  id: string;
  bundleId: string;
  locale: Locale;
  name: string;
  description?: string;
}

export interface BundleItem {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  sortOrder: number;
  product?: Product;
}

export type BundleType = 'SCHOOL_KIT' | 'OFFICE_SET' | 'ART_SET' | 'SEASONAL' | 'CUSTOM';

export interface Bundle {
  id: string;
  slug: string;
  type: BundleType;
  isActive: boolean;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: BundleTranslation[];
  items: BundleItem[];
}

// ============================================================
// CAMPAIGNS (Seasonal Campaigns & Promotions)
// ============================================================

export interface CampaignTranslation {
  id: string;
  campaignId: string;
  locale: Locale;
  name: string;
  description?: string;
}

export interface CampaignProduct {
  id: string;
  campaignId: string;
  productId: string;
  discountPercentage: number;
  specialPrice?: number;
  product?: Product;
}

export type CampaignType = 'SEASONAL' | 'FLASH_SALE' | 'CLEARANCE' | 'NEW_ARRIVAL' | 'BUNDLE_DEAL';

export interface Campaign {
  id: string;
  slug: string;
  type: CampaignType;
  isActive: boolean;
  startDate: string;
  endDate: string;
  bannerUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: CampaignTranslation[];
  products: CampaignProduct[];
}

// ============================================================
// RECOMMENDATIONS
// ============================================================

export interface ProductView {
  id: string;
  productId: string;
  userId?: string;
  sessionId?: string;
  viewedAt: string;
}

export interface FrequentlyBoughtTogether {
  id: string;
  productId: string;
  relatedProductId: string;
  frequency: number;
  confidence: number;
  isManual: boolean;
  product?: Product;
  relatedProduct?: Product;
}

export interface RecommendationParams {
  limit?: number;
  locale?: string;
  sessionId?: string;
}

export interface TrackViewData {
  productId: string;
  sessionId?: string;
}

// ============================================================
// AI ASSISTANT
// ============================================================

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    productId?: string;
    categoryId?: string;
    orderId?: string;
    page?: string;
  };
}

export interface ChatResponse {
  message: string;
  sessionId: string;
}

export interface QuickQuestion {
  id: string;
  question: string;
  category: 'order' | 'product' | 'delivery' | 'support' | 'general';
}
