import type { BaseEntity } from './api';

/**
 * Patient gender values matching backend PatientGender enum.
 * Values: "Unknown" | "Male" | "Female" | "Other"
 */
export type PatientGender = 'Unknown' | 'Male' | 'Female' | 'Other';

/**
 * Standard blood group values accepted by the backend (free-text ≤10 chars).
 * Frontend constrains to this list for UX quality.
 */
export const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown',
] as const;

export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];

/**
 * Full patient response DTO — mirrors backend PatientDto exactly.
 * Field names match the C# PascalCase properties serialised to camelCase by ASP.NET Core.
 */
export interface PatientDto extends BaseEntity {
  hospitalId: number;
  patientNumber: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  dateOfBirth?: string;       // "YYYY-MM-DD" (DateOnly serialised)
  age?: number;               // Calculated by backend from dateOfBirth
  gender: string;             // One of PatientGender values
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/**
 * Payload to register a new patient (maps to backend CreatePatientDto).
 * Never include: hospitalId, patientNumber, id, createdAt, updatedAt, isActive.
 */
export interface CreatePatientRequest {
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;       // "YYYY-MM-DD"
  gender: string;             // PatientGender string value
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/**
 * Payload to update a patient's profile (maps to backend UpdatePatientDto).
 *
 * isActive is intentionally NOT exposed in the normal edit form.
 * It is always forwarded as the patient's current isActive value so the PUT
 * request never accidentally changes activation status.
 *
 * Reactivation of an inactive patient is a separate explicit action.
 *
 * Never include: hospitalId, patientNumber, id, createdAt, updatedAt.
 */
export interface UpdatePatientRequest {
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;       // "YYYY-MM-DD"
  gender: string;             // PatientGender string value
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isActive: boolean;          // Always mirror the patient's current status — never user-controlled via the form
}

// ─── Legacy DTO aliases kept for backward compatibility with generated stubs ──
/** @deprecated Use PatientDto instead */
export type PatientDtoLegacy = PatientDto;
/** @deprecated Use CreatePatientRequest instead */
export type CreatePatientDto = CreatePatientRequest;
/** @deprecated Use UpdatePatientRequest instead */
export type UpdatePatientDto = UpdatePatientRequest;
