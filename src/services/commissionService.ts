import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  DoctorCommissionRuleDto,
  CreateDoctorCommissionRuleRequest,
  UpdateDoctorCommissionRuleRequest,
} from '../types/commission';

const mapCommissionTypeToBackend = (
  type: string | number
): number => {
  if (typeof type === 'number') return type;
  return type.toLowerCase() === 'fixedamount' ? 2 : 1;
};

/**
 * Service for Doctor Commission Rules Master (F14.9).
 * Directly maps to backend DoctorCommissionRulesController (/api/commissions/rules).
 */
export const commissionService = {
  /**
   * Retrieves all active doctor commission rules for the current hospital tenant,
   * optionally filtered by doctorStaffId.
   * GET /api/commissions/rules?doctorStaffId={id}
   */
  async getAll(doctorStaffId?: number): Promise<DoctorCommissionRuleDto[]> {
    const params: Record<string, number> = {};
    if (doctorStaffId && doctorStaffId > 0) {
      params.doctorStaffId = doctorStaffId;
    }

    const res = await apiClient.get<ApiResponse<DoctorCommissionRuleDto[]>>(
      API_ENDPOINTS.COMMISSIONS.RULES.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a single doctor commission rule by ID.
   * GET /api/commissions/rules/{id}
   */
  async getById(id: number): Promise<DoctorCommissionRuleDto> {
    const res = await apiClient.get<ApiResponse<DoctorCommissionRuleDto>>(
      API_ENDPOINTS.COMMISSIONS.RULES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Doctor commission rule not found.');
  },

  /**
   * Creates a new doctor commission rule. Requires Admin role.
   * POST /api/commissions/rules
   */
  async create(
    dto: CreateDoctorCommissionRuleRequest
  ): Promise<DoctorCommissionRuleDto> {
    const payload = {
      ...dto,
      commissionType: mapCommissionTypeToBackend(dto.commissionType),
    };
    const res = await apiClient.post<ApiResponse<DoctorCommissionRuleDto>>(
      API_ENDPOINTS.COMMISSIONS.RULES.BASE,
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create commission rule.');
  },

  /**
   * Updates an existing doctor commission rule. Requires Admin role.
   * PUT /api/commissions/rules/{id}
   */
  async update(
    id: number,
    dto: UpdateDoctorCommissionRuleRequest
  ): Promise<DoctorCommissionRuleDto> {
    const payload = {
      ...dto,
      commissionType: mapCommissionTypeToBackend(dto.commissionType),
    };
    const res = await apiClient.put<ApiResponse<DoctorCommissionRuleDto>>(
      API_ENDPOINTS.COMMISSIONS.RULES.BY_ID(id),
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update commission rule.');
  },

  /**
   * Soft-deactivates a doctor commission rule. Requires Admin role.
   * DELETE /api/commissions/rules/{id}
   */
  async deactivate(id: number): Promise<boolean> {
    const res = await apiClient.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.COMMISSIONS.RULES.BY_ID(id)
    );
    return res.data.data ?? true;
  },

  /**
   * Reactivates a deactivated doctor commission rule.
   * PUT /api/commissions/rules/{id} with isActive = true
   */
  async reactivate(
    rule: DoctorCommissionRuleDto
  ): Promise<DoctorCommissionRuleDto> {
    const updateDto: UpdateDoctorCommissionRuleRequest = {
      commissionType: rule.commissionType as 'Percentage' | 'FixedAmount',
      commissionValue: rule.commissionValue,
      effectiveFrom: rule.effectiveFrom,
      effectiveTo: rule.effectiveTo || undefined,
      description: rule.description || undefined,
      isActive: true,
    };
    return this.update(rule.id, updateDto);
  },
};

export default commissionService;
