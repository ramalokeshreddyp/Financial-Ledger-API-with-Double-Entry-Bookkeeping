
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN'
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  currency: string;
  status: AccountStatus;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  sourceAccountId?: string;
  destinationAccountId?: string;
  amount: number; // Stored in cents/minimal unit (integer)
  currency: string;
  status: TransactionStatus;
  description: string;
  createdAt: number;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  transactionId: string;
  entryType: EntryType;
  amount: number; // Negative for DEBIT, Positive for CREDIT
  timestamp: number;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

export interface TransactionWithDetails extends Transaction {
  ledgerEntries: LedgerEntry[];
}
