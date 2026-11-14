import React from 'react';

export default function MobileBottomNav({ activeTab, onSelectTab, onOpenMenu, currentUser }) {
  const isStudent = currentUser?.role === 'student';

  const items = [
    { id: 'dashboard', label: 'Home', icon: 'fa-house' },
    { id: 'batches', label: 'Batches', icon: 'fa-layer-group' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check' },
    { id: isStudent ? 'fees' : 'marks', label: isStudent ? 'Fees' : 'Marks', icon: isStudent ? 'fa-receipt' : 'fa-chart-simple' }
  ];

  return (
    <div
      id="mobile-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors select-none"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {items.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-base mb-1`}></i>
            <span className="text-[10px] leading-none">{item.label}</span>
          </button>
        );
      })}

      {/* Menu Drawer Toggle */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <i className="fa-solid fa-bars text-base mb-1"></i>
        <span className="text-[10px] leading-none">Menu</span>
      </button>
    </div>
  );
}
