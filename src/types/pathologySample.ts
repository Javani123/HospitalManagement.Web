/**
 * TypeScript types for Pathology Sample (M10) — matching backend DTOs exactly.
 *
 * Status enum values (string, from backend): "Collected" | "Received" | "Rejected" | "Cancelled"
 *
 * Valid transitions:
 *   Collected → Received  (POST /api/pathology/samples/{id}/receive)
 *   Collected → Rejected  (POST /api/pathology/samples/{id}/reject)
 *   Received  → Rejected  (POST /api/pathology/samples/{id}/reject)
 */

export type PathologySampleStatus = 'Collected' | 'Received' | 'Rejected' | 'Cancelled';

/**
 * Response DTO for a PathologySample (matches backend PathologySampleDto exactly).
 * Includes enriched order, patient, test, and sample type context.
 */
export interface PathologySampleDto {
  // ── Sample core ─────────────────────────────────────────────────────────────
  id: number;
  sampleNumber: string;
  status: string; // "Collected" | "Received" | "Rejected" | "Cancelled"
  collectedAt: string; // ISO UTC datetime
  collectedBy?: string;
  receivedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;

  // ── Order context ────────────────────────────────────────────────────────────
  pathologyLabOrderId: number;
  orderNumber: string;
  orderDate: string;

  // ── Order item context ───────────────────────────────────────────────────────
  pathologyLabOrderItemId: number;

  // ── Patient context ──────────────────────────────────────────────────────────
  patientId: number;
  patientNumber: string;
  patientName: string;

  // ── Test context ─────────────────────────────────────────────────────────────
  pathologyTestId: number;
  testName: string;
  testCode: string;

  // ── Sample type context ──────────────────────────────────────────────────────
  sampleTypeId: number;
  sampleTypeName: string;
  sampleTypeCode: string;
}

/**
 * Request payload for collecting a sample (matches backend CollectSampleDto exactly).
 * Server resolves: HospitalId, SampleNumber, SampleTypeId, CollectedAt, Status.
 */
export interface CollectSampleRequest {
  pathologyLabOrderItemId: number;
  collectedBy?: string;
  notes?: string;
}

/**
 * Request payload for rejecting a sample (matches backend RejectSampleDto exactly).
 * Reason is required.
 */
export interface RejectSampleRequest {
  reason: string;
}
