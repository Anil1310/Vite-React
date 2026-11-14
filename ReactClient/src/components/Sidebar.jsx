import React from 'react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  currentUser,
  chatbotEnabled,
  onLogout
}) {
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', roles: ['admin', 'teacher', 'student'] },
    { id: 'batches', label: 'Batches', icon: 'fa-layer-group', roles: ['admin', 'teacher', 'student'] },
    { id: 'students', label: 'Students', icon: 'fa-user-graduate', roles: ['admin', 'teacher'] },
    { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check', roles: ['admin', 'teacher', 'student'] },
    { id: 'fees', label: 'Fees & Ledger', icon: 'fa-receipt', roles: ['admin', 'student'] },
    { id: 'marks', label: 'Marks & Tests', icon: 'fa-chart-simple', roles: ['admin', 'teacher', 'student'] },
    { id: 'materials', label: 'Study Materials', icon: 'fa-folder-open', roles: ['admin', 'teacher', 'student'] },
    { id: 'teachers', label: 'Faculty Roster', icon: 'fa-chalkboard-user', roles: ['admin', 'teacher', 'student'] },
    { id: 'gallery', label: 'Results & Gallery', icon: 'fa-images', roles: ['admin', 'teacher', 'student'] },
    { id: 'links', label: 'Study Links Hub', icon: 'fa-bookmark', roles: ['admin', 'teacher', 'student'] },
    { id: 'feedback', label: 'Feedback Wall', icon: 'fa-comments', roles: ['admin', 'teacher', 'student'] }
  ];

  if (chatbotEnabled) {
    navItems.push({ id: 'chatbot', label: 'AI Doubt Solver', icon: 'fa-robot', roles: ['admin', 'teacher', 'student'] });
  }

  if (isAdmin) {
    navItems.push({ id: 'settings', label: 'Institute Settings', icon: 'fa-gear', roles: ['admin'] });
  }

  const allowedNav = navItems.filter(item => item.roles.includes(currentUser?.role || 'student'));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar"
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo / Header in Sidebar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
              <i className="fa-solid fa-atom text-lg"></i>
            </div>
            <div>
              <h2 className="font-heading font-black text-slate-900 dark:text-white text-base tracking-tight leading-none">
                DIVINE CLASSES
              </h2>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                JEE &bull; NEET &bull; BOARDS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {allowedNav.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-1'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-sm w-5 text-center ${isActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`}></i>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User status & Mobile Logout button */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className={`w-8 h-8 rounded-xl ${currentUser?.avatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
              {currentUser?.initials || (currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DC')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-none">
                {currentUser?.badge || currentUser?.role}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-900/40 transition"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
