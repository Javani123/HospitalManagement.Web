import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PaymentDto,
  CreatePaymentRequest,
  VoidPaymentRequest,
  PaymentQueryFilters,
} from '../types/payment';

/**
 * Service for Payments & Receipts (F14.11).
 * Directly connects to backend PaymentsController (/api/billing/payments).
 */
export const paymentService = {
  /**
   * Retrieves all payment transactions for the hospital with optional filters.
   * GET /api/billing/payments
   */
  async getAll(filters?: PaymentQueryFilters): Promise<PaymentDto[]> {
    const params: Record<string, string | number> = {};

    if (filters) {
      if (filters.invoiceId && filters.invoiceId > 0) {
        params.invoiceId = filters.invoiceId;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.method) {
        params.method = filters.method;
      }
      if (filters.fromDate) {
        params.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        params.toDate = filters.toDate;
      }
    }

    const res = await apiClient.get<ApiResponse<PaymentDto[]>>(
      API_ENDPOINTS.BILLING.PAYMENTS.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a single payment by its ID.
   * GET /api/billing/payments/{id}
   */
  async getById(id: number): Promise<PaymentDto> {
    const res = await apiClient.get<ApiResponse<PaymentDto>>(
      API_ENDPOINTS.BILLING.PAYMENTS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Payment not found.');
  },

  /**
   * Retrieves a single payment by its sequential PaymentNumber (e.g. "PAY000001").
   * GET /api/billing/payments/number/{paymentNumber}
   */
  async getByNumber(paymentNumber: string): Promise<PaymentDto> {
    const res = await apiClient.get<ApiResponse<PaymentDto>>(
      API_ENDPOINTS.BILLING.PAYMENTS.BY_NUMBER(paymentNumber)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || `Payment ${paymentNumber} not found.`);
  },

  /**
   * Retrieves all payments recorded against a specific invoice.
   * GET /api/billing/invoices/{invoiceId}/payments
   */
  async getByInvoiceId(invoiceId: number): Promise<PaymentDto[]> {
    const res = await apiClient.get<ApiResponse<PaymentDto[]>>(
      API_ENDPOINTS.BILLING.PAYMENTS.BY_INVOICE(invoiceId)
    );
    return res.data.data || [];
  },

  /**
   * Records a new payment against an invoice.
   * POST /api/billing/payments
   */
  async create(dto: CreatePaymentRequest): Promise<PaymentDto> {
    const payload = {
      invoiceId: dto.invoiceId,
      amount: Number(dto.amount),
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber ? dto.referenceNumber.trim() : null,
      notes: dto.notes ? dto.notes.trim() : null,
    };

    const res = await apiClient.post<ApiResponse<PaymentDto>>(
      API_ENDPOINTS.BILLING.PAYMENTS.BASE,
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to record payment.');
  },

  /**
   * Voids a previously completed payment transaction.
   * POST /api/billing/payments/{id}/void
   */
  async void(id: number, reason: string): Promise<PaymentDto> {
    const payload: VoidPaymentRequest = {
      reason: reason.trim(),
    };

    const res = await apiClient.post<ApiResponse<PaymentDto>>(
      API_ENDPOINTS.BILLING.PAYMENTS.VOID(id),
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to void payment.');
  },
};

export default paymentService;
