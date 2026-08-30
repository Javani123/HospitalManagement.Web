/**
 * Standard API response wrapper matching backend ASP.NET Core `ApiResponse<T>`.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

/**
 * Normalized API error object used across frontend UI components.
 */
export interface AppError {
  message: string;
  statusCode?: number;
  validationErrors?: Record<string, string[]>;
  isNetworkError?: boolean;
}

/**
 * Base entity contract shared across backend models.
 */
export interface BaseEntity {
  id: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Standard pagination query parameters for list endpoints.
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

/**
 * Standard paginated response structure.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
