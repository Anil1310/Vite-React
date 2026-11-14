import React, { useState, useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function Header({
  currentUser,
  syncStatus,
  onTriggerSync,
  theme,
  onToggleTheme,
  notifications = [],
  onOpenProfileModal,
  onToggleSidebar,
  onSelectTab,
  onMarkAllNotificationsRead,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Hamburger Menu & Institute Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <i className="fa-solid fa-graduation-cap text-base"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Divine Classes
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none">
              Institute Management System &bull; v2.5
            </p>
          </div>
        </div>
      </div>

      {/* Right: STRICT 4-CONTROL STANDARD */}
      <div className="flex items-center gap-2 sm:gap-3" id="header-action-controls">
        {/* 1. Cloud Sync Control */}
        <button
          onClick={onTriggerSync}
          disabled={syncStatus.syncing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            syncStatus.syncing
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 animate-pulse'
              : syncStatus.error
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
          title={syncStatus.lastSynced ? `Last synced: ${syncStatus.lastSynced}` : 'Sync with Supabase & Google Sheets'}
        >
          <i className={`fa-solid fa-cloud ${syncStatus.syncing ? 'animate-spin' : ''}`}></i>
          <span className="hidden md:inline">
            {syncStatus.syncing ? 'Syncing...' : syncStatus.lastSynced ? `Synced ${syncStatus.lastSynced}` : 'Cloud Sync'}
          </span>
        </button>

        {/* 2. Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition flex items-center justify-center text-sm shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <i className="fa-solid fa-sun text-amber-400"></i>
          ) : (
            <i className="fa-solid fa-moon text-indigo-600"></i>
          )}
        </button>

        {/* 3. Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition flex items-center justify-center text-sm shadow-sm relative"
            title="Notifications"
            aria-label="Open notifications"
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onSelectTab={onSelectTab}
              onMarkAllRead={onMarkAllNotificationsRead}
            />
          )}
        </div>

        {/* 4. Unified User Profile Badge */}
        <div className="relative" ref={userRef}>
          <div
            onClick={onOpenProfileModal}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition cursor-pointer select-none shadow-sm"
            title="Click to view detailed profile & ID card"
          >
            <div className={`w-8 h-8 rounded-xl ${currentUser?.avatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0`}>
              {currentUser?.initials || (currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DC')}
            </div>
            <div className="text-left hidden sm:block max-w-[130px]">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {currentUser?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate leading-none">
                {currentUser?.badge || currentUser?.role || 'Guest'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(prev => !prev);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-0.5"
              aria-label="Account options"
            >
              <i className="fa-solid fa-chevron-down text-[10px]"></i>
            </button>
          </div>

          {/* Account Dropdown (Desktop logout & profile shortcut) */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || currentUser?.roll || currentUser?.role}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenProfileModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <i className="fa-solid fa-id-card text-indigo-500"></i>
                <span>Profile &amp; ID Details</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 mt-1"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
