import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet2, Receipt, PieChart, HandCoins, FileBarChart, ShieldCheck,
  ArrowRight, Sparkles, TrendingUp, Moon, Lock, Zap, Fingerprint, KeyRound,
} from 'lucide-react';
import Tilt3D from '../components/Tilt3D.jsx';
import Reveal from '../components/Reveal.jsx';

const FEATURES = [
  {
    icon: Receipt,
    title: 'Expenses & income',
    description: 'Log every rupee in and out, search and filter by category, payment method, or date range.',
  },
  {
    icon: HandCoins,
    title: 'Friend loans, tracked',
    description: 'Track money you lend out, record repayments, and see outstanding balances update automatically.',
  },
  {
    icon: PieChart,
    title: 'A dashboard that explains itself',
    description: 'Category breakdowns, daily spending trends, and income vs. expense — at a glance, every month.',
  },
  {
    icon: FileBarChart,
    title: 'Real reports, not just numbers',
    description: 'Export a full monthly report as a formatted PDF, a multi-sheet Excel workbook, or a CSV ledger.',
  },
  {
    icon: TrendingUp,
    title: 'Budgets that warn you',
    description: 'Set a monthly limit and get a clear on-screen alert once you cross your threshold.',
  },
  {
    icon: ShieldCheck,
    title: 'Built to keep your data yours',
    description: 'Every request is re-checked against your account on the server — your data never leaks across users.',
  },
];

const TRUST_STRIP = [
  { icon: Zap, text: 'Free to use' },
  { icon: Lock, text: 'Passwords hashed, never logged' },
  { icon: ShieldCheck, text: 'Your data, isolated per account' },
];

const STEPS = [
  {
    n: '01',
    icon: Receipt,
    title: 'Log it in seconds',
    description: 'Add an expense, income entry, or a loan you gave a friend from one clean form — categorized and dated instantly.',
  },
  {
    n: '02',
    icon: PieChart,
    title: 'See the full picture',
    description: 'One dashboard turns scattered entries into category trends, monthly patterns, and a running balance you can actually trust.',
  },
  {
    n: '03',
    icon: TrendingUp,
    title: 'Stay ahead of it',
    description: 'Set a monthly budget threshold and get a clear warning before you overspend — not a surprise three weeks later.',
  },
];

const TRUST_DETAILS = [
  {
    icon: Fingerprint,
    title: 'Passwords never stored in plain text',
    description: 'Every password is hashed with bcrypt before it touches the database — not even we can read it back.',
  },
  {
    icon: KeyRound,
    title: 'Token-based sessions',
    description: 'Short-lived JWT access tokens plus a rotating refresh token, so a stolen token has a short shelf life.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, walled off',
    description: "Every API request is checked against your account server-side — there's no path from one user's data to another's.",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header
        className={`glass sticky top-0 z-30 flex h-16 items-center justify-between px-4 transition-shadow duration-300 sm:px-8 ${
          scrolled ? 'shadow-elevate border-b border-gray-200/70 dark:border-gray-800/70' : 'border-b border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 font-display font-semibold text-gray-900 dark:text-gray-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Wallet2 size={18} />
          </span>
          Finance Tracker
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/register" className="btn-primary group">
            Get started <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-mesh px-4 pb-16 pt-16 sm:px-8 sm:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)] dark:opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-brand-400/25 blur-3xl" />
          <div
            className="absolute right-0 top-1/3 h-80 w-80 animate-blob rounded-full bg-accent-400/20 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-64 w-64 animate-blob rounded-full bg-fuchsia-400/15 blur-3xl"
            style={{ animationDelay: '8s' }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <Sparkles size={13} /> Your money, finally organized
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
              Track every rupee.
              <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">Understand every month.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-gray-500 dark:text-gray-400 sm:text-lg">
              Expenses, income, loans to friends, budgets, and monthly reports — one dashboard that actually
              tells you where your money went, instead of a spreadsheet you stop updating after a week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary group px-6 py-3 text-base">
                Create your free account
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                I already have an account
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_STRIP.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Icon size={13} className="text-brand-500" /> {text}
                </span>
              ))}
            </div>
          </Reveal>

          {/* "Browser window" framing around the preview makes it read as an
              actual product screenshot rather than a floating stat card. */}
          <Reveal delay={150}>
            <Tilt3D max={7} className="mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-2xl shadow-elevate-lg">
                <div className="flex items-center gap-1.5 border-b border-gray-200/60 bg-gray-100/80 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 truncate rounded-md bg-white/70 px-2.5 py-0.5 text-[11px] text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                    financetracker.app/dashboard
                  </span>
                </div>
                <div className="glass border-t-0 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">This month</span>
                    <Moon size={15} className="text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/70 p-3 shadow-card dark:bg-gray-900/60">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                      <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">₹27,000</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3 shadow-card dark:bg-gray-900/60">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
                      <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">₹8,420</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3 shadow-card dark:bg-gray-900/60">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                      <p className="mt-1 text-lg font-semibold text-brand-600 dark:text-brand-400">₹18,580</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3 shadow-card dark:bg-gray-900/60">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Outstanding loans</p>
                      <p className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">₹2,000</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center rounded-xl bg-white/70 py-6 shadow-card dark:bg-gray-900/60">
                    <div className="h-20 w-20 rounded-full border-[10px] border-brand-500/80 border-r-accent-400 border-t-fuchsia-400" />
                  </div>
                </div>
              </div>
            </Tilt3D>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            How it works
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Three steps. Not thirty.
          </h2>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700 sm:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 130} className="relative text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <step.icon size={22} />
              </div>
              <span className="mt-4 block font-display text-xs font-bold tracking-widest text-gray-300 dark:text-gray-700">
                {step.n}
              </span>
              <h3 className="mt-1 font-display text-lg font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Everything a real budget needs
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Not just a CRUD app — the parts of personal finance that people actually track by hand.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={(i % 3) * 100}>
              <Tilt3D max={6}>
                <div className="group card card-shine relative h-full overflow-hidden p-5">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gradient transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="inline-flex rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 p-2.5 text-brand-600 shadow-inner dark:from-brand-500/15 dark:to-accent-500/10 dark:text-brand-400">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
              </Tilt3D>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Security / trust */}
      <section className="border-y border-gray-200 bg-white/60 px-4 py-16 dark:border-gray-800 dark:bg-gray-900/40 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              Built to be trusted
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              Your numbers, kept yours
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TRUST_DETAILS.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
                  <span className="inline-flex rounded-xl bg-gradient-to-br from-accent-100 to-brand-100 p-2.5 text-accent-600 shadow-inner dark:from-accent-500/15 dark:to-brand-500/10 dark:text-accent-400">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center shadow-glow sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-40" />
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-20 [filter:invert(1)]" />
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.08] mix-blend-overlay" />
          <h2 className="relative font-display text-2xl font-bold text-white sm:text-3xl">
            Start tracking in under a minute
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/85">
            No credit card, no setup — just an email, a password, and your first expense.
          </p>
          <Link
            to="/register"
            className="group relative mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-elevate-lg transition-transform hover:-translate-y-0.5"
          >
            Get started free <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-gray-200 px-4 py-12 dark:border-gray-800 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 font-display font-semibold text-gray-900 dark:text-gray-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
                <Wallet2 size={15} />
              </span>
              Finance Tracker
            </div>
            <p className="mt-3 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              A personal finance and budget tracker — built for keeping your own money honest.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400">Get started</Link></li>
              <li><Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/forgot-password" className="hover:text-brand-600 dark:hover:text-brand-400">Forgot password</Link></li>
              <li><Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Built with</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>React &amp; Tailwind CSS</li>
              <li>Node, Express &amp; PostgreSQL</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-gray-200 pt-6 text-center text-xs text-gray-400 dark:border-gray-800">
          © {new Date().getFullYear()} Finance Tracker. Built for personal use.
        </div>
      </footer>
    </div>
  );
}
