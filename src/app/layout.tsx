import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExpenseFlow | Day-to-Day Expense & Budget Tracker',
  description: 'Modern day-to-day expense management web application with voice entry, visual analytics, budgets, and Excel export.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
