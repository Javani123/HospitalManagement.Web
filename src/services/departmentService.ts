import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  DepartmentDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../types/department';

/**
 * Service for Hospital Department Master (F14.2) operations.
 * Connects directly to backend DepartmentsController.
 */
export const departmentService = {
  /**
   * Retrieves all active departments for the current hospital tenant.
   * GET /api/departments
   */
  async getAll(): Promise<DepartmentDto[]> {
    const res = await apiClient.get<ApiResponse<DepartmentDto[]>>(
      API_ENDPOINTS.DEPARTMENTS.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a specific department by ID.
   * GET /api/departments/{id}
   */
  async getById(id: number): Promise<DepartmentDto> {
    const res = await apiClient.get<ApiResponse<DepartmentDto>>(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Department not found');
  },

  /**
   * Creates a new department for the current hospital tenant.
   * POST /api/departments
   */
  async create(dto: CreateDepartmentRequest): Promise<DepartmentDto> {
    const res = await apiClient.post<ApiResponse<DepartmentDto>>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create department');
  },

  /**
   * Updates an existing department's details or activation status.
   * PUT /api/departments/{id}
   */
  async update(
    id: number,
    dto: UpdateDepartmentRequest
  ): Promise<DepartmentDto> {
    const res = await apiClient.put<ApiResponse<DepartmentDto>>(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update department');
  },

  /**
   * Soft-deletes (deactivates) a department.
   * DELETE /api/departments/{id}
   */
  async deactivate(id: number): Promise<DepartmentDto> {
    const res = await apiClient.delete<ApiResponse<DepartmentDto>>(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    return { id } as DepartmentDto;
  },

  /**
   * Reactivates a previously deactivated department.
   * PUT /api/departments/{id} with isActive = true
   */
  async reactivate(dept: DepartmentDto): Promise<DepartmentDto> {
    const updateDto: UpdateDepartmentRequest = {
      name: dept.name,
      code: dept.code,
      description: dept.description || undefined,
      isActive: true,
    };
    return this.update(dept.id, updateDto);
  },
};

export default departmentService;
