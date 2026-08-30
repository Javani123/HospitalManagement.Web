import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type { CreatePathologyLabOrderRequest, PathologyLabOrderDto, PathologyLabOrderFilters } from '../types/pathologyLabOrder';

/** Actual M9 API. It intentionally has no update or cancellation endpoint. */
export const pathologyLabOrderService = {
  async getAll(filters: PathologyLabOrderFilters = {}): Promise<PathologyLabOrderDto[]> {
    const response = await apiClient.get<ApiResponse<PathologyLabOrderDto[]>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BASE, { params: filters });
    return response.data.data ?? [];
  },
  async getById(id: number): Promise<PathologyLabOrderDto> {
    const response = await apiClient.get<ApiResponse<PathologyLabOrderDto>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BY_ID(id));
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || 'Lab order not found');
  },
  async getByOrderNumber(orderNumber: string): Promise<PathologyLabOrderDto> {
    const response = await apiClient.get<ApiResponse<PathologyLabOrderDto>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BY_NUMBER(orderNumber));
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || 'Lab order not found');
  },
  async create(dto: CreatePathologyLabOrderRequest): Promise<PathologyLabOrderDto> {
    const response = await apiClient.post<ApiResponse<PathologyLabOrderDto>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BASE, dto);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || 'Failed to create lab order');
  },
};
