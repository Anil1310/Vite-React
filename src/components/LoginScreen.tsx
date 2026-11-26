'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DEMO_USERS, DEVELOPER_ATTRIBUTION, STORAGE_KEYS, TEN_DAYS_MS } from '@/lib/constants';
import { UserProfile } from '@/types/expense';

interface LoginScreenProps {
  onLogin: (user: UserProfile, rememberMe: boolean) => void;
  inactivityMessage?: string | null;
}

interface SavedCreds {
  username: string;
  password: string;
  expiresAt: number;
}

export default function LoginScreen({ onLogin, inactivityMessage }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_CREDS);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedCreds;
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setUsername(parsed.username);
          setPassword(parsed.password);
          setRememberMe(true);
        } else {
          localStorage.removeItem(STORAGE_KEYS.SAVED_CREDS);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.SAVED_CREDS);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const key = username.trim().toLowerCase();
    const record = DEMO_USERS[key];
    if (!record || record.password !== password) {
      setError('Invalid username or password. Try admin / admin123 or user / user123.');
      return;
    }

    if (rememberMe) {
      const creds: SavedCreds = {
        username: key,
        password,
        expiresAt: Date.now() + TEN_DAYS_MS,
      };
      localStorage.setItem(STORAGE_KEYS.SAVED_CREDS, JSON.stringify(creds));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SAVED_CREDS);
    }

    onLogin(record.profile, rememberMe);
  };

  const quickFill = (roleKey: 'admin' | 'user') => {
    setUsername(roleKey);
    setPassword(DEMO_USERS[roleKey].password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
              <Wallet className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ExpenseFlow
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Day-to-Day Expense & Budget Manager
            </p>
          </div>

          {inactivityMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{inactivityMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Remember Me (10 Days)
                </span>
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                2h Auto-Lock
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center mb-2.5">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickFill('admin')}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                Admin (admin / admin123)
              </button>
              <button
                type="button"
                onClick={() => quickFill('user')}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                Personal (user / user123)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Developer Attribution Footer */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 pt-6">
        {DEVELOPER_ATTRIBUTION}
      </footer>
    </div>
  );
}
