
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LedgerService } from '../services/ledgerService';
import { db } from '../services/db';
import { AccountWithBalance, LedgerEntry, EntryType } from '../types';

const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountWithBalance | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const updateData = () => {
      try {
        const acc = LedgerService.getAccountWithBalance(id);
        setAccount(acc);
        const entries = db.getLedgerForAccount(id);
        setLedger(entries.sort((a, b) => b.timestamp - a.timestamp));
      } catch (e: any) {
        setError(e.message || "Account record not found.");
      }
    };
    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 sm:mt-20 p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl sm:rounded-[3rem] shadow-xl animate-slide-up">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-circle-exclamation text-2xl sm:text-3xl"></i>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Audit Error</h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-8 font-medium">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-slate-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!account) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-100 dark:border-slate-800 border-t-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-slide-up px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center space-x-3 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-200 dark:group-hover:border-indigo-500 group-hover:shadow-sm transition-all">
            <i className="fas fa-arrow-left text-[10px] sm:text-xs"></i>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">Back to Ledger</span>
        </button>

        <div className="flex items-center space-x-3">
           <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status:</span>
           <span className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
             <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
             {account.status}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 dark:bg-indigo-950 rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl group border border-white/5">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
              <i className="fas fa-building-columns text-[8rem] sm:text-[12rem]"></i>
            </div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-10">
                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 rounded-lg text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.2em] border border-white/10 backdrop-blur-sm">
                  {account.type} ACCOUNT NODE
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-white/40 tracking-tight truncate max-w-[150px]">UID: {account.id}</div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em]">Capital Position</h1>
                <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none transition-all duration-300 group-hover:translate-x-1 break-all sm:break-normal">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className="mt-8 sm:mt-14 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="btn-primary flex-1 sm:flex-initial px-6 py-3 sm:px-7 sm:py-4 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white rounded-xl sm:rounded-2xl transition-all font-bold text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <i className="fas fa-file-invoice mr-2 sm:mr-2.5 opacity-70"></i> Full Report
                </button>
                <button className="btn-primary flex-1 sm:flex-initial px-6 py-3 sm:px-7 sm:py-4 bg-white/10 hover:bg-rose-600 hover:text-white text-white rounded-xl sm:rounded-2xl transition-all font-bold text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-lock mr-2 sm:mr-2.5 opacity-70"></i> Freeze
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 flex flex-col justify-center space-y-6 sm:space-y-8 shadow-sm backdrop-blur-sm">
          <div>
            <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 sm:mb-6">Metrics</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audit Status</span>
                <span className="flex items-center text-[10px] sm:text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                   <i className="fas fa-shield-check mr-1.5"></i> PASS
                </span>
              </div>
              <div className="flex justify-between items-center p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Initialized</span>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{new Date(account.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Currency</span>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{account.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 backdrop-blur-sm">
        <div className="px-6 sm:px-10 py-6 sm:py-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-slate-50/20 dark:bg-slate-800/20">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Immutable Ledger</h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.25em]">Deterministic Chain</p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/50 dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-700 overflow-x-auto scrollbar-hide">
             <button className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-extrabold bg-white dark:bg-slate-700 text-indigo-600 dark:text-white rounded-lg sm:rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 transition-all uppercase tracking-widest">Global</button>
             <button className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all uppercase tracking-widest">Inflow</button>
             <button className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all uppercase tracking-widest">Outflow</button>
          </div>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px] sm:min-w-0">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 sm:px-12 py-5 sm:py-6">Clock</th>
                <th className="px-6 sm:px-12 py-5 sm:py-6">Reference</th>
                <th className="px-6 sm:px-12 py-5 sm:py-6">Type</th>
                <th className="px-6 sm:px-12 py-5 sm:py-6 text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ledger.length > 0 ? (
                ledger.map(entry => {
                  const isCredit = entry.entryType === EntryType.CREDIT;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all duration-300 group">
                      <td className="px-6 sm:px-12 py-5 sm:py-7 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200">
                            {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[9px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 sm:px-12 py-5 sm:py-7 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isCredit ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'} group-hover:scale-125 transition-transform`}></div>
                          <span className="font-mono text-[9px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            #{entry.transactionId.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 sm:px-12 py-5 sm:py-7 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-[0.15em] uppercase border ${
                          isCredit ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {entry.entryType}
                        </span>
                      </td>
                      <td className={`px-6 sm:px-12 py-5 sm:py-7 whitespace-nowrap text-sm sm:text-[16px] font-black text-right tracking-tight ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'
                      }`}>
                        {isCredit ? '+' : ''}{formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-12 py-16 sm:py-24 text-center">
                    <div className="flex flex-col items-center animate-fade-in">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                        <i className="fas fa-fingerprint text-slate-200 dark:text-slate-700 text-2xl sm:text-3xl"></i>
                      </div>
                      <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">No historical ledger sequence.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 sm:px-12 py-6 sm:py-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[8px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">End of Chain</span>
          <div className="flex items-center space-x-6">
            <button className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">Prev</button>
            <button className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
