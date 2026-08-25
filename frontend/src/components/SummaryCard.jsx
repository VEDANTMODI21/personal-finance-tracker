import React from 'react';
import { formatCurrency } from '../utils/format';

const TONE_STYLES = {
  default: 'text-gray-900 dark:text-gray-100',
  positive: 'text-green-600 dark:text-green-400',
  negative: 'text-red-600 dark:text-red-400',
  brand: 'text-brand-600 dark:text-brand-400',
};

export default function SummaryCard({ label, value, icon: Icon, tone = 'default', hint }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        {Icon && (
          <span className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2 text-gray-500 dark:text-gray-400">
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${TONE_STYLES[tone]}`}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
