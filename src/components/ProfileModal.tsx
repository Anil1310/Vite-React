'use client';

import React from 'react';
import { X, User, Mail, Phone, Shield, IndianRupee, LogOut } from 'lucide-react';
import { UserProfile } from '@/types/expense';

interface ProfileModalProps {
  user: UserProfile;
  totalExpensesCount: number;
  totalSpentAllTime: number;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({
  user,
  totalExpensesCount,
  totalSpentAllTime,
  onClose,
  onLogout,
}: ProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{user.name}</h2>
              <p className="text-xs text-indigo-100 truncate">
                {user.role} Account • {user.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Transactions</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {totalExpensesCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Tracked</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                ₹{totalSpentAllTime.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400">Role &amp; Access</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400">Email</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400">Phone</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <IndianRupee className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400">Default Currency</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{user.currency}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
