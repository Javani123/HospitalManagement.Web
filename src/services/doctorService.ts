import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  DoctorProfileDto,
  CreateDoctorProfileRequest,
  UpdateDoctorProfileRequest,
  DoctorQueryFilters,
} from '../types/doctor';

/**
 * Service for Doctor Profile Master (F14.5).
 * Connects directly to backend DoctorsController.
 */
export const doctorService = {
  /**
   * Retrieves all active doctor profiles for the current hospital tenant,
   * optionally filtered by departmentId or search query.
   * GET /api/doctors?departmentId={id}&search={query}
   */
  async getAll(filters?: DoctorQueryFilters): Promise<DoctorProfileDto[]> {
    const params: Record<string, string | number> = {};
    if (filters?.departmentId) {
      params.departmentId = filters.departmentId;
    }
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }

    const res = await apiClient.get<ApiResponse<DoctorProfileDto[]>>(
      API_ENDPOINTS.DOCTORS.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a single doctor profile by database ID.
   * GET /api/doctors/{id}
   */
  async getById(id: number): Promise<DoctorProfileDto> {
    const res = await apiClient.get<ApiResponse<DoctorProfileDto>>(
      API_ENDPOINTS.DOCTORS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Doctor profile not found');
  },

  /**
   * Retrieves a doctor profile by the underlying StaffId.
   * GET /api/doctors/by-staff/{staffId}
   */
  async getByStaffId(staffId: number): Promise<DoctorProfileDto> {
    const res = await apiClient.get<ApiResponse<DoctorProfileDto>>(
      API_ENDPOINTS.DOCTORS.BY_STAFF_ID(staffId)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Doctor profile not found for staff');
  },

  /**
   * Creates and links a doctor profile to an existing active Staff member.
   * POST /api/doctors
   */
  async create(dto: CreateDoctorProfileRequest): Promise<DoctorProfileDto> {
    const res = await apiClient.post<ApiResponse<DoctorProfileDto>>(
      API_ENDPOINTS.DOCTORS.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create doctor profile');
  },

  /**
   * Updates an existing doctor profile.
   * PUT /api/doctors/{id}
   */
  async update(
    id: number,
    dto: UpdateDoctorProfileRequest
  ): Promise<DoctorProfileDto> {
    const res = await apiClient.put<ApiResponse<DoctorProfileDto>>(
      API_ENDPOINTS.DOCTORS.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update doctor profile');
  },

  /**
   * Soft-deactivates a doctor profile (sets IsActive = false).
   * DELETE /api/doctors/{id}
   */
  async deactivate(id: number): Promise<DoctorProfileDto> {
    const res = await apiClient.delete<ApiResponse<DoctorProfileDto>>(
      API_ENDPOINTS.DOCTORS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    return { id } as DoctorProfileDto;
  },

  /**
   * Reactivates a doctor profile.
   * PUT /api/doctors/{id} with isActive = true
   */
  async reactivate(doctor: DoctorProfileDto): Promise<DoctorProfileDto> {
    const updateDto: UpdateDoctorProfileRequest = {
      registrationNumber: doctor.registrationNumber,
      specialization: doctor.specialization || undefined,
      qualification: doctor.qualification || undefined,
      consultationFee: doctor.consultationFee,
      defaultCommissionRate: doctor.defaultCommissionRate,
      isExternalReferrer: doctor.isExternalReferrer,
      isActive: true,
    };
    return this.update(doctor.id, updateDto);
  },
};

export default doctorService;
