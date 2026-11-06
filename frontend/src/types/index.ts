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
