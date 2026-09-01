import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  AccountDto,
  CreateAccountRequest,
  JournalEntryDto,
  GeneralLedgerReportDto,
  TrialBalanceDto,
  AccountingSummaryDto,
  JournalQueryFilters,
  LedgerQueryFilters,
  AccountType,
} from '../types/accounting';

/**
 * Service for Accounting & General Ledger (F15).
 * Connects directly to backend AccountingController (/api/accounting).
 */
export const accountingService = {
  /**
   * Retrieves active Chart of Accounts with live computed balances.
   * GET /api/accounting/accounts
   */
  async getAccounts(type?: AccountType | number | string): Promise<AccountDto[]> {
    const params: Record<string, string | number> = {};
    if (type !== undefined && type !== null && type !== 'ALL') {
      params.type = type;
    }

    const res = await apiClient.get<ApiResponse<AccountDto[]>>(
      API_ENDPOINTS.ACCOUNTING.ACCOUNTS.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves account details by ID.
   * GET /api/accounting/accounts/{id}
   */
  async getAccountById(id: number): Promise<AccountDto> {
    const res = await apiClient.get<ApiResponse<AccountDto>>(
      API_ENDPOINTS.ACCOUNTING.ACCOUNTS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || `Account with ID ${id} was not found.`);
  },

  /**
   * Creates a new custom Chart of Accounts entry.
   * POST /api/accounting/accounts
   */
  async createAccount(dto: CreateAccountRequest): Promise<AccountDto> {
    const payload = {
      code: dto.code.trim(),
      name: dto.name.trim(),
      type: Number(dto.type),
      description: dto.description ? dto.description.trim() : null,
    };

    const res = await apiClient.post<ApiResponse<AccountDto>>(
      API_ENDPOINTS.ACCOUNTING.ACCOUNTS.BASE,
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create account.');
  },

  /**
   * Retrieves journal entries with optional filtering and pagination.
   * GET /api/accounting/journals
   */
  async getJournalEntries(filters?: JournalQueryFilters): Promise<JournalEntryDto[]> {
    const params: Record<string, string | number> = {};

    if (filters) {
      if (filters.sourceType && filters.sourceType !== 'ALL') {
        params.sourceType = filters.sourceType;
      }
      if (filters.sourceId && filters.sourceId > 0) {
        params.sourceId = filters.sourceId;
      }
      if (filters.fromDate) {
        params.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        params.toDate = filters.toDate;
      }
      if (filters.page && filters.page > 0) {
        params.page = filters.page;
      }
      if (filters.pageSize && filters.pageSize > 0) {
        params.pageSize = filters.pageSize;
      }
    }

    const res = await apiClient.get<ApiResponse<JournalEntryDto[]>>(
      API_ENDPOINTS.ACCOUNTING.JOURNALS.BASE,
      { params }
    );
    return res.data.data || [];
  },

  /**
   * Retrieves full journal entry details with double-entry lines by ID.
   * GET /api/accounting/journals/{id}
   */
  async getJournalEntryById(id: number): Promise<JournalEntryDto> {
    const res = await apiClient.get<ApiResponse<JournalEntryDto>>(
      API_ENDPOINTS.ACCOUNTING.JOURNALS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || `Journal entry with ID ${id} was not found.`);
  },

  /**
   * Generates General Ledger report by account with running balances.
   * GET /api/accounting/ledger
   */
  async getGeneralLedger(filters?: LedgerQueryFilters): Promise<GeneralLedgerReportDto> {
    const params: Record<string, string | number> = {};

    if (filters) {
      if (filters.fromDate) {
        params.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        params.toDate = filters.toDate;
      }
    }

    const res = await apiClient.get<ApiResponse<GeneralLedgerReportDto>>(
      API_ENDPOINTS.ACCOUNTING.LEDGER,
      { params }
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to generate General Ledger report.');
  },

  /**
   * Generates real-time Trial Balance verifying ledger debit/credit equilibrium.
   * GET /api/accounting/trial-balance
   */
  async getTrialBalance(asOfDate?: string): Promise<TrialBalanceDto> {
    const params: Record<string, string> = {};
    if (asOfDate) {
      params.asOfDate = asOfDate;
    }

    const res = await apiClient.get<ApiResponse<TrialBalanceDto>>(
      API_ENDPOINTS.ACCOUNTING.TRIAL_BALANCE,
      { params }
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to generate Trial Balance.');
  },

  /**
   * Retrieves executive accounting KPIs and financial metrics.
   * GET /api/accounting/summary
   */
  async getSummary(): Promise<AccountingSummaryDto> {
    const res = await apiClient.get<ApiResponse<AccountingSummaryDto>>(
      API_ENDPOINTS.ACCOUNTING.SUMMARY
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to retrieve accounting summary.');
  },
};

export default accountingService;
