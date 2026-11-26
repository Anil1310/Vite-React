import { BudgetSettings, Expense, ExpenseCategory, PaymentMode, UserProfile } from '@/types/expense';

export const DEVELOPER_ATTRIBUTION =
  '© 2026 Designed & Engineered by Dev. Anil Kumar Chahar • 8126390611 • v2.5 Cloud Edition';

export const DEFAULT_GSHEET_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwdmov8lG14V-LHNoqbcZkGBIFFGcDqZMFOUdYFyc57UIZs6Mcd5Snj5sYK1VUOy4JHmA/exec';

export const STORAGE_KEYS = {
  AUTH_SESSION: 'DIVINE_AUTH_SESSION',
  SAVED_CREDS: 'DIVINE_SAVED_CREDS',
  LAST_ACTIVITY: 'DIVINE_LAST_ACTIVITY',
  EXPENSES: 'EXPENSEFLOW_EXPENSES_V1',
  BUDGETS: 'EXPENSEFLOW_BUDGETS_V1',
  THEME: 'EXPENSEFLOW_THEME',
  LAST_SYNC: 'EXPENSEFLOW_LAST_SYNC',
};

export const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
export const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 7,200,000 ms

export const CATEGORIES: {
  name: ExpenseCategory;
  color: string;
  bgClass: string;
  textClass: string;
  hex: string;
}[] = [
  {
    name: 'Food & Dining',
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-950/60',
    textClass: 'text-orange-700 dark:text-orange-300',
    hex: '#f97316',
  },
  {
    name: 'Groceries',
    color: 'emerald',
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/60',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    hex: '#10b981',
  },
  {
    name: 'Travel & Fuel',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-950/60',
    textClass: 'text-blue-700 dark:text-blue-300',
    hex: '#3b82f6',
  },
  {
    name: 'Bills & Utilities',
    color: 'violet',
    bgClass: 'bg-violet-100 dark:bg-violet-950/60',
    textClass: 'text-violet-700 dark:text-violet-300',
    hex: '#8b5cf6',
  },
  {
    name: 'Shopping',
    color: 'pink',
    bgClass: 'bg-pink-100 dark:bg-pink-950/60',
    textClass: 'text-pink-700 dark:text-pink-300',
    hex: '#ec4899',
  },
  {
    name: 'Health & Medical',
    color: 'rose',
    bgClass: 'bg-rose-100 dark:bg-rose-950/60',
    textClass: 'text-rose-700 dark:text-rose-300',
    hex: '#f43f5e',
  },
  {
    name: 'Entertainment',
    color: 'amber',
    bgClass: 'bg-amber-100 dark:bg-amber-950/60',
    textClass: 'text-amber-700 dark:text-amber-300',
    hex: '#f59e0b',
  },
  {
    name: 'Education',
    color: 'cyan',
    bgClass: 'bg-cyan-100 dark:bg-cyan-950/60',
    textClass: 'text-cyan-700 dark:text-cyan-300',
    hex: '#06b6d4',
  },
  {
    name: 'Other',
    color: 'slate',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300',
    hex: '#64748b',
  },
];

export const PAYMENT_MODES: { name: PaymentMode; badgeClass: string; hex: string }[] = [
  {
    name: 'UPI',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    hex: '#6366f1',
  },
  {
    name: 'Cash',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    hex: '#10b981',
  },
  {
    name: 'Card',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    hex: '#0ea5e9',
  },
  {
    name: 'Net Banking',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    hex: '#a855f7',
  },
];

export const DEMO_USERS: Record<string, { password: string; profile: UserProfile }> = {
  admin: {
    password: 'admin123',
    profile: {
      id: 'USR-001',
      username: 'admin',
      name: 'Anil Kumar Chahar',
      role: 'Admin',
      email: 'anil.chahar@expenseflow.in',
      phone: '+91 8126390611',
      currency: 'INR (₹)',
    },
  },
  user: {
    password: 'user123',
    profile: {
      id: 'USR-002',
      username: 'user',
      name: 'Personal Account',
      role: 'Personal',
      email: 'personal@expenseflow.in',
      phone: '+91 9876543210',
      currency: 'INR (₹)',
    },
  },
};

export const DEFAULT_BUDGETS: BudgetSettings = {
  monthlyLimit: 35000,
  dailyLimit: 1500,
  categoryBudgets: {
    'Food & Dining': 6000,
    Groceries: 8000,
    'Travel & Fuel': 4500,
    'Bills & Utilities': 7000,
    Shopping: 4000,
    'Health & Medical': 2500,
    Entertainment: 1500,
    Education: 1000,
    Other: 500,
  },
};

function getDaysAgoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const SEED_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    date: getDaysAgoDate(0),
    time: '09:15',
    title: 'Morning Milk, Bread & Fruits',
    category: 'Groceries',
    amount: 240,
    paymentMode: 'UPI',
    notes: 'Local dairy & fruit vendor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-102',
    date: getDaysAgoDate(0),
    time: '13:30',
    title: 'Office Lunch Thali',
    category: 'Food & Dining',
    amount: 180,
    paymentMode: 'UPI',
    notes: 'Lunch with colleague',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-103',
    date: getDaysAgoDate(1),
    time: '18:45',
    title: 'Petrol Refill (Activa)',
    category: 'Travel & Fuel',
    amount: 450,
    paymentMode: 'Card',
    notes: 'IndianOil Pump',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-104',
    date: getDaysAgoDate(1),
    time: '20:10',
    title: 'Vegetables & Spices',
    category: 'Groceries',
    amount: 360,
    paymentMode: 'Cash',
    notes: 'Evening sabzi mandi',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-105',
    date: getDaysAgoDate(2),
    time: '11:20',
    title: 'Electricity Bill (Torrent Power)',
    category: 'Bills & Utilities',
    amount: 2450,
    paymentMode: 'Net Banking',
    notes: 'Monthly home electricity bill',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-106',
    date: getDaysAgoDate(3),
    time: '16:00',
    title: 'Pharmacy & Vitamins',
    category: 'Health & Medical',
    amount: 620,
    paymentMode: 'UPI',
    notes: 'Apollo Pharmacy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-107',
    date: getDaysAgoDate(4),
    time: '19:30',
    title: 'Family Dinner & Ice Cream',
    category: 'Food & Dining',
    amount: 1150,
    paymentMode: 'Card',
    notes: 'Weekend dinner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-108',
    date: getDaysAgoDate(5),
    time: '14:15',
    title: 'Broadband Wi-Fi Recharge',
    category: 'Bills & Utilities',
    amount: 999,
    paymentMode: 'UPI',
    notes: 'JioFiber monthly plan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-109',
    date: getDaysAgoDate(6),
    time: '17:40',
    title: 'Casual Shoes & Socks',
    category: 'Shopping',
    amount: 1499,
    paymentMode: 'Card',
    notes: 'Online order',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-110',
    date: getDaysAgoDate(7),
    time: '21:00',
    title: 'Movie Tickets & Popcorn',
    category: 'Entertainment',
    amount: 680,
    paymentMode: 'UPI',
    notes: 'PVR Cinemas',
    createdAt: new Date().toISOString(),
  },
];
