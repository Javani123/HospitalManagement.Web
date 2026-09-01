/**
 * Accounting & General Ledger Types and DTO Contracts (F15).
 * Matches HospitalManagement.Api DTOs, models, and controllers exactly.
 */

export enum AccountType {
  Asset = 1,
  Liability = 2,
  Equity = 3,
  Revenue = 4,
  Expense = 5,
}

export type AccountTypeString =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Revenue'
  | 'Expense';

export enum JournalEntryStatus {
  Posted = 1,
  Reversed = 2,
}

export type JournalEntryStatusString = 'Posted' | 'Reversed';

export interface AccountDto {
  id: number;
  code: string;
  name: string;
  type: AccountTypeString | string;
  typeEnum: AccountType;
  description?: string | null;
  isSystemAccount: boolean;
  isActive: boolean;
  currentBalance: number;
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
}

export interface CreateAccountRequest {
  code: string;
  name: string;
  type: AccountType;
  description?: string | null;
}

export interface JournalEntryLineDto {
  id: number;
  journalEntryId: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  description?: string | null;
}

export interface JournalEntryDto {
  id: number;
  entryNumber: string;
  postingDate: string;
  sourceType: string;
  sourceId: number;
  description: string;
  totalAmount: number;
  status: JournalEntryStatusString | string;
  statusEnum: JournalEntryStatus;
  createdByStaffId?: number | null;
  createdByName?: string | null;
  reversalOfJournalEntryId?: number | null;
  createdAt: string;
  lines: JournalEntryLineDto[];
}

export interface GeneralLedgerLineDto {
  journalEntryId: number;
  entryNumber: string;
  postingDate: string;
  sourceType: string;
  sourceId: number;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface GeneralLedgerAccountDto {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
  transactions: GeneralLedgerLineDto[];
}

export interface GeneralLedgerReportDto {
  fromDate?: string | null;
  toDate?: string | null;
  accounts: GeneralLedgerAccountDto[];
  totalDebit: number;
  totalCredit: number;
}

export interface TrialBalanceAccountDto {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalanceDto {
  asOfDate: string;
  accounts: TrialBalanceAccountDto[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface AccountingSummaryDto {
  totalRevenue: number;
  totalDiscounts: number;
  netRevenue: number;
  accountsReceivableBalance: number;
  totalCashAndBank: number;
  doctorCommissionExpense: number;
  doctorCommissionPayable: number;
  totalJournalEntriesCount: number;
}

export interface JournalQueryFilters {
  sourceType?: string;
  sourceId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface LedgerQueryFilters {
  fromDate?: string;
  toDate?: string;
  accountId?: number;
}
