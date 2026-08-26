import React from 'react';
import { ArrowDownLeft, ArrowUpRight, HandCoins } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import EmptyState from './EmptyState.jsx';

const TYPE_META = {
  EXPENSE: { icon: ArrowUpRight, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
  INCOME: { icon: ArrowDownLeft, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  LOAN_GIVEN: { icon: HandCoins, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  LOAN_REPAYMENT: { icon: HandCoins, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10' },
};

export default function TransactionTable({ transactions = [] }) {
  if (transactions.length === 0) {
    return <EmptyState title="No transactions yet" description="Expenses, income and loan activity will show up here." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wide text-gray-400">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Description</th>
            <th className="py-2 pr-4 font-medium hidden sm:table-cell">Category</th>
            <th className="py-2 pr-4 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const meta = TYPE_META[t.type] || TYPE_META.EXPENSE;
            const Icon = meta.icon;
            return (
              <tr
                key={`${t.type}-${t.id}`}
                className="border-b border-gray-100 dark:border-gray-800/60 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td className="py-3 pr-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{formatDate(t.date)}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
                      <Icon size={14} />
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{t.description}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell text-gray-500 dark:text-gray-400">
                  {t.category ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                      {t.category}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className={`py-3 pr-4 text-right font-semibold ${t.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {t.amount >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(t.amount))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
