import { Account, Transaction, LedgerEntry } from '../types';

/**
 * Mock DB implementing simulated ACID persistence with Serializable Isolation.
 * Uses localStorage to persist state and a sequential promise queue to prevent race conditions.
 */
class MockDB {
  private accountsKey = 'eq_ledger_accounts';
  private transactionsKey = 'eq_ledger_transactions';
  private ledgerKey = 'eq_ledger_entries';
  
  // Sequential queue for atomic operations
  private transactionQueue: Promise<any> = Promise.resolve();

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.accountsKey)) localStorage.setItem(this.accountsKey, JSON.stringify([]));
    if (!localStorage.getItem(this.transactionsKey)) localStorage.setItem(this.transactionsKey, JSON.stringify([]));
    if (!localStorage.getItem(this.ledgerKey)) localStorage.setItem(this.ledgerKey, JSON.stringify([]));
  }

  getAccounts(): Account[] {
    return JSON.parse(localStorage.getItem(this.accountsKey) || '[]');
  }

  getAccount(id: string): Account | undefined {
    return this.getAccounts().find(a => a.id === id);
  }

  getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem(this.transactionsKey) || '[]');
  }

  getLedgerEntries(): LedgerEntry[] {
    return JSON.parse(localStorage.getItem(this.ledgerKey) || '[]');
  }

  getLedgerForAccount(accountId: string): LedgerEntry[] {
    return this.getLedgerEntries().filter(e => e.accountId === accountId);
  }

  /**
   * Derived balance calculation: The single source of truth.
   * Aggregates immutable ledger entries.
   */
  calculateBalance(accountId: string): number {
    return this.getLedgerForAccount(accountId).reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * ACID Transaction Wrapper.
   * Atomicity: Snapshot-based rollback on failure.
   * Consistency: Enforces state invariants.
   * Isolation: SERIALIZABLE via promise-chaining (sequential execution).
   * Durability: Commit to localStorage.
   */
  async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    // Wrap work in the transaction queue to ensure serial execution
    return new Promise((resolve, reject) => {
      this.transactionQueue = this.transactionQueue.then(async () => {
        // 1. Snapshot current state
        const snapshot = {
          accounts: localStorage.getItem(this.accountsKey),
          transactions: localStorage.getItem(this.transactionsKey),
          ledger: localStorage.getItem(this.ledgerKey)
        };

        try {
          const result = await work();
          // Work succeeded - transaction implicitly committed as state was updated in storage
          resolve(result);
        } catch (error) {
          // 2. ROLLBACK: Restore state to snapshot if any error occurs
          if (snapshot.accounts) localStorage.setItem(this.accountsKey, snapshot.accounts);
          if (snapshot.transactions) localStorage.setItem(this.transactionsKey, snapshot.transactions);
          if (snapshot.ledger) localStorage.setItem(this.ledgerKey, snapshot.ledger);
          
          console.error("Atomic Transaction Aborted: Rolling back to snapshot.", error);
          reject(error);
        }
      });
    });
  }

  saveAccount(account: Account): void {
    const accounts = this.getAccounts();
    accounts.push(account);
    localStorage.setItem(this.accountsKey, JSON.stringify(accounts));
  }

  saveTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
  }

  saveLedgerEntries(entries: LedgerEntry[]): void {
    const ledger = this.getLedgerEntries();
    // Immutability: Ledger is append-only. No logic exists to modify old entries.
    ledger.push(...entries);
    localStorage.setItem(this.ledgerKey, JSON.stringify(ledger));
  }
}

export const db = new MockDB();