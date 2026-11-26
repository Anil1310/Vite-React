import * as XLSX from 'xlsx';
import { BudgetSettings, Expense } from '@/types/expense';

export function exportExpensesToExcel(expenses: Expense[], filename = 'Daily_Expenses_Report.xlsx') {
  const rows = expenses.map((e, idx) => ({
    'S.No': idx + 1,
    Date: e.date,
    Time: e.time,
    'Expense Title': e.title,
    Category: e.category,
    'Payment Mode': e.paymentMode,
    'Amount (INR)': e.amount,
    Notes: e.notes || '',
  }));

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  rows.push({
    'S.No': '' as unknown as number,
    Date: '',
    Time: '',
    'Expense Title': 'GRAND TOTAL',
    Category: '' as Expense['category'],
    'Payment Mode': '' as Expense['paymentMode'],
    'Amount (INR)': totalAmount,
    Notes: `${expenses.length} Transactions`,
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 8 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Expenses');
  XLSX.writeFile(wb, filename);
}

export function exportExpensesToCSV(expenses: Expense[], filename = 'Daily_Expenses_Report.csv') {
  const headers = ['S.No', 'Date', 'Time', 'Expense Title', 'Category', 'Payment Mode', 'Amount (INR)', 'Notes'];
  const csvRows = [
    headers.join(','),
    ...expenses.map((e, idx) =>
      [
        idx + 1,
        e.date,
        e.time,
        `"${(e.title || '').replace(/"/g, '""')}"`,
        `"${e.category}"`,
        `"${e.paymentMode}"`,
        e.amount,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBackupJSON(expenses: Expense[], budgets: BudgetSettings) {
  const payload = {
    version: '2.5',
    exportedAt: new Date().toISOString(),
    expenses,
    budgets,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ExpenseFlow_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
