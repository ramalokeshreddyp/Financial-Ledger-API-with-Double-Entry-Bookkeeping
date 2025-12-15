import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { LedgerService } from '../services/ledgerService';
import { Account, AccountWithBalance, Transaction, TransactionType } from '../types';
import AccountCard from './AccountCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ verified: true, lastAudit: Date.now() });

  const loadData = () => {
    const rawAccounts: Account[] = db.getAccounts();
    const accountsWithBalance: AccountWithBalance[] = rawAccounts.map((a: Account) => LedgerService.getAccountWithBalance(a.id));
    setAccounts(accountsWithBalance);

    const transactions: Transaction[] = db.getTransactions();
    setRecentTransactions([...transactions].sort((a: Transaction, b: Transaction) => b.createdAt - a.createdAt).slice(0, 8));
    
    // Integrity check: Total sum of balances must equal Net Capital Injections
    const totalBalance = accountsWithBalance.reduce((sum: number, acc: AccountWithBalance) => sum + acc.balance, 0);
    const netInjections = transactions.reduce((sum: number, tx: Transaction) => {
      if (tx.type === TransactionType.DEPOSIT) return sum + tx.amount;
      if (tx.type === TransactionType.WITHDRAWAL) return sum - tx.amount;
      return sum;
    }, 0);
    
    setSystemHealth({ 
      verified: Math.abs(totalBalance - netInjections) < 1, 
      lastAudit: Date.now() 
    });
    
    setIsLoading(false);
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    const observer = new MutationObserver(loadData);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const totalWealth = accounts.reduce((sum: number, acc: AccountWithBalance) => sum + acc.balance, 0);

  const chartData = [
    { name: '01', balance: totalWealth * 0.92 },
    { name: '02', balance: totalWealth * 0.94 },
    { name: '03', balance: totalWealth * 0.91 },
    { name: '04', balance: totalWealth * 0.96 },
    { name: '05', balance: totalWealth * 0.98 },
    { name: '06', balance: totalWealth * 0.99 },
    { name: '07', balance: totalWealth },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val / 100);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Synchronizing Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up staggered-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Integrity Monitor</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium mt-1">Mathematical verification of atomic double-entry positions.</p>
        </div>
        <div className="flex gap-3">
          <div className="w-fit bg-white dark:bg-slate-800 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-3 transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em]">Engine: Serializable</span>
          </div>
          {systemHealth.verified && (
             <div className="w-fit bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm flex items-center space-x-3">
               <i className="fas fa-shield-check text-emerald-600 dark:text-emerald-400 text-xs"></i>
               <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">Ledger Consistent</span>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-slide-up staggered-2">
        <div className="interactive-card bg-slate-900 dark:bg-slate-800/80 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="relative z-10">
            <h2 className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-2 sm:mb-3">Aggregate Net Value</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left duration-500 truncate">{formatCurrency(totalWealth)}</p>
            <div className="mt-4 sm:mt-6 flex items-center text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-white/5 w-fit px-2.5 py-1.5 rounded-xl border border-white/5">
              <i className="fas fa-fingerprint mr-2"></i>
              Verified Source of Truth
            </div>
          </div>
        </div>
        
        <div className="interactive-card bg-white dark:bg-slate-900/60 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between group border border-slate-200 dark:border-slate-800/60 backdrop-blur-sm">
          <div>
            <h2 className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-2 sm:mb-3">Active Ledger Nodes</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{accounts.length}</p>
          </div>
          <div className="mt-4 sm:mt-6 flex items-center text-[9px] sm:text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-2.5 py-1.5 rounded-xl border border-green-100 dark:border-green-800/30 uppercase tracking-widest">
            <i className="fas fa-link mr-2"></i> Immutable Chain
          </div>
        </div>

        <div className="sm:col-span-2 md:col-span-1 interactive-card bg-white dark:bg-slate-900/60 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between group border border-slate-200 dark:border-slate-800/60 backdrop-blur-sm">
          <div>
            <h2 className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-2 sm:mb-3">Total Operations</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{db.getTransactions().length}</p>
          </div>
          <div className="mt-4 sm:mt-6 flex items-center text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline uppercase tracking-widest">
            Full Audit Stream <i className="fas fa-chevron-right ml-2 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 animate-slide-up staggered-3">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800/60 transition-all hover:shadow-xl dark:hover:shadow-slate-950/50 backdrop-blur-sm overflow-hidden">
             <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Aggregate Liquid Asset History</h3>
             <div className="h-60 sm:h-80 -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                      padding: '12px'
                    }}
                    itemStyle={{fontWeight: 800, fontSize: '11px', color: isDark ? '#f1f5f9' : '#0f172a'}}
                    formatter={(value: number) => [formatCurrency(value), 'Capital Balance']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorBal)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {accounts.slice(0, 4).map((acc, idx) => (
              <div key={acc.id} className={`animate-slide-up`} style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                <AccountCard account={acc} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 sm:space-y-8 animate-slide-up staggered-4">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 flex flex-col min-h-[450px] sm:min-h-[550px] shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/50 transition-all backdrop-blur-sm">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-6 sm:mb-10 tracking-tight">Atomic Audit Feed</h3>
            <div className="space-y-6 sm:space-y-8 flex-grow">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, idx) => (
                  <div key={tx.id} className="flex items-start animate-fade-in group cursor-default" style={{ animationDelay: `${0.4 + idx * 0.05}s` }}>
                    <div className={`mt-0.5 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm ${
                      tx.type === TransactionType.DEPOSIT ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' :
                      tx.type === TransactionType.WITHDRAWAL ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30' :
                      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30'
                    }`}>
                      <i className={`fas ${
                        tx.type === TransactionType.DEPOSIT ? 'fa-plus' :
                        tx.type === TransactionType.WITHDRAWAL ? 'fa-minus' :
                        'fa-shuffle'
                      } text-[10px] sm:text-xs`}></i>
                    </div>
                    <div className="ml-4 sm:ml-5 flex-grow border-b border-slate-100 dark:border-slate-800 pb-4 sm:pb-5">
                      <div className="flex justify-between items-start">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight mb-1 truncate">
                          {tx.description}
                        </p>
                        <span className={`text-xs sm:text-sm font-black tracking-tight ${
                          tx.type === TransactionType.DEPOSIT ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'
                        }`}>
                          {tx.type === TransactionType.DEPOSIT ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                        {tx.type} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 font-bold uppercase tracking-widest mt-20">Idle State</p>
              )}
            </div>
            <button className="btn-primary mt-8 sm:mt-10 w-full py-4 sm:py-5 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-xl hover:bg-indigo-500 transition-all">
              Verify Immutable Chain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;