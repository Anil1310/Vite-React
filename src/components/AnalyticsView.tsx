'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart, Target, Save, CheckCircle2 } from 'lucide-react';
import { CATEGORIES, PAYMENT_MODES } from '@/lib/constants';
import { BudgetSettings, Expense, ExpenseCategory } from '@/types/expense';

interface AnalyticsViewProps {
  expenses: Expense[];
  budgets: BudgetSettings;
  onUpdateBudgets: (newBudgets: BudgetSettings) => void;
  activeSubTab?: 'analytics' | 'budgets';
}

export default function AnalyticsView({
  expenses,
  budgets,
  onUpdateBudgets,
  activeSubTab = 'analytics',
}: AnalyticsViewProps) {
  const [monthlyLimit, setMonthlyLimit] = useState(String(budgets.monthlyLimit));
  const [dailyLimit, setDailyLimit] = useState(String(budgets.dailyLimit));
  const [catLimits, setCatLimits] = useState<Record<ExpenseCategory, string>>(() => {
    const init = {} as Record<ExpenseCategory, string>;
    for (const c of CATEGORIES) {
      init[c.name] = String(budgets.categoryBudgets[c.name] ?? 2000);
    }
    return init;
  });
  const [savedMsg, setSavedMsg] = useState(false);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonthPrefix)),
    [expenses, currentMonthPrefix]
  );

  // Last 7 days bar chart data
  const last7DaysData = useMemo(() => {
    const days: { date: string; label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const total = expenses
        .filter((e) => e.date === iso)
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({ date: iso, label, total });
    }
    return days;
  }, [expenses]);

  const maxDayTotal = Math.max(...last7DaysData.map((d) => d.total), budgets.dailyLimit, 500);

  // Category breakdown (current month)
  const categoryBreakdown = useMemo(() => {
    const totalMonth = monthlyExpenses.reduce((s, e) => s + e.amount, 0) || 1;
    return CATEGORIES.map((cat) => {
      const spent = monthlyExpenses
        .filter((e) => e.category === cat.name)
        .reduce((s, e) => s + e.amount, 0);
      const limit = budgets.categoryBudgets[cat.name] || 0;
      const pctOfTotal = Math.round((spent / totalMonth) * 100);
      const pctOfBudget = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      return {
        ...cat,
        spent,
        limit,
        pctOfTotal,
        pctOfBudget,
        overBudget: limit > 0 && spent > limit,
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [monthlyExpenses, budgets]);

  // Payment mode breakdown
  const paymentBreakdown = useMemo(() => {
    const total = monthlyExpenses.reduce((s, e) => s + e.amount, 0) || 1;
    return PAYMENT_MODES.map((pm) => {
      const spent = monthlyExpenses
        .filter((e) => e.paymentMode === pm.name)
        .reduce((s, e) => s + e.amount, 0);
      return {
        ...pm,
        spent,
        pct: Math.round((spent / total) * 100),
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [monthlyExpenses]);

  const handleSaveBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    const nextCatBudgets = {} as Record<ExpenseCategory, number>;
    for (const c of CATEGORIES) {
      nextCatBudgets[c.name] = Math.max(0, parseFloat(catLimits[c.name]) || 0);
    }
    onUpdateBudgets({
      monthlyLimit: Math.max(0, parseFloat(monthlyLimit) || 0),
      dailyLimit: Math.max(0, parseFloat(dailyLimit) || 0),
      categoryBudgets: nextCatBudgets,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  if (activeSubTab === 'budgets') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Monthly &amp; Category Budget Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set daily and monthly limits to receive automatic alerts when spending gets close.
            </p>
          </div>
          {savedMsg && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Budgets Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBudgets} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly Budget Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Target Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Category Monthly Caps (₹)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const spent = categoryBreakdown.find((c) => c.name === cat.name)?.spent || 0;
                return (
                  <div
                    key={cat.name}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Spent: ₹{spent.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={catLimits[cat.name]}
                      onChange={(e) =>
                        setCatLimits((prev) => ({ ...prev, [cat.name]: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Budget Limits
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 7-Day Trend Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Last 7 Days Spending Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily target line: ₹{budgets.dailyLimit.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          {/* Daily Limit Line */}
          {budgets.dailyLimit > 0 && (
            <div
              className="absolute left-0 right-0 border-t border-dashed border-amber-500/80 pointer-events-none flex justify-end"
              style={{
                bottom: `${Math.min(95, Math.round((budgets.dailyLimit / maxDayTotal) * 100))}%`,
              }}
            >
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 px-1.5 -mt-2.5">
                Limit ₹{budgets.dailyLimit}
              </span>
            </div>
          )}

          {last7DaysData.map((day) => {
            const heightPct = Math.max(4, Math.round((day.total / maxDayTotal) * 100));
            const overDaily = budgets.dailyLimit > 0 && day.total > budgets.dailyLimit;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {day.total > 0 ? `₹${day.total.toLocaleString('en-IN')}` : '₹0'}
                </span>
                <div
                  className={`w-full max-w-[44px] rounded-t-xl transition-all duration-300 ${
                    overDaily
                      ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                      : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                  title={`${day.label}: ₹${day.total.toLocaleString('en-IN')}`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-2 sm:gap-4 pt-2">
          {last7DaysData.map((day) => (
            <div
              key={day.date}
              className="flex-1 text-center text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate"
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Category & Payment Mode Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Category Breakdown (This Month)
          </h3>
          <div className="space-y-3.5">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: cat.hex }}
                    />
                    {cat.name}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    ₹{cat.spent.toLocaleString('en-IN')}{' '}
                    <span className="text-slate-400 font-normal">
                      / ₹{cat.limit.toLocaleString('en-IN')} ({cat.pctOfTotal}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${cat.pctOfBudget}%`,
                      backgroundColor: cat.overBudget ? '#f43f5e' : cat.hex,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Mode Split */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Payment Mode Distribution (This Month)
          </h3>
          <div className="space-y-4">
            {paymentBreakdown.map((pm) => (
              <div
                key={pm.name}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${pm.badgeClass}`}>
                    {pm.name}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{pm.spent.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-400">({pm.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pm.pct}%`, backgroundColor: pm.hex }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
