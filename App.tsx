
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import AccountDetail from './components/AccountDetail';
import OperationsPanel from './components/OperationsPanel';
import AccountCard from './components/AccountCard';
import { db } from './services/db';
import { LedgerService } from './services/ledgerService';
import { AccountType } from './types';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const existingAccounts = db.getAccounts();
    if (existingAccounts.length === 0) {
      const init = async () => {
        try {
          const acc1 = await LedgerService.createAccount('sys-admin', AccountType.CHECKING, 'USD');
          const acc2 = await LedgerService.createAccount('sys-admin', AccountType.SAVINGS, 'USD');
          
          await LedgerService.deposit(acc1.id, 1000000, 'Genesis Capital Injection'); 
          await LedgerService.deposit(acc2.id, 500000, 'Foundation Reserve');
          await LedgerService.transfer(acc1.id, acc2.id, 250000, 'Initial Inter-Account Liquidity');
          
          setIsInitialized(true);
        } catch (e) {
          console.error("Ledger Initialization Failure", e);
        }
      };
      init();
    } else {
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center animate-fade-in p-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-500/10 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/20">
          <i className="fas fa-scale-balanced text-indigo-400 text-3xl sm:text-4xl animate-pulse"></i>
        </div>
        <h2 className="text-white font-black text-xl sm:text-2xl tracking-tighter uppercase tracking-[0.1em]">Bootstrapping Ledger</h2>
        <p className="text-slate-500 font-bold text-[10px] sm:text-xs mt-3 uppercase tracking-widest opacity-70">Initializing secure atomic engine</p>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
        <Navigation />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-slide-up staggered-1">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Ledger Operations</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-lg font-medium">Execute atomic deposits, withdrawals, and double-entry transfers with real-time balance validation.</p>
                  </div>
                </div>
                
                <div className="animate-slide-up staggered-2">
                  <OperationsPanel />
                </div>

                <div className="pt-4 sm:pt-8 animate-slide-up staggered-3">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
                     <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Managed Asset Accounts</h2>
                     <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-500 backdrop-blur-sm">
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Live Nodes: <span className="text-indigo-600 dark:text-indigo-400">{db.getAccounts().length}</span></span>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {db.getAccounts().map((acc, idx) => {
                         const accWithBal = LedgerService.getAccountWithBalance(acc.id);
                         return (
                           <div key={acc.id} className="animate-slide-up h-full" style={{ animationDelay: `${0.4 + idx * 0.1}s` }}>
                             <AccountCard account={accWithBal} />
                           </div>
                         );
                      })}
                   </div>
                </div>
              </div>
            } />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/transactions" element={<AuditLogView />} />
            <Route path="/system" element={<SystemArchitectureView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/60 py-8 sm:py-10 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 dark:text-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="opacity-70 text-center md:text-left">&copy; {new Date().getFullYear()} Equilibrium Ledger Core.</span>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
               <NavLink to="/system" className="hover:text-indigo-500 transition-colors">Docs</NavLink>
               <span className="flex items-center group cursor-default transition-all hover:text-emerald-500 dark:hover:text-emerald-400">
                 <i className="fas fa-shield-check text-[10px] sm:text-[12px] mr-2 sm:mr-3 text-emerald-500/40 group-hover:scale-125 transition-transform"></i> Verified
               </span>
               <span className="flex items-center group cursor-default transition-all hover:text-amber-500 dark:hover:text-amber-400">
                 <i className="fas fa-database text-[10px] sm:text-[12px] mr-2 sm:mr-3 text-amber-500/40 group-hover:scale-125 transition-transform"></i> Immutable
               </span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const SystemArchitectureView: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-10 sm:space-y-12 max-w-4xl mx-auto">
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Architecture</h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Design specifications for the Equilibrium Atomic Ledger Engine.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-microchip text-indigo-600 dark:text-indigo-400"></i>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">ACID Engine</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Every transaction is wrapped in a <strong>Serializable Snapshot</strong>. Before execution, the system state is cached. Any validation failure (e.g., overdraft) triggers an instant rollback to the cached state, ensuring <strong>Atomicity</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-diagram-project text-emerald-600 dark:text-emerald-400"></i>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Double-Entry Logic</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Funds never vanish. A transfer creates exactly two balanced entries: a <strong>Debit</strong> to the sender and a <strong>Credit</strong> to the receiver. The ledger sum invariant is verified at the sub-atomic level.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white space-y-8 mx-4 sm:mx-0 overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 opacity-5">
           <i className="fas fa-shield-halved text-[15rem]"></i>
        </div>
        <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center relative z-10">
          <i className="fas fa-database mr-3 text-indigo-400"></i>
          Data Integrity Model
        </h3>
        <div className="space-y-6 relative z-10">
          <div className="flex items-start space-x-4 sm:space-x-6">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold italic">01</div>
            <div>
              <p className="font-bold text-indigo-300 uppercase tracking-widest text-[9px] sm:text-[10px] mb-1">Immutability</p>
              <p className="text-xs sm:text-sm text-white/60">Ledger entries are strictly append-only. There is no 'UPDATE' or 'DELETE' logic in the core service layer, preserving a permanent audit trail.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 sm:space-x-6">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold italic">02</div>
            <div>
              <p className="font-bold text-indigo-300 uppercase tracking-widest text-[9px] sm:text-[10px] mb-1">On-Demand Calculation</p>
              <p className="text-xs sm:text-sm text-white/60">Balances are the derived truth of the ledger. By calculating balance from the sum of all entries for every request, we eliminate phantom wealth errors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditLogView: React.FC = () => {
  const transactions = db.getTransactions().sort((a,b) => b.createdAt - a.createdAt);

  return (
    <div className="animate-fade-in space-y-8 sm:space-y-10">
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/50 animate-slide-up staggered-1 backdrop-blur-sm">
        <div className="p-6 sm:p-12 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/20 dark:bg-slate-800/20">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Global Audit Log</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">Immutable chronological record of all system-wide financial movements.</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="btn-primary group flex items-center space-x-4 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all shadow-sm"
          >
            <i className="fas fa-print text-sm opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all"></i>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em]">Export Verified PDF</span>
          </button>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <th className="px-8 sm:px-12 py-6 sm:py-7 border-b border-slate-100 dark:border-slate-800">Verified Ptr</th>
                <th className="px-8 sm:px-12 py-6 sm:py-7 border-b border-slate-100 dark:border-slate-800">Clock</th>
                <th className="px-8 sm:px-12 py-6 sm:py-7 border-b border-slate-100 dark:border-slate-800">Operation</th>
                <th className="px-8 sm:px-12 py-6 sm:py-7 border-b border-slate-100 dark:border-slate-800">Status</th>
                <th className="px-8 sm:px-12 py-6 sm:py-7 border-b border-slate-100 dark:border-slate-800">Narrative</th>
                <th className="px-8 sm:px-12 py-6 sm:py-7 border-b border-slate-100 dark:border-slate-800 text-right">Value Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <tr key={tx.id} className="table-row-hover hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-300 group animate-fade-in" style={{ animationDelay: `${0.2 + idx * 0.05}s` }}>
                    <td className="px-8 sm:px-12 py-6 sm:py-8">
                      <div className="flex items-center space-x-4">
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-500 group-hover:scale-125 transition-all"></div>
                         <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600 font-bold tracking-tight uppercase group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">#{tx.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 sm:px-12 py-6 sm:py-8 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                          {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 sm:px-12 py-6 sm:py-8">
                      <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all group-hover:scale-105 ${
                        tx.type === 'TRANSFER' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30' :
                        tx.type === 'DEPOSIT' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30' :
                        'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-8 sm:px-12 py-6 sm:py-8">
                      <span className="flex items-center text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">
                        <i className="fas fa-check-circle mr-2 text-[14px] opacity-70"></i>
                        Vrfy
                      </span>
                    </td>
                    <td className="px-8 sm:px-12 py-6 sm:py-8">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic max-w-[200px] truncate opacity-80 group-hover:opacity-100 transition-opacity">“{tx.description}”</p>
                    </td>
                    <td className={`px-8 sm:px-12 py-6 sm:py-8 text-right font-black text-sm sm:text-[16px] tracking-tight ${tx.type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : ''}${(tx.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center animate-scale-in">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-700 shadow-inner">
                        <i className="fas fa-fingerprint text-slate-200 dark:text-slate-700 text-4xl"></i>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em]">Sequence state: Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Subtle overflow indicators for mobile */}
          <div className="md:hidden absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-slate-50/20 dark:from-slate-900/20 to-transparent pointer-events-none"></div>
          <div className="md:hidden absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-slate-50/20 dark:from-slate-900/20 to-transparent pointer-events-none"></div>
        </div>
        <div className="p-8 sm:p-10 bg-slate-50/50 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800">
           <p className="text-[8px] sm:text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.6em] transition-all hover:tracking-[0.8em] cursor-default">--- End of Verified Audit Chain ---</p>
        </div>
      </div>
    </div>
  );
};

export default App;
