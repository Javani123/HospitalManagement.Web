import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologyTestCategoryDto,
  CreatePathologyTestCategoryRequest,
  UpdatePathologyTestCategoryRequest,
} from '../types/pathologyCategory';

/**
 * Service for Pathology Test Category (M3) master CRUD operations.
 * Connects directly to backend PathologyTestCategoriesController.
 */
export const pathologyCategoryService = {
  /**
   * Retrieves all active pathology test categories for current hospital.
   * GET /api/pathology/test-categories
   */
  async getAll(): Promise<PathologyTestCategoryDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyTestCategoryDto[]>>(
      API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a specific pathology test category by Id.
   * GET /api/pathology/test-categories/{id}
   */
  async getById(id: number): Promise<PathologyTestCategoryDto> {
    const res = await apiClient.get<ApiResponse<PathologyTestCategoryDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Test category not found');
  },

  /**
   * Creates a new pathology test category.
   * POST /api/pathology/test-categories
   */
  async create(dto: CreatePathologyTestCategoryRequest): Promise<PathologyTestCategoryDto> {
    const res = await apiClient.post<ApiResponse<PathologyTestCategoryDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create test category');
  },

  /**
   * Updates an existing pathology test category.
   * PUT /api/pathology/test-categories/{id}
   */
  async update(
    id: number,
    dto: UpdatePathologyTestCategoryRequest
  ): Promise<PathologyTestCategoryDto> {
    const res = await apiClient.put<ApiResponse<PathologyTestCategoryDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update test category');
  },

  /**
   * Soft-deactivates a pathology test category.
   * DELETE /api/pathology/test-categories/{id}
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<PathologyTestCategoryDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BY_ID(id)
    );
  },
};
