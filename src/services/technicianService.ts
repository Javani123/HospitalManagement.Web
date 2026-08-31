import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  TechnicianProfileDto,
  CreateTechnicianProfileRequest,
  UpdateTechnicianProfileRequest,
  TechnicianQueryFilters,
} from '../types/technician';

/**
 * Service for Technician Profile Master (F14.6).
 * Connects directly to backend TechniciansController.
 */
export const technicianService = {
  /**
   * Retrieves all active technician profiles for the current hospital tenant,
   * optionally filtered by departmentId, primaryBench, or search query.
   * GET /api/technicians?departmentId={id}&primaryBench={bench}&search={query}
   */
  async getAll(filters?: TechnicianQueryFilters): Promise<TechnicianProfileDto[]> {
    const params: Record<string, string | number> = {};
    if (filters?.departmentId) {
      params.departmentId = filters.departmentId;
    }
    if (filters?.primaryBench && filters.primaryBench.trim()) {
      params.primaryBench = filters.primaryBench.trim();
    }
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }

    const res = await apiClient.get<ApiResponse<TechnicianProfileDto[]>>(
      API_ENDPOINTS.TECHNICIANS.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a single technician profile by database ID.
   * GET /api/technicians/{id}
   */
  async getById(id: number): Promise<TechnicianProfileDto> {
    const res = await apiClient.get<ApiResponse<TechnicianProfileDto>>(
      API_ENDPOINTS.TECHNICIANS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Technician profile not found');
  },

  /**
   * Retrieves a technician profile by the underlying StaffId.
   * GET /api/technicians/by-staff/{staffId}
   */
  async getByStaffId(staffId: number): Promise<TechnicianProfileDto> {
    const res = await apiClient.get<ApiResponse<TechnicianProfileDto>>(
      API_ENDPOINTS.TECHNICIANS.BY_STAFF_ID(staffId)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Technician profile not found for staff');
  },

  /**
   * Creates and links a technician profile to an existing active Staff member.
   * POST /api/technicians
   */
  async create(dto: CreateTechnicianProfileRequest): Promise<TechnicianProfileDto> {
    const res = await apiClient.post<ApiResponse<TechnicianProfileDto>>(
      API_ENDPOINTS.TECHNICIANS.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create technician profile');
  },

  /**
   * Updates an existing technician profile.
   * PUT /api/technicians/{id}
   */
  async update(
    id: number,
    dto: UpdateTechnicianProfileRequest
  ): Promise<TechnicianProfileDto> {
    const res = await apiClient.put<ApiResponse<TechnicianProfileDto>>(
      API_ENDPOINTS.TECHNICIANS.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update technician profile');
  },

  /**
   * Soft-deactivates a technician profile (sets IsActive = false).
   * DELETE /api/technicians/{id}
   */
  async deactivate(id: number): Promise<TechnicianProfileDto> {
    const res = await apiClient.delete<ApiResponse<TechnicianProfileDto>>(
      API_ENDPOINTS.TECHNICIANS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    return { id } as TechnicianProfileDto;
  },

  /**
   * Reactivates a technician profile.
   * PUT /api/technicians/{id} with isActive = true
   */
  async reactivate(tech: TechnicianProfileDto): Promise<TechnicianProfileDto> {
    const updateDto: UpdateTechnicianProfileRequest = {
      licenseNumber: tech.licenseNumber,
      certification: tech.certification || undefined,
      primaryBench: tech.primaryBench || undefined,
      isActive: true,
    };
    return this.update(tech.id, updateDto);
  },
};

export default technicianService;
