'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Sun, Moon, Bell, User, Check, AlertTriangle, Info } from 'lucide-react';
import { AppNotification, UserProfile } from '@/types/expense';

interface HeaderProps {
  user: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  syncStatus: 'synced' | 'syncing' | 'error';
  lastSyncedAt: string | null;
  onSyncNow: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onProfileClick: (e: React.MouseEvent) => void;
}

export default function Header({
  user,
  theme,
  onToggleTheme,
  syncStatus,
  lastSyncedAt,
  onSyncNow,
  notifications,
  onMarkAllRead,
  onProfileClick,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            ₹
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate whitespace-nowrap">
              ExpenseFlow
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate whitespace-nowrap">
              Daily Expense &amp; Budget Tracker
            </p>
          </div>
        </div>

        {/* Strict 4-Control Right Navigation Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* 1. Cloud Sync Control */}
          <button
            type="button"
            onClick={onSyncNow}
            disabled={syncStatus === 'syncing'}
            title={
              lastSyncedAt
                ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}`
                : 'Sync to local database'
            }
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
            ) : syncStatus === 'error' ? (
              <CloudOff className="w-4 h-4 text-rose-500" />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-500" />
            )}
            <span className="hidden md:inline whitespace-nowrap">
              {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Retry' : 'Synced'}
            </span>
          </button>

          {/* 2. Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* 3. Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Notifications"
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Notifications ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs ${
                          n.read ? 'opacity-70' : 'bg-indigo-50/40 dark:bg-indigo-950/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {n.title}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Unified User Profile Badge */}
          <button
            type="button"
            onClick={onProfileClick}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[115px] whitespace-nowrap leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[115px] whitespace-nowrap leading-tight">
                {user.role} • {user.id}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
