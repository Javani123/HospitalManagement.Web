import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type { PathologyLabReportDto } from '../types/pathologyReport';

/**
 * Service for retrieving Final Pathology Lab Reports (M13).
 * Connects to backend PathologyReportsController.
 */
export const pathologyReportService = {
  /**
   * Retrieves a finalized pathology lab report by order primary key ID within the current tenant.
   * GET /api/pathology/reports/{orderId}
   */
  async getByOrderId(orderId: number): Promise<PathologyLabReportDto> {
    const res = await apiClient.get<ApiResponse<PathologyLabReportDto>>(
      API_ENDPOINTS.PATHOLOGY.REPORTS.BY_ORDER_ID(orderId)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Lab report not found');
  },

  /**
   * Retrieves a finalized pathology lab report by hospital-unique order number within the current tenant.
   * GET /api/pathology/reports/order-number/{orderNumber}
   */
  async getByOrderNumber(orderNumber: string): Promise<PathologyLabReportDto> {
    const res = await apiClient.get<ApiResponse<PathologyLabReportDto>>(
      API_ENDPOINTS.PATHOLOGY.REPORTS.BY_ORDER_NUMBER(orderNumber)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Lab report not found');
  },
};
