import type { BaseEntity } from './api';

export type PatientGender = 'Male' | 'Female' | 'Other';

/**
 * Full patient information DTO from backend.
 */
export interface PatientDto extends BaseEntity {
  hospitalId: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  contactNumber: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
}

/**
 * Payload to register a new patient.
 */
export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  contactNumber: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
}

/**
 * Payload to update an existing patient.
 */
export interface UpdatePatientDto {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  contactNumber: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  isActive: boolean;
}
