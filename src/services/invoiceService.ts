import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  InvoiceDto,
  CreateInvoiceRequest,
  CancelInvoiceRequest,
  InvoiceQueryFilters,
} from '../types/invoice';

/**
 * Service for Billing & Invoices (F14.10).
 * Directly connects to backend InvoicesController (/api/billing/invoices).
 */
export const invoiceService = {
  /**
   * Retrieves all active invoices with optional filters.
   * GET /api/billing/invoices
   */
  async getAll(filters?: InvoiceQueryFilters): Promise<InvoiceDto[]> {
    const params: Record<string, string | number> = {};

    if (filters) {
      if (filters.patientId && filters.patientId > 0) {
        params.patientId = filters.patientId;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.invoiceNumber && filters.invoiceNumber.trim()) {
        params.invoiceNumber = filters.invoiceNumber.trim();
      }
      if (filters.fromInvoiceDate) {
        params.fromInvoiceDate = filters.fromInvoiceDate;
      }
      if (filters.toInvoiceDate) {
        params.toInvoiceDate = filters.toInvoiceDate;
      }
    }

    const res = await apiClient.get<ApiResponse<InvoiceDto[]>>(
      API_ENDPOINTS.BILLING.INVOICES.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a single invoice by its ID.
   * GET /api/billing/invoices/{id}
   */
  async getById(id: number): Promise<InvoiceDto> {
    const res = await apiClient.get<ApiResponse<InvoiceDto>>(
      API_ENDPOINTS.BILLING.INVOICES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Invoice not found.');
  },

  /**
   * Retrieves a single invoice by its sequential Invoice Number (e.g. "INV000001").
   * GET /api/billing/invoices/number/{invoiceNumber}
   */
  async getByNumber(invoiceNumber: string): Promise<InvoiceDto> {
    const res = await apiClient.get<ApiResponse<InvoiceDto>>(
      API_ENDPOINTS.BILLING.INVOICES.BY_NUMBER(invoiceNumber)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || `Invoice ${invoiceNumber} not found.`);
  },

  /**
   * Retrieves the invoice associated with a specific PathologyLabOrder.
   * GET /api/billing/invoices/by-order/{orderId}
   */
  async getByOrder(orderId: number): Promise<InvoiceDto | null> {
    try {
      const res = await apiClient.get<ApiResponse<InvoiceDto>>(
        API_ENDPOINTS.BILLING.INVOICES.BY_ORDER(orderId)
      );
      return res.data.data || null;
    } catch (err: unknown) {
      // 404 means no invoice generated yet
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Creates a new invoice for a PathologyLabOrder.
   * POST /api/billing/invoices
   */
  async create(dto: CreateInvoiceRequest): Promise<InvoiceDto> {
    const payload = {
      pathologyLabOrderId: dto.pathologyLabOrderId,
      discountAmount: Number(dto.discountAmount || 0),
      notes: dto.notes ? dto.notes.trim() : null,
    };

    const res = await apiClient.post<ApiResponse<InvoiceDto>>(
      API_ENDPOINTS.BILLING.INVOICES.BASE,
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to generate invoice.');
  },

  /**
   * Cancels an invoice. Cancelling preserves historical audit data.
   * Invoices with payments cannot be cancelled.
   * POST /api/billing/invoices/{id}/cancel
   */
  async cancel(id: number, reason?: string | null): Promise<InvoiceDto> {
    const payload: CancelInvoiceRequest = {
      reason: reason ? reason.trim() : null,
    };

    const res = await apiClient.post<ApiResponse<InvoiceDto>>(
      API_ENDPOINTS.BILLING.INVOICES.CANCEL(id),
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to cancel invoice.');
  },
};

export default invoiceService;
