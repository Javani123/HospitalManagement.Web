import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologyTestDto,
  CreatePathologyTestRequest,
  UpdatePathologyTestRequest,
} from '../types/pathologyTest';

/**
 * Service for Pathology Test (M6) master CRUD operations.
 * Connects directly to backend PathologyTestsController.
 */
export const pathologyTestService = {
  /**
   * Retrieves all active pathology tests for current hospital.
   * GET /api/pathology/tests
   */
  async getAll(): Promise<PathologyTestDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyTestDto[]>>(
      API_ENDPOINTS.PATHOLOGY.TESTS.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a specific pathology test by Id.
   * GET /api/pathology/tests/{id}
   */
  async getById(id: number): Promise<PathologyTestDto> {
    const res = await apiClient.get<ApiResponse<PathologyTestDto>>(
      API_ENDPOINTS.PATHOLOGY.TESTS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Pathology test not found');
  },

  /**
   * Creates a new pathology test.
   * POST /api/pathology/tests
   */
  async create(dto: CreatePathologyTestRequest): Promise<PathologyTestDto> {
    const res = await apiClient.post<ApiResponse<PathologyTestDto>>(
      API_ENDPOINTS.PATHOLOGY.TESTS.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create pathology test');
  },

  /**
   * Updates an existing pathology test.
   * PUT /api/pathology/tests/{id}
   */
  async update(
    id: number,
    dto: UpdatePathologyTestRequest
  ): Promise<PathologyTestDto> {
    const res = await apiClient.put<ApiResponse<PathologyTestDto>>(
      API_ENDPOINTS.PATHOLOGY.TESTS.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update pathology test');
  },

  /**
   * Soft-deactivates a pathology test.
   * DELETE /api/pathology/tests/{id}
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<PathologyTestDto>>(
      API_ENDPOINTS.PATHOLOGY.TESTS.BY_ID(id)
    );
  },
};
