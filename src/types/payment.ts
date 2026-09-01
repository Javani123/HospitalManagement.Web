/**
 * Payment & Receipt types and DTO contracts (F14.11).
 * Matches HospitalManagement.Api DTOs and models.
 */

export enum PaymentMethod {
  Cash = 1,
  Card = 2,
  BankTransfer = 3,
  UPI = 4,
  Insurance = 5,
  Cheque = 6,
}

export type PaymentMethodType =
  | 'Cash'
  | 'Card'
  | 'BankTransfer'
  | 'UPI'
  | 'Insurance'
  | 'Cheque';

export enum PaymentStatus {
  Completed = 1,
  Voided = 2,
}

export type PaymentStatusType = 'Completed' | 'Voided';

export interface PaymentDto {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethodType | string;
  referenceNumber?: string | null;
  notes?: string | null;
  status: PaymentStatusType | string;
  receivedByStaffId?: number | null;
  receivedByName?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  voidedByStaffId?: number | null;
  voidedByName?: string | null;
  createdAt: string;
}

export interface CreatePaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: PaymentMethod | number | string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface VoidPaymentRequest {
  reason: string;
}

export interface PaymentQueryFilters {
  invoiceId?: number;
  status?: PaymentStatus | number | string;
  method?: PaymentMethod | number | string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}
