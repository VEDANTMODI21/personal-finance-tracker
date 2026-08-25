import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 py-16 px-6 text-center">
      {Icon && <Icon size={32} className="text-gray-400 dark:text-gray-600 mb-1" />}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
      {description && <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
