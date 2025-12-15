
import React from 'react';
import { AccountWithBalance } from '../types';
import { Link } from 'react-router-dom';

interface AccountCardProps {
  account: AccountWithBalance;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const isChecking = account.type === 'CHECKING';

  return (
    <Link 
      to={`/accounts/${account.id}`}
      className="block group h-full"
    >
      <div className="interactive-card relative h-full bg-white dark:bg-slate-900/60 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden backdrop-blur-sm">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 dark:bg-indigo-900/10 rounded-full opacity-50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:scale-[2.5] transition-all duration-1000"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-500 ${isChecking ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 group-hover:rotate-6' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 group-hover:-rotate-6'}`}>
              <i className={`fas ${isChecking ? 'fa-wallet' : 'fa-vault'} text-lg sm:text-xl`}></i>
            </div>
            <div className={`text-[9px] sm:text-[10px] font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full tracking-widest uppercase border transition-all duration-500 group-hover:shadow-md ${
              account.status === 'ACTIVE' 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600' 
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'
            }`}>
              {account.status}
            </div>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              {account.type} Position
            </h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-500 truncate">
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>
          
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.25em] mb-1">Node Reference</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors duration-500">
                •••• {account.id.slice(-4)}
              </span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:translate-x-2 group-hover:shadow-lg">
              <i className="fas fa-arrow-right text-[10px] sm:text-[12px]"></i>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AccountCard;
