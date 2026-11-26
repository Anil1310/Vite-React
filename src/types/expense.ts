export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'Net Banking';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Travel & Fuel'
  | 'Bills & Utilities'
  | 'Shopping'
  | 'Health & Medical'
  | 'Entertainment'
  | 'Education'
  | 'Other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  notes?: string;
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  limit: number;
}

export interface BudgetSettings {
  monthlyLimit: number;
  dailyLimit: number;
  categoryBudgets: Record<ExpenseCategory, number>;
}

export type UserRole = 'Admin' | 'Personal' | 'Family Member';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  currency: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
}

export interface SyncPayload {
  expenses: Expense[];
  budgets: BudgetSettings;
  lastSyncedAt: string;
}
