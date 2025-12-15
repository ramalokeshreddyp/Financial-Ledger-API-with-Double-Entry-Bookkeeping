
import React, { useState, useEffect } from 'react';
import { LedgerService } from '../services/ledgerService';
import { db } from '../services/db';
import { Account, AccountType } from '../types';

const OperationsPanel: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'CREATE_ACCOUNT'>('TRANSFER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [sourceAcc, setSourceAcc] = useState('');
  const [destAcc, setDestAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>(AccountType.CHECKING);

  useEffect(() => {
    refreshAccounts();
  }, []);

  const refreshAccounts = () => {
    setAccounts(db.getAccounts());
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const amountCents = Math.round(parseFloat(amount) * 100);

    try {
      if (activeTab === 'TRANSFER') {
        if (!sourceAcc || !destAcc) throw new Error("Verification Error: Select both source and destination nodes.");
        await LedgerService.transfer(sourceAcc, destAcc, amountCents, description);
        setMessage({ type: 'success', text: 'Transfer successfully committed to double-entry ledger.' });
      } else if (activeTab === 'DEPOSIT') {
        if (!destAcc) throw new Error("Verification Error: Destination account reference required.");
        await LedgerService.deposit(destAcc, amountCents, description);
        setMessage({ type: 'success', text: 'Capital injection verified and ledger entry finalized.' });
      } else if (activeTab === 'WITHDRAWAL') {
        if (!sourceAcc) throw new Error("Verification Error: Debit source account reference required.");
        await LedgerService.withdraw(sourceAcc, amountCents, description);
        setMessage({ type: 'success', text: 'Withdrawal authorized. Asset movement recorded.' });
      } else if (activeTab === 'CREATE_ACCOUNT') {
        const newAcc = await LedgerService.createAccount('sys-admin', newAccType, 'USD');
        setMessage({ type: 'success', text: `New node initialized: ••••${newAcc.id.slice(-4)}` });
        refreshAccounts();
      }
      resetForm();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Atomic transaction failed. System state rolled back.' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'TRANSFER', icon: 'fa-right-left' },
    { id: 'DEPOSIT', icon: 'fa-arrow-down' },
    { id: 'WITHDRAWAL', icon: 'fa-arrow-up' },
    { id: 'CREATE_ACCOUNT', icon: 'fa-plus' }
  ] as const;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden animate-slide-up backdrop-blur-sm">
      <div className="flex bg-slate-50/80 dark:bg-slate-800/50 p-1.5 sm:p-2.5 gap-1 sm:gap-1.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setMessage(null); }}
            className={`flex-1 min-w-[85px] py-4 sm:py-5 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all duration-500 rounded-xl sm:rounded-[1.5rem] ${
              activeTab === tab.id 
                ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-100 dark:ring-slate-700 scale-[1.03] -translate-y-0.5' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <i className={`fas ${tab.icon} text-[11px] sm:text-[13px] transition-transform duration-300 ${activeTab === tab.id ? 'scale-125' : ''}`}></i>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.25em] whitespace-nowrap">
              {tab.id.replace('_', ' ').split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-12">
        <form onSubmit={handleAction} className="space-y-6 sm:space-y-10">
          {message && (
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] animate-scale-in duration-500 border flex items-start space-x-3 sm:space-x-5 text-xs sm:text-[13px] font-bold ${
              message.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30 shadow-sm' 
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border-rose-100 dark:border-rose-800/30 shadow-sm'
            }`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-rose-100 dark:bg-rose-800'
              }`}>
                <i className={`fas ${message.type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'} text-[10px]`}></i>
              </div>
              <p className="leading-relaxed py-0.5 sm:py-1">{message.text}</p>
            </div>
          )}

          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'CREATE_ACCOUNT' ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3 mb-2 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-2 animate-bounce">
                     <i className="fas fa-fingerprint text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl"></i>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Node Setup</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 max-w-xs uppercase tracking-[0.2em]">Initialization Parameters</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <button 
                    type="button"
                    onClick={() => setNewAccType(AccountType.CHECKING)}
                    className={`btn-primary relative p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 transition-all text-left group overflow-hidden ${newAccType === AccountType.CHECKING ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20 shadow-lg' : 'border-slate-100 dark:border-slate-800 grayscale opacity-60 hover:opacity-100'}`}
                  >
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all duration-500">
                        <i className="fas fa-wallet text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors"></i>
                      </div>
                      <div className="font-black text-slate-900 dark:text-white text-[10px] sm:text-xs mb-1 sm:mb-1.5 uppercase tracking-widest">Checking</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight opacity-70">Daily Liquidity</div>
                    </div>
                    {newAccType === AccountType.CHECKING && <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-indigo-600 dark:text-indigo-400 animate-scale-in"><i className="fas fa-circle-check"></i></div>}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewAccType(AccountType.SAVINGS)}
                    className={`btn-primary relative p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 transition-all text-left group overflow-hidden ${newAccType === AccountType.SAVINGS ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20 shadow-lg' : 'border-slate-100 dark:border-slate-800 grayscale opacity-60 hover:opacity-100'}`}
                  >
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 transition-all duration-500">
                        <i className="fas fa-vault text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors"></i>
                      </div>
                      <div className="font-black text-slate-900 dark:text-white text-[10px] sm:text-xs mb-1 sm:mb-1.5 uppercase tracking-widest">Savings</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight opacity-70">Deterministic Reserve</div>
                    </div>
                    {newAccType === AccountType.SAVINGS && <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-emerald-600 dark:text-emerald-400 animate-scale-in"><i className="fas fa-circle-check"></i></div>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {(activeTab === 'TRANSFER' || activeTab === 'WITHDRAWAL') && (
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1 sm:ml-2">Debit Source</label>
                      <div className="relative group">
                        <select
                          required
                          value={sourceAcc}
                          onChange={(e) => setSourceAcc(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-[1.5rem] px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-[13px] font-black text-slate-900 dark:text-white focus:ring-8 focus:ring-indigo-500/5 dark:focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer uppercase tracking-widest shadow-sm"
                        >
                          <option value="" className="font-bold dark:bg-slate-900 text-slate-400">Select source...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="font-black dark:bg-slate-900">
                              {acc.type} (•••• {acc.id.slice(-4)})
                            </option>
                          ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none transition-all"></i>
                      </div>
                    </div>
                  )}

                  {(activeTab === 'TRANSFER' || activeTab === 'DEPOSIT') && (
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1 sm:ml-2">Credit Target</label>
                      <div className="relative group">
                        <select
                          required
                          value={destAcc}
                          onChange={(e) => setDestAcc(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-[1.5rem] px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-[13px] font-black text-slate-900 dark:text-white focus:ring-8 focus:ring-indigo-500/5 dark:focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer uppercase tracking-widest shadow-sm"
                        >
                          <option value="" className="font-bold dark:bg-slate-900 text-slate-400">Select target...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="font-black dark:bg-slate-900">
                              {acc.type} (•••• {acc.id.slice(-4)})
                            </option>
                          ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none transition-all"></i>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1 sm:ml-2">Magnitude (USD)</label>
                    <div className="relative group">
                      <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 shadow-inner">$</div>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-[1.5rem] pl-14 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-5 text-sm sm:text-[14px] font-black text-slate-900 dark:text-white focus:ring-8 focus:ring-indigo-500/5 dark:focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1 sm:ml-2">Narrative</label>
                    <div className="relative group">
                      <input
                        required
                        type="text"
                        placeholder="Audit reference"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-[1.5rem] px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white focus:ring-8 focus:ring-indigo-500/5 dark:focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 sm:pt-6">
            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 sm:py-6 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl sm:rounded-[1.8rem] shadow-xl transition-all duration-500 flex items-center justify-center gap-3 sm:gap-4 group active:scale-[0.94]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-[2px] sm:border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-fingerprint text-base sm:text-lg opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all"></i>
                  <span>Authorize Transaction</span>
                </>
              )}
            </button>
            <div className="mt-6 sm:mt-8 flex items-center justify-center space-x-2 sm:space-x-3 opacity-20">
               <span className="h-[1px] w-6 sm:w-12 bg-slate-400 dark:bg-slate-600"></span>
               <p className="text-[7px] sm:text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.5em] text-center">
                 Verified Atomic Core
               </p>
               <span className="h-[1px] w-6 sm:w-12 bg-slate-400 dark:bg-slate-600"></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperationsPanel;
