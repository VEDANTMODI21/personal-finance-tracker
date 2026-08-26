import React from 'react';
import { Wallet2 } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-brand-400/30 blur-3xl" />
        <div
          className="absolute -bottom-24 -right-16 h-80 w-80 animate-blob rounded-full bg-purple-400/30 blur-3xl"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute right-1/4 top-1/3 h-56 w-56 animate-blob rounded-full bg-indigo-400/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Wallet2 size={22} />
          </span>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="glass rounded-2xl p-6 shadow-elevate-lg sm:p-7">{children}</div>
      </div>
    </div>
  );
}
