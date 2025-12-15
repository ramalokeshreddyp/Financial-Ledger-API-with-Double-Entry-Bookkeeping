
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-slate-900 dark:bg-indigo-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 transition-all duration-300">
                <i className="fas fa-scale-balanced text-white text-base sm:text-xl"></i>
              </div>
              <div className="ml-2 sm:ml-3 flex flex-col">
                <span className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Equilibrium</span>
                <span className="hidden xs:block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Ledger Core</span>
              </div>
            </Link>
            
            <div className="hidden md:ml-10 lg:ml-12 md:flex md:space-x-1">
              <NavLink 
                to="/" 
                className={({isActive}) => `px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/accounts" 
                className={({isActive}) => `px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                Ops
              </NavLink>
              <NavLink 
                to="/transactions" 
                className={({isActive}) => `px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                Audit
              </NavLink>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-4 lg:space-x-5">
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
              title="Toggle Dark Mode"
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xs sm:text-sm`}></i>
            </button>

            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] lg:text-xs font-bold text-slate-900 dark:text-slate-200">Admin</span>
              <span className="text-[9px] lg:text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                Verified
              </span>
            </div>
            
            {/* Mobile Nav Icons */}
            <div className="flex md:hidden items-center space-x-0.5">
               <NavLink to="/" className={({isActive}) => `p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                 <i className="fas fa-chart-pie text-base"></i>
               </NavLink>
               <NavLink to="/accounts" className={({isActive}) => `p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                 <i className="fas fa-vault text-base"></i>
               </NavLink>
               <NavLink to="/transactions" className={({isActive}) => `p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                 <i className="fas fa-list-check text-base"></i>
               </NavLink>
            </div>

            <div className="relative group hidden xs:block">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                <i className="fas fa-user-shield text-slate-600 dark:text-slate-300 text-xs sm:text-sm"></i>
              </div>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
