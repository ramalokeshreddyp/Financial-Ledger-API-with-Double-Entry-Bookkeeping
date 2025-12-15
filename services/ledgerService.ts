import { db } from './db';
import { 
  Account, 
  AccountType, 
  AccountStatus, 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  LedgerEntry, 
  EntryType,
  AccountWithBalance
} from '../types';

/**
 * Service layer implementing high-integrity financial operations.
 * Coordinates between the UI and the transactional data layer.
 */
export class LedgerService {
  
  static async createAccount(userId: string, type: AccountType, currency: string = 'USD'): Promise<Account> {
    const account: Account = {
      id: crypto.randomUUID(),
      userId,
      type,
      currency,
      status: AccountStatus.ACTIVE,
      createdAt: Date.now()
    };
    db.saveAccount(account);
    return account;
  }

  static getAccountWithBalance(accountId: string): AccountWithBalance {
    const account = db.getAccount(accountId);
    if (!account) throw new Error(`Account entity not found: ${accountId}`);
    const balance = db.calculateBalance(accountId);
    return { ...account, balance };
  }

  static async deposit(accountId: string, amount: number, description: string): Promise<Transaction> {
    if (amount <= 0) throw new Error("Financial Error: Deposit magnitude must be positive.");
    
    return await db.executeInTransaction(async () => {
      const account = db.getAccount(accountId);
      if (!account) throw new Error("Target node does not exist.");
      if (account.status !== AccountStatus.ACTIVE) throw new Error("Account is frozen/inactive.");

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: TransactionType.DEPOSIT,
        destinationAccountId: accountId,
        amount,
        currency: account.currency,
        status: TransactionStatus.COMPLETED,
        description,
        createdAt: Date.now()
      };

      const entry: LedgerEntry = {
        id: crypto.randomUUID(),
        accountId: accountId,
        transactionId: transaction.id,
        entryType: EntryType.CREDIT,
        amount: amount,
        timestamp: Date.now()
      };

      db.saveTransaction(transaction);
      db.saveLedgerEntries([entry]);
      return transaction;
    });
  }

  static async withdraw(accountId: string, amount: number, description: string): Promise<Transaction> {
    if (amount <= 0) throw new Error("Financial Error: Withdrawal magnitude must be positive.");

    return await db.executeInTransaction(async () => {
      const account = db.getAccount(accountId);
      if (!account) throw new Error("Source node does not exist.");
      if (account.status !== AccountStatus.ACTIVE) throw new Error("Account is frozen/inactive.");

      // CRITICAL: Overdraft check within atomic boundary
      const currentBalance = db.calculateBalance(accountId);
      if (currentBalance < amount) {
        throw new Error(`Insufficient Funds: Attempted debit of ${(amount/100).toFixed(2)} exceeds current balance of ${(currentBalance/100).toFixed(2)}`);
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: TransactionType.WITHDRAWAL,
        sourceAccountId: accountId,
        amount,
        currency: account.currency,
        status: TransactionStatus.COMPLETED,
        description,
        createdAt: Date.now()
      };

      const entry: LedgerEntry = {
        id: crypto.randomUUID(),
        accountId: accountId,
        transactionId: transaction.id,
        entryType: EntryType.DEBIT,
        amount: -amount,
        timestamp: Date.now()
      };

      db.saveTransaction(transaction);
      db.saveLedgerEntries([entry]);
      return transaction;
    });
  }

  /**
   * Implements strict Double-Entry Transfer.
   * Ensures that value is conserved (sum of entries is exactly zero).
   */
  static async transfer(sourceId: string, destId: string, amount: number, description: string): Promise<Transaction> {
    if (amount <= 0) throw new Error("Financial Error: Transfer magnitude must be positive.");
    if (sourceId === destId) throw new Error("Logical Error: Circular transfers are invalid.");

    return await db.executeInTransaction(async () => {
      const source = db.getAccount(sourceId);
      const dest = db.getAccount(destId);

      if (!source || !dest) throw new Error("One or more participating nodes do not exist.");
      if (source.status !== AccountStatus.ACTIVE || dest.status !== AccountStatus.ACTIVE) {
        throw new Error("Cannot process: Account status is not ACTIVE.");
      }

      // 1. Pre-flight balance check
      const sourceBalance = db.calculateBalance(sourceId);
      if (sourceBalance < amount) {
        throw new Error(`Transfer Aborted: Insufficient liquidity at source node. Available: ${(sourceBalance/100).toFixed(2)}`);
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: TransactionType.TRANSFER,
        sourceAccountId: sourceId,
        destinationAccountId: destId,
        amount,
        currency: source.currency,
        status: TransactionStatus.COMPLETED,
        description,
        createdAt: Date.now()
      };

      // 2. Generate Balanced Atomic Entries
      const debitEntry: LedgerEntry = {
        id: crypto.randomUUID(),
        accountId: sourceId,
        transactionId: transaction.id,
        entryType: EntryType.DEBIT,
        amount: -amount,
        timestamp: Date.now()
      };

      const creditEntry: LedgerEntry = {
        id: crypto.randomUUID(),
        accountId: destId,
        transactionId: transaction.id,
        entryType: EntryType.CREDIT,
        amount: amount,
        timestamp: Date.now()
      };

      // 3. Mathematical Invariant Verification
      if (debitEntry.amount + creditEntry.amount !== 0) {
        throw new Error("Systemic Error: Zero-sum double-entry invariant violated.");
      }

      db.saveTransaction(transaction);
      db.saveLedgerEntries([debitEntry, creditEntry]);

      return transaction;
    });
  }
}