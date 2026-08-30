import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type { PatientDto, CreatePatientDto, UpdatePatientDto } from '../types/patient';

/**
 * Service for Patient Master CRUD operations.
 * (Foundation placeholder methods ready for M8 integration)
 */
export const patientService = {
  /**
   * Retrieves all active patients for the current hospital.
   */
  async getAll(): Promise<PatientDto[]> {
    const response = await apiClient.get<ApiResponse<PatientDto[]>>(API_ENDPOINTS.PATIENTS.BASE);
    return response.data.data || [];
  },

  /**
   * Retrieves a specific patient by ID.
   */
  async getById(id: number): Promise<PatientDto> {
    const response = await apiClient.get<ApiResponse<PatientDto>>(API_ENDPOINTS.PATIENTS.BY_ID(id));
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Patient not found');
  },

  /**
   * Registers a new patient.
   */
  async create(dto: CreatePatientDto): Promise<PatientDto> {
    const response = await apiClient.post<ApiResponse<PatientDto>>(API_ENDPOINTS.PATIENTS.BASE, dto);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create patient');
  },

  /**
   * Updates an existing patient.
   */
  async update(id: number, dto: UpdatePatientDto): Promise<PatientDto> {
    const response = await apiClient.put<ApiResponse<PatientDto>>(API_ENDPOINTS.PATIENTS.BY_ID(id), dto);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update patient');
  },

  /**
   * Deactivates a patient by ID.
   */
  async delete(id: number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.PATIENTS.BY_ID(id));
    return response.data.success;
  },
};
