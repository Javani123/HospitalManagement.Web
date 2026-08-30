import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologyUnitDto,
  CreatePathologyUnitRequest,
  UpdatePathologyUnitRequest,
} from '../types/pathologyUnit';

/**
 * Service for Pathology Test Unit (M5) master CRUD operations.
 * Connects directly to backend PathologyTestUnitsController.
 */
export const pathologyUnitService = {
  /**
   * Retrieves all active pathology test units for current hospital.
   * GET /api/pathology/test-units
   */
  async getAll(): Promise<PathologyUnitDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyUnitDto[]>>(
      API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a specific pathology test unit by Id.
   * GET /api/pathology/test-units/{id}
   */
  async getById(id: number): Promise<PathologyUnitDto> {
    const res = await apiClient.get<ApiResponse<PathologyUnitDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Test unit not found');
  },

  /**
   * Creates a new pathology test unit.
   * POST /api/pathology/test-units
   */
  async create(dto: CreatePathologyUnitRequest): Promise<PathologyUnitDto> {
    const res = await apiClient.post<ApiResponse<PathologyUnitDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create test unit');
  },

  /**
   * Updates an existing pathology test unit.
   * PUT /api/pathology/test-units/{id}
   */
  async update(
    id: number,
    dto: UpdatePathologyUnitRequest
  ): Promise<PathologyUnitDto> {
    const res = await apiClient.put<ApiResponse<PathologyUnitDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update test unit');
  },

  /**
   * Soft-deactivates a pathology test unit.
   * DELETE /api/pathology/test-units/{id}
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<PathologyUnitDto>>(
      API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BY_ID(id)
    );
  },
};
