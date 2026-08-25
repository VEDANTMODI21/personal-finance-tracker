import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthLabel, shiftMonth } from '../utils/format';

export default function MonthPicker({ month, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1.5">
      <button
        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => onChange(shiftMonth(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[9rem] text-center text-sm font-medium text-gray-700 dark:text-gray-200">
        {monthLabel(month)}
      </span>
      <button
        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => onChange(shiftMonth(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
