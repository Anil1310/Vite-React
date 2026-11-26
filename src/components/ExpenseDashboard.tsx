'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  Upload,
  Trash2,
  Edit3,
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Target,
  Menu,
  Wallet,
  TrendingUp,
  CalendarDays,
  CreditCard,
  LogOut,
} from 'lucide-react';
import Header from '@/components/Header';
import ProfileModal from '@/components/ProfileModal';
import ExpenseFormModal from '@/components/ExpenseFormModal';
import AnalyticsView from '@/components/AnalyticsView';
import LoginScreen from '@/components/LoginScreen';
import GoogleSheetsModal from '@/components/GoogleSheetsModal';
import {
  CATEGORIES,
  DEFAULT_BUDGETS,
  DEFAULT_GSHEET_WEB_APP_URL,
  DEVELOPER_ATTRIBUTION,
  PAYMENT_MODES,
  SEED_EXPENSES,
  STORAGE_KEYS,
  TWO_HOURS_MS,
} from '@/lib/constants';
import { exportBackupJSON, exportExpensesToCSV, exportExpensesToExcel } from '@/lib/exportUtils';
import {
  AppNotification,
  BudgetSettings,
  Expense,
  ExpenseCategory,
  PaymentMode,
  UserProfile,
} from '@/types/expense';

type ActiveTab = 'overview' | 'transactions' | 'analytics' | 'budgets';

export default function ExpenseDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [inactivityMessage, setInactivityMessage] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetSettings>(DEFAULT_BUDGETS);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [gsheetModalOpen, setGsheetModalOpen] = useState(false);
  const [gsheetUrl, setGsheetUrl] = useState(DEFAULT_GSHEET_WEB_APP_URL);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | ExpenseCategory>('ALL');
  const [filterPayment, setFilterPayment] = useState<'ALL' | PaymentMode>('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme, auth session, and data
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auth Session check
    try {
      const sessionRaw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      const lastActRaw = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (sessionRaw) {
        const lastAct = lastActRaw ? parseInt(lastActRaw, 10) : Date.now();
        if (Date.now() - lastAct > TWO_HOURS_MS) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
          setInactivityMessage(
            'Your session expired after 2 hours of inactivity. Please sign in again.'
          );
        } else {
          setUser(JSON.parse(sessionRaw) as UserProfile);
          localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, String(Date.now()));
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
    setAuthChecked(true);

    // Load expenses & budgets
    try {
      const expRaw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const budRaw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (expRaw) {
        setExpenses(JSON.parse(expRaw) as Expense[]);
      } else {
        setExpenses(SEED_EXPENSES);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(SEED_EXPENSES));
      }
      if (budRaw) {
        setBudgets(JSON.parse(budRaw) as BudgetSettings);
      } else {
        setBudgets(DEFAULT_BUDGETS);
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
      }
      const syncRaw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (syncRaw) setLastSyncedAt(syncRaw);
      const savedGsheetUrl = localStorage.getItem('EXPENSEFLOW_GSHEET_URL') || DEFAULT_GSHEET_WEB_APP_URL;
      if (savedGsheetUrl) {
        setGsheetUrl(savedGsheetUrl);
        // Auto-pull latest data directly from Google Sheets on startup (2-way sync)
        pullDirectlyFromGsheet(savedGsheetUrl).catch(() => {});
      }
    } catch {
      setExpenses(SEED_EXPENSES);
      setBudgets(DEFAULT_BUDGETS);
    }
  }, []);

  // 2-Hour Inactivity Auto-Logout Tracker
  useEffect(() => {
    if (!user) return;

    let lastThrottle = Date.now();
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastThrottle > 10000) {
        lastThrottle = now;
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, String(now));
      }
    };

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
    ];
    events.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }));

    const interval = setInterval(() => {
      const lastActRaw = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      const lastAct = lastActRaw ? parseInt(lastActRaw, 10) : Date.now();
      if (Date.now() - lastAct > TWO_HOURS_MS) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
        setUser(null);
        setProfileModalOpen(false);
        setInactivityMessage(
          'Automatically logged out due to 2 hours of inactivity. Remembered credentials remain saved.'
        );
      }
    }, 30000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, recordActivity));
      clearInterval(interval);
    };
  }, [user]);

  // Automatic 2-Way Sync: pull changes from Google Sheets on window focus & every 30s
  useEffect(() => {
    if (!user || !gsheetUrl || !gsheetUrl.startsWith('https://script.google.com/')) return;

    let isPulling = false;
    const pullQuietly = async () => {
      if (isPulling || expenseModalOpen) return;
      isPulling = true;
      try {
        await pullDirectlyFromGsheet(gsheetUrl);
      } catch {
        // silent background pull
      } finally {
        isPulling = false;
      }
    };

    const onFocus = () => pullQuietly();
    window.addEventListener('focus', onFocus);
    const syncTimer = setInterval(pullQuietly, 30000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(syncTimer);
    };
  }, [user, gsheetUrl, expenseModalOpen]);

  // Budget Alerts & Notifications
  useEffect(() => {
    const todayIso = new Date().toISOString().split('T')[0];
    const monthPrefix = todayIso.slice(0, 7);

    const todaySpent = expenses
      .filter((e) => e.date === todayIso)
      .reduce((s, e) => s + e.amount, 0);
    const monthSpent = expenses
      .filter((e) => e.date.startsWith(monthPrefix))
      .reduce((s, e) => s + e.amount, 0);

    const nextAlerts: AppNotification[] = [];
    if (budgets.dailyLimit > 0 && todaySpent > budgets.dailyLimit) {
      nextAlerts.push({
        id: 'daily-limit-alert',
        title: 'Daily Spending Limit Exceeded',
        message: `Today's spend (₹${todaySpent.toLocaleString('en-IN')}) exceeded your daily target of ₹${budgets.dailyLimit.toLocaleString('en-IN')}.`,
        type: 'warning',
        timestamp: 'Today',
        read: false,
      });
    }
    if (budgets.monthlyLimit > 0 && monthSpent >= budgets.monthlyLimit * 0.85) {
      nextAlerts.push({
        id: 'monthly-limit-alert',
        title: monthSpent > budgets.monthlyLimit ? 'Monthly Budget Exceeded' : 'Approaching Monthly Budget',
        message: `You have spent ₹${monthSpent.toLocaleString('en-IN')} out of ₹${budgets.monthlyLimit.toLocaleString('en-IN')} this month.`,
        type: 'warning',
        timestamp: 'This Month',
        read: false,
      });
    }
    if (nextAlerts.length === 0) {
      nextAlerts.push({
        id: 'all-good',
        title: 'Spending Within Budget',
        message: 'Your daily and monthly expenses are well within your configured targets.',
        type: 'info',
        timestamp: 'Just now',
        read: true,
      });
    }
    setNotifications(nextAlerts);
  }, [expenses, budgets]);

  const normalizeDate = (val: unknown): string => {
    const s = String(val || '').trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
    return s;
  };

  const normalizeTime = (val: unknown): string => {
    const s = String(val || '').trim();
    const m = s.match(/T(\d{2}:\d{2})/);
    if (m) return m[1];
    return s;
  };

  const pullDirectlyFromGsheet = async (url: string) => {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`Google Sheet returned status ${res.status}`);
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      throw new Error("Google Apps Script returned a Sign-In page. Ensure 'Who has access' is set to 'Anyone'.");
    }
    const remote = JSON.parse(text);
    if (!remote.ok) throw new Error(remote.error || 'Google Sheet pull failed');

    if (Array.isArray(remote.expenses) && remote.expenses.length > 0) {
      const normalized: Expense[] = remote.expenses.map((e: Expense) => ({
        ...e,
        date: normalizeDate(e.date),
        time: normalizeTime(e.time),
        amount: Number(e.amount) || 0,
      }));
      setExpenses(normalized);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(normalized));
    }
    if (remote.budgets) {
      setBudgets(remote.budgets);
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(remote.budgets));
    }
    const ts = remote.lastSyncedAt || new Date().toISOString();
    setLastSyncedAt(ts);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, ts);
    setSyncStatus('synced');
  };

  const syncWithServer = async (
    nextExpenses: Expense[],
    nextBudgets: BudgetSettings,
    overrideUrl?: string
  ) => {
    setSyncStatus('syncing');
    const urlToUse = overrideUrl !== undefined ? overrideUrl : gsheetUrl;
    if (!urlToUse || !urlToUse.startsWith('https://script.google.com/')) {
      setSyncStatus('synced');
      return { ok: true, gsheetSynced: false, gsheetError: 'No Google Apps Script URL configured.' };
    }
    try {
      const res = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          expenses: nextExpenses,
          budgets: nextBudgets,
        }),
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.trim().startsWith('<')) {
        throw new Error("Apps Script returned Sign-In page. Ensure 'Who has access' is 'Anyone'.");
      }
      const json = JSON.parse(text);
      if (!json.ok) throw new Error(json.error || 'Apps Script error');

      const ts = json.lastSyncedAt || new Date().toISOString();
      setLastSyncedAt(ts);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, ts);
      setSyncStatus('synced');
      return { ok: true, gsheetSynced: true, gsheetError: null };
    } catch (err) {
      setSyncStatus('error');
      return {
        ok: false,
        gsheetSynced: false,
        gsheetError: err instanceof Error ? err.message : 'Network error reaching Google Sheets',
      };
    }
  };

  const handleSaveGsheetAndPush = async (url: string) => {
    setGsheetUrl(url);
    localStorage.setItem('EXPENSEFLOW_GSHEET_URL', url);
    const result = await syncWithServer(expenses, budgets, url);
    if (!result.gsheetSynced) {
      throw new Error(
        result.gsheetError ||
          "Could not reach Google Apps Script. Make sure 'Who has access' is set to 'Anyone'."
      );
    }
  };

  const handlePullFromGsheet = async (url: string) => {
    setGsheetUrl(url);
    localStorage.setItem('EXPENSEFLOW_GSHEET_URL', url);
    setSyncStatus('syncing');
    try {
      await pullDirectlyFromGsheet(url);
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setInactivityMessage(null);
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(loggedInUser));
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, String(Date.now()));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    setUser(null);
    setProfileModalOpen(false);
    setMobileMenuOpen(false);
  };

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleProfileIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setProfileModalOpen(true);
  };

  const handleSaveExpense = (
    data: Omit<Expense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let nextExpenses: Expense[];
    if (existingId) {
      nextExpenses = expenses.map((e) => (e.id === existingId ? { ...e, ...data } : e));
    } else {
      const newExp: Expense = {
        ...data,
        id: `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      nextExpenses = [newExp, ...expenses];
    }
    setExpenses(nextExpenses);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(nextExpenses));
    setExpenseModalOpen(false);
    setEditingExpense(null);
    syncWithServer(nextExpenses, budgets);
  };

  const handleDeleteExpense = (id: string) => {
    const nextExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(nextExpenses);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(nextExpenses));
    syncWithServer(nextExpenses, budgets);
  };

  const handleUpdateBudgets = (nextBudgets: BudgetSettings) => {
    setBudgets(nextBudgets);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(nextBudgets));
    syncWithServer(expenses, nextBudgets);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.expenses)) {
          setExpenses(parsed.expenses);
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(parsed.expenses));
        }
        if (parsed.budgets) {
          setBudgets(parsed.budgets);
          localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(parsed.budgets));
        }
        syncWithServer(parsed.expenses || expenses, parsed.budgets || budgets);
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
        if (filterPayment !== 'ALL' && e.paymentMode !== filterPayment) return false;
        if (filterDate && e.date !== filterDate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = e.title.toLowerCase().includes(q);
          const matchNotes = (e.notes || '').toLowerCase().includes(q);
          const matchCat = e.category.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [expenses, filterCategory, filterPayment, filterDate, searchQuery]);

  // KPIs
  const todayIso = new Date().toISOString().split('T')[0];
  const monthPrefix = todayIso.slice(0, 7);

  const todayTotal = useMemo(
    () => expenses.filter((e) => e.date === todayIso).reduce((s, e) => s + e.amount, 0),
    [expenses, todayIso]
  );

  const monthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthPrefix)).reduce((s, e) => s + e.amount, 0),
    [expenses, monthPrefix]
  );

  const allTimeTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const topCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      if (e.date.startsWith(monthPrefix)) {
        map[e.category] = (map[e.category] || 0) + e.amount;
      }
    }
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ['None', 0];
  }, [expenses, monthPrefix]);

  if (!authChecked) {
    return null;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} inactivityMessage={inactivityMessage} />;
  }

  const getCategoryStyle = (catName: ExpenseCategory) =>
    CATEGORIES.find((c) => c.name === catName) || CATEGORIES[CATEGORIES.length - 1];

  const getPaymentStyle = (pmName: PaymentMode) =>
    PAYMENT_MODES.find((p) => p.name === pmName) || PAYMENT_MODES[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 lg:pb-0">
      {/* Strict 4-Control Header */}
      <Header
        user={user}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onSyncNow={() => {
          if (!gsheetUrl) setGsheetModalOpen(true);
          else handlePullFromGsheet(gsheetUrl).catch(() => syncWithServer(expenses, budgets));
        }}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onProfileClick={handleProfileIconClick}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* Role Banner & Quick Actions (Per Golden Architecture) */}
        <section className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide uppercase mb-2">
              {user.role} Workspace
            </span>
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              Welcome back, {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mt-0.5">
              Track daily expenses, speak transactions with voice AI, and monitor your monthly budgets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
            <button
              type="button"
              onClick={() => setGsheetModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> GSheet Backend
            </button>
            <button
              type="button"
              onClick={() => exportExpensesToExcel(filteredExpenses)}
              className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button
              type="button"
              onClick={() => exportExpensesToCSV(filteredExpenses)}
              className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              type="button"
              onClick={() => exportBackupJSON(expenses, budgets)}
              className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              Backup
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Restore
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </section>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'transactions', label: 'All Expenses', icon: ListOrdered },
            { id: 'analytics', label: 'Visual Analytics', icon: BarChart3 },
            { id: 'budgets', label: 'Budgets & Limits', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* KPI Cards */}
        {activeTab === 'overview' && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Today&apos;s Spend
                </p>
                <CalendarDays className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                ₹{todayTotal.toLocaleString('en-IN')}
              </p>
              <p
                className={`text-[11px] mt-1 font-medium ${
                  todayTotal > budgets.dailyLimit
                    ? 'text-rose-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                Daily Target: ₹{budgets.dailyLimit.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  This Month&apos;s Spend
                </p>
                <Wallet className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                ₹{monthTotal.toLocaleString('en-IN')}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    monthTotal > budgets.monthlyLimit ? 'bg-rose-500' : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      budgets.monthlyLimit > 0 ? Math.round((monthTotal / budgets.monthlyLimit) * 100) : 0
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Top Category (Month)
                </p>
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-2 truncate">
                {topCategory[0]}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ₹{Number(topCategory[1]).toLocaleString('en-IN')} spent
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Entries
                </p>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {expenses.length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All-time: ₹{allTimeTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </section>
        )}

        {/* Transactions Table & Filters (Shown on Overview & All Expenses) */}
        {(activeTab === 'overview' || activeTab === 'transactions') && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeTab === 'overview' ? 'Recent Day-to-Day Expenses' : 'All Expense Transactions'}
                </h3>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                  Showing {filteredExpenses.length} items • ₹
                  {filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, notes..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(e.target.value as 'ALL' | ExpenseCategory)
                  }
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value as 'ALL' | PaymentMode)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Payment Modes</option>
                  {PAYMENT_MODES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {(searchQuery || filterCategory !== 'ALL' || filterPayment !== 'ALL' || filterDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCategory('ALL');
                        setFilterPayment('ALL');
                        setFilterDate('');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 whitespace-nowrap">Date &amp; Time</th>
                    <th className="py-3 px-4">Expense</th>
                    <th className="py-3 px-4 whitespace-nowrap">Category</th>
                    <th className="py-3 px-4 whitespace-nowrap">Mode</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Amount</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                        No expenses found matching your filters. Click &ldquo;Add Expense&rdquo; to record one.
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'overview' ? filteredExpenses.slice(0, 12) : filteredExpenses).map(
                      (exp) => {
                        const catStyle = getCategoryStyle(exp.category);
                        const pmStyle = getPaymentStyle(exp.paymentMode);
                        return (
                          <tr
                            key={exp.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {exp.date}
                              </p>
                              <p className="text-[11px] text-slate-400">{exp.time}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                                {exp.title}
                              </p>
                              {exp.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                                  {exp.notes}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${catStyle.bgClass} ${catStyle.textClass}`}
                              >
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${pmStyle.badgeClass}`}
                              >
                                {exp.paymentMode}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              ₹{exp.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingExpense(exp);
                                    setExpenseModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Analytics & Budgets Views */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            expenses={expenses}
            budgets={budgets}
            onUpdateBudgets={handleUpdateBudgets}
            activeSubTab="analytics"
          />
        )}

        {activeTab === 'budgets' && (
          <AnalyticsView
            expenses={expenses}
            budgets={budgets}
            onUpdateBudgets={handleUpdateBudgets}
            activeSubTab="budgets"
          />
        )}
      </main>

      {/* Universal Developer Attribution Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        {DEVELOPER_ATTRIBUTION}
      </footer>

      {/* Mobile Bottom Navigation Bar (lg:hidden) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {[
            { id: 'overview', label: 'Home', icon: LayoutDashboard },
            { id: 'transactions', label: 'Expenses', icon: ListOrdered },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'budgets', label: 'Budgets', icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold cursor-pointer ${
                  active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="font-bold text-slate-900 dark:text-white">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-slate-500"
                >
                  Close
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold"
              >
                My Profile ({user.name})
              </button>
              <button
                type="button"
                onClick={() => {
                  exportExpensesToExcel(filteredExpenses);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold"
              >
                Export Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => {
                  exportBackupJSON(expenses, budgets);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold"
              >
                Download JSON Backup
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {profileModalOpen && (
        <ProfileModal
          user={user}
          totalExpensesCount={expenses.length}
          totalSpentAllTime={allTimeTotal}
          onClose={() => setProfileModalOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {expenseModalOpen && (
        <ExpenseFormModal
          initialExpense={editingExpense}
          onSave={handleSaveExpense}
          onClose={() => {
            setExpenseModalOpen(false);
            setEditingExpense(null);
          }}
        />
      )}

      {gsheetModalOpen && (
        <GoogleSheetsModal
          currentUrl={gsheetUrl}
          onSaveUrlAndPush={handleSaveGsheetAndPush}
          onPullFromSheet={handlePullFromGsheet}
          onClose={() => setGsheetModalOpen(false)}
        />
      )}
    </div>
  );
}
