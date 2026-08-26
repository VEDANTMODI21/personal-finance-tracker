import React from 'react';
import { Wallet2, ShieldCheck, PieChart, TrendingUp } from 'lucide-react';
import Tilt3D from './Tilt3D.jsx';

const HIGHLIGHTS = [
  { icon: PieChart, text: 'See exactly where every rupee goes, every month' },
  { icon: TrendingUp, text: 'Budgets that warn you before you overspend' },
  { icon: ShieldCheck, text: 'Your data is yours, enforced on every request server-side' },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Left brand panel — modern split-screen treatment, hidden on small screens */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gray-950 lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-20">
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-brand-500/30 blur-3xl" />
          <div
            className="absolute -bottom-16 -right-10 h-80 w-80 animate-blob rounded-full bg-accent-400/20 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Wallet2 size={22} />
          </span>
          <h2 className="mt-7 max-w-sm text-3xl font-bold leading-tight text-white xl:text-4xl">
            Your money, finally organized.
          </h2>
          <p className="mt-3 max-w-sm text-gray-400">
            Expenses, income, loans, budgets and reports — one dashboard that actually tells you where it went.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                  <Icon size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <Tilt3D max={5} className="mt-10 max-w-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-elevate-lg backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="mt-1 text-lg font-semibold text-white">₹26,980</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-gray-400">This month</p>
                  <p className="mt-1 text-lg font-semibold text-accent-300">+₹8,420</p>
                </div>
              </div>
            </div>
          </Tilt3D>
        </div>
      </div>

      {/* Right: the actual form */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-10 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-brand-400/30 blur-3xl" />
          <div
            className="absolute -bottom-24 -right-16 h-80 w-80 animate-blob rounded-full bg-accent-400/25 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <span className="flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <Wallet2 size={22} />
            </span>
          </div>
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          <div className="glass rounded-2xl p-6 shadow-elevate-lg sm:p-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
