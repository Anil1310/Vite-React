import React from 'react';

export default function NotificationDropdown({ notifications = [], onClose, onSelectTab, onMarkAllRead }) {
  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-bell text-indigo-600 dark:text-indigo-400"></i>
          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-semibold">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <i className="fa-solid fa-bell-slash text-2xl mb-2 block"></i>
            No notifications available
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (n.actionTab) onSelectTab(n.actionTab);
                onClose();
              }}
              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition flex items-start gap-3 ${
                !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <i className="fa-solid fa-info"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.time || 'Recent'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center">
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
        >
          Close Center
        </button>
      </div>
    </div>
  );
}
