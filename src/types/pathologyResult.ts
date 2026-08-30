/**
 * TypeScript types for Pathology Result (M11 & M12) — matching backend DTOs and models exactly.
 *
 * Status lifecycle (M11):
 *   Pending → Processing → ResultEntered → Verified → Released
 *
 * Result flag (M12):
 *   NotEvaluated | Low | Normal | High
 */

export type PathologyResultStatus =
  | 'Pending'
  | 'Processing'
  | 'ResultEntered'
  | 'Verified'
  | 'Released'
  | 'Cancelled';

export type PathologyResultFlag = 'NotEvaluated' | 'Low' | 'Normal' | 'High';

/**
 * Response DTO for a PathologyResult (matches backend PathologyResultDto exactly).
 * Includes enriched sample, order, patient, and test context.
 */
export interface PathologyResultDto {
  // ── Result core ─────────────────────────────────────────────────────────────
  id: number;
  status: string; // "Pending" | "Processing" | "ResultEntered" | "Verified" | "Released" | "Cancelled"
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  resultFlag: string; // "NotEvaluated" | "Low" | "Normal" | "High"
  remarks?: string;
  enteredBy?: string;
  enteredAt?: string; // ISO UTC datetime
  verifiedBy?: string;
  verifiedAt?: string; // ISO UTC datetime
  releasedAt?: string; // ISO UTC datetime

  // ── Sample context ──────────────────────────────────────────────────────────
  pathologySampleId: number;
  sampleNumber: string;
  sampleStatus: string;
  collectedAt: string;
  receivedAt?: string;
  sampleTypeName: string;
  sampleTypeCode: string;

  // ── Order context ───────────────────────────────────────────────────────────
  pathologyLabOrderId: number;
  orderNumber: string;
  orderDate: string;

  // ── Patient context ─────────────────────────────────────────────────────────
  patientId: number;
  patientNumber: string;
  patientName: string;

  // ── Test context ────────────────────────────────────────────────────────────
  pathologyTestId: number;
  testName: string;
  testCode: string;
}

/**
 * Request payload for creating a Pending result for a Received sample (CreatePathologyResultDto).
 */
export interface CreatePathologyResultRequest {
  pathologySampleId: number;
}

/**
 * Request payload for entering/updating result values (EnterResultDto).
 */
export interface EnterResultRequest {
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  remarks?: string;
  enteredBy?: string;
}

/**
 * Request payload for verifying a result (VerifyResultDto).
 */
export interface VerifyResultRequest {
  verifiedBy: string;
}
