import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Wallet, HandCoins, FileBarChart, Tags, Settings, Wallet2, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/income', label: 'Income', icon: Wallet },
  { to: '/loans', label: 'Loans', icon: HandCoins },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 transform border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-elevate transition-transform lg:static lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 font-display font-semibold text-gray-900 dark:text-gray-100">
            <Wallet2 className="text-brand-600" size={22} />
            <span>Finance Tracker</span>
          </div>
          <button className="lg:hidden text-gray-400" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-50 to-brand-100/40 text-brand-700 shadow-inner dark:from-brand-500/15 dark:to-brand-500/5 dark:text-brand-400'
                    : 'text-gray-600 hover:translate-x-0.5 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
