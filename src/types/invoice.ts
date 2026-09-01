/**
 * Billing & Invoice types and DTO contracts (F14.10).
 * Matches HospitalManagement.Api DTOs and models.
 */

export type InvoiceStatus = 'Draft' | 'Issued' | 'PartiallyPaid' | 'Paid' | 'Cancelled';

export interface InvoiceItemDto {
  id: number;
  pathologyLabOrderItemId?: number | null;
  itemDescription: string;
  itemCode: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface PaymentDto {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
  status: string;
  receivedByStaffId?: number | null;
  receivedByName?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  voidedByStaffId?: number | null;
  voidedByName?: string | null;
  createdAt: string;
}

export interface InvoiceDto {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientNumber: string;
  patientName: string;
  pathologyLabOrderId: number;
  orderNumber: string;
  invoiceDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus | string;
  createdByStaffId?: number | null;
  createdByName?: string | null;
  notes?: string | null;
  items: InvoiceItemDto[];
  payments: PaymentDto[];
  itemCount: number;
  paymentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  pathologyLabOrderId: number;
  discountAmount?: number;
  notes?: string | null;
}

export interface CancelInvoiceRequest {
  reason?: string | null;
}

export interface InvoiceQueryFilters {
  patientId?: number;
  status?: InvoiceStatus | '';
  invoiceNumber?: string;
  fromInvoiceDate?: string;
  toInvoiceDate?: string;
  search?: string;
}
