import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <i className="fa-solid fa-graduation-cap text-indigo-600 dark:text-indigo-400"></i>
          <span>Divine Classes Institute Management System</span>
        </div>
        <p className="font-sans text-[11px] sm:text-xs tracking-tight">
          &copy; 2026 Designed &amp; Engineered by Dev. Anil Kumar Chahar &bull; 8126390611 &bull; v2.5 Cloud Edition
        </p>
      </div>
    </footer>
  );
}
