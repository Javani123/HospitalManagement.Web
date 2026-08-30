/**
 * TypeScript types for Final Pathology Lab Report (M13)
 * Matches backend DTOs (PathologyLabReportDto, PathologyLabReportPatientDto, PathologyLabReportTestDto) exactly.
 */

export interface PathologyLabReportPatientDto {
  /** Hospital-unique patient identifier / UHID (e.g. "PAT000001") */
  patientNumber: string;
  /** Full combined name of the patient */
  fullName: string;
  /** Patient date of birth in "YYYY-MM-DD" format */
  dateOfBirth?: string;
  /** Patient age in completed years at order reference date */
  age?: number;
  /** Patient gender ("Male" | "Female" | "Other" | "Unknown") */
  gender: string;
}

export interface PathologyLabReportTestDto {
  /** Identifier of the specific lab order item */
  orderItemId: number;
  /** Historical test name snapshot from order creation */
  testName: string;
  /** Historical test code snapshot from order creation */
  testCode: string;
  /** Accession / sample number (e.g. "SAM000001") */
  sampleNumber?: string;
  /** Name of the specimen/sample type (e.g. "Whole Blood", "Serum") */
  sampleType?: string;
  /** Measured numeric or qualitative result value */
  resultValue?: string;
  /** Unit of measurement (e.g. "g/dL", "mg/dL") */
  unit?: string;
  /** Applicable reference range snapshot (e.g. "13.0 - 17.0 g/dL") */
  referenceRange?: string;
  /** Automated evaluation flag ("Low" | "Normal" | "High" | "NotEvaluated") */
  resultFlag?: string;
  /** Clinical interpretation of the result */
  interpretation?: string;
  /** Current result status ("Released") */
  resultStatus?: string;
  /** UTC timestamp when the result was entered */
  resultEnteredAt?: string;
  /** UTC timestamp when the result was verified */
  verifiedAt?: string;
  /** UTC timestamp when the result was released */
  releasedAt?: string;
}

export interface PathologyLabReportDto {
  /** Unique identifier of the lab order */
  orderId: number;
  /** Hospital-unique order number (e.g. "LAB000001") */
  orderNumber: string;
  /** UTC timestamp when the lab order was placed */
  orderDate: string;
  /** Overall report status ("Final") */
  reportStatus: string;
  /** Whether all required test results are released and the report is finalized */
  isFinalized: boolean;
  /** Patient demographics section */
  patient: PathologyLabReportPatientDto;
  /** List of ordered tests and their released results */
  tests: PathologyLabReportTestDto[];
}
