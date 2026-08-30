import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologyTestCategoryDto,
  CreatePathologyTestCategoryDto,
  UpdatePathologyTestCategoryDto,
  PathologySampleTypeDto,
  CreatePathologySampleTypeDto,
  UpdatePathologySampleTypeDto,
  PathologyTestUnitDto,
  CreatePathologyTestUnitDto,
  UpdatePathologyTestUnitDto,
  PathologyTestDto,
  CreatePathologyTestDto,
  UpdatePathologyTestDto,
  PathologyReferenceRangeDto,
  CreatePathologyReferenceRangeDto,
  UpdatePathologyReferenceRangeDto,
  PathologyLabOrderDto,
  CreatePathologyLabOrderDto,
} from '../types/pathology';

/**
 * Service for Pathology Masters and Lab Orders API endpoints.
 * Provides clean typed abstractions ready for subsequent modules.
 */
export const pathologyService = {
  // ----------------------------------------------------
  // 1. Test Categories
  // ----------------------------------------------------
  categories: {
    async getAll(): Promise<PathologyTestCategoryDto[]> {
      const res = await apiClient.get<ApiResponse<PathologyTestCategoryDto[]>>(API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BASE);
      return res.data.data || [];
    },
    async getById(id: number): Promise<PathologyTestCategoryDto> {
      const res = await apiClient.get<ApiResponse<PathologyTestCategoryDto>>(API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BY_ID(id));
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Test category not found');
    },
    async create(dto: CreatePathologyTestCategoryDto): Promise<PathologyTestCategoryDto> {
      const res = await apiClient.post<ApiResponse<PathologyTestCategoryDto>>(API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BASE, dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create test category');
    },
    async update(id: number, dto: UpdatePathologyTestCategoryDto): Promise<PathologyTestCategoryDto> {
      const res = await apiClient.put<ApiResponse<PathologyTestCategoryDto>>(API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BY_ID(id), dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update test category');
    },
    async delete(id: number): Promise<boolean> {
      const res = await apiClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.PATHOLOGY.TEST_CATEGORIES.BY_ID(id));
      return res.data.success;
    },
  },

  // ----------------------------------------------------
  // 2. Sample Types
  // ----------------------------------------------------
  sampleTypes: {
    async getAll(): Promise<PathologySampleTypeDto[]> {
      const res = await apiClient.get<ApiResponse<PathologySampleTypeDto[]>>(API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BASE);
      return res.data.data || [];
    },
    async getById(id: number): Promise<PathologySampleTypeDto> {
      const res = await apiClient.get<ApiResponse<PathologySampleTypeDto>>(API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BY_ID(id));
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Sample type not found');
    },
    async create(dto: CreatePathologySampleTypeDto): Promise<PathologySampleTypeDto> {
      const res = await apiClient.post<ApiResponse<PathologySampleTypeDto>>(API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BASE, dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create sample type');
    },
    async update(id: number, dto: UpdatePathologySampleTypeDto): Promise<PathologySampleTypeDto> {
      const res = await apiClient.put<ApiResponse<PathologySampleTypeDto>>(API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BY_ID(id), dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update sample type');
    },
    async delete(id: number): Promise<boolean> {
      const res = await apiClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BY_ID(id));
      return res.data.success;
    },
  },

  // ----------------------------------------------------
  // 3. Test Units
  // ----------------------------------------------------
  units: {
    async getAll(): Promise<PathologyTestUnitDto[]> {
      const res = await apiClient.get<ApiResponse<PathologyTestUnitDto[]>>(API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BASE);
      return res.data.data || [];
    },
    async getById(id: number): Promise<PathologyTestUnitDto> {
      const res = await apiClient.get<ApiResponse<PathologyTestUnitDto>>(API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BY_ID(id));
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Test unit not found');
    },
    async create(dto: CreatePathologyTestUnitDto): Promise<PathologyTestUnitDto> {
      const res = await apiClient.post<ApiResponse<PathologyTestUnitDto>>(API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BASE, dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create test unit');
    },
    async update(id: number, dto: UpdatePathologyTestUnitDto): Promise<PathologyTestUnitDto> {
      const res = await apiClient.put<ApiResponse<PathologyTestUnitDto>>(API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BY_ID(id), dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update test unit');
    },
    async delete(id: number): Promise<boolean> {
      const res = await apiClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.PATHOLOGY.TEST_UNITS.BY_ID(id));
      return res.data.success;
    },
  },

  // ----------------------------------------------------
  // 4. Tests
  // ----------------------------------------------------
  tests: {
    async getAll(): Promise<PathologyTestDto[]> {
      const res = await apiClient.get<ApiResponse<PathologyTestDto[]>>(API_ENDPOINTS.PATHOLOGY.TESTS.BASE);
      return res.data.data || [];
    },
    async getById(id: number): Promise<PathologyTestDto> {
      const res = await apiClient.get<ApiResponse<PathologyTestDto>>(API_ENDPOINTS.PATHOLOGY.TESTS.BY_ID(id));
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Pathology test not found');
    },
    async create(dto: CreatePathologyTestDto): Promise<PathologyTestDto> {
      const res = await apiClient.post<ApiResponse<PathologyTestDto>>(API_ENDPOINTS.PATHOLOGY.TESTS.BASE, dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create test');
    },
    async update(id: number, dto: UpdatePathologyTestDto): Promise<PathologyTestDto> {
      const res = await apiClient.put<ApiResponse<PathologyTestDto>>(API_ENDPOINTS.PATHOLOGY.TESTS.BY_ID(id), dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update test');
    },
    async delete(id: number): Promise<boolean> {
      const res = await apiClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.PATHOLOGY.TESTS.BY_ID(id));
      return res.data.success;
    },
  },

  // ----------------------------------------------------
  // 5. Reference Ranges
  // ----------------------------------------------------
  referenceRanges: {
    async getAll(): Promise<PathologyReferenceRangeDto[]> {
      const res = await apiClient.get<ApiResponse<PathologyReferenceRangeDto[]>>(API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BASE);
      return res.data.data || [];
    },
    async getById(id: number): Promise<PathologyReferenceRangeDto> {
      const res = await apiClient.get<ApiResponse<PathologyReferenceRangeDto>>(API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_ID(id));
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Reference range not found');
    },
    async getByTestId(testId: number): Promise<PathologyReferenceRangeDto[]> {
      const res = await apiClient.get<ApiResponse<PathologyReferenceRangeDto[]>>(API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_TEST(testId));
      return res.data.data || [];
    },
    async create(dto: CreatePathologyReferenceRangeDto): Promise<PathologyReferenceRangeDto> {
      const res = await apiClient.post<ApiResponse<PathologyReferenceRangeDto>>(API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BASE, dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create reference range');
    },
    async update(id: number, dto: UpdatePathologyReferenceRangeDto): Promise<PathologyReferenceRangeDto> {
      const res = await apiClient.put<ApiResponse<PathologyReferenceRangeDto>>(API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_ID(id), dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update reference range');
    },
    async delete(id: number): Promise<boolean> {
      const res = await apiClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_ID(id));
      return res.data.success;
    },
  },

  // ----------------------------------------------------
  // 6. Lab Orders (Preview for M9)
  // ----------------------------------------------------
  labOrders: {
    async getAll(): Promise<PathologyLabOrderDto[]> {
      const res = await apiClient.get<ApiResponse<PathologyLabOrderDto[]>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BASE);
      return res.data.data || [];
    },
    async getById(id: number): Promise<PathologyLabOrderDto> {
      const res = await apiClient.get<ApiResponse<PathologyLabOrderDto>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BY_ID(id));
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Lab order not found');
    },
    async create(dto: CreatePathologyLabOrderDto): Promise<PathologyLabOrderDto> {
      const res = await apiClient.post<ApiResponse<PathologyLabOrderDto>>(API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.BASE, dto);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create lab order');
    },
  },
};
