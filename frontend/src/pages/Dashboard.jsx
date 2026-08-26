import React, { useEffect, useState, useCallback } from 'react';
import { Wallet, Receipt, Scale, HandCoins, TrendingDown, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import CategoryDonutChart from '../components/charts/CategoryDonutChart.jsx';
import MonthlyLineChart from '../components/charts/MonthlyLineChart.jsx';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart.jsx';
import LoanStatusChart from '../components/charts/LoanStatusChart.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import PageLoader from '../components/PageLoader.jsx';
import Tilt3D from '../components/Tilt3D.jsx';
import Reveal from '../components/Reveal.jsx';
import { dashboardApi } from '../services/dashboard.api';
import { monthKey } from '../utils/format';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const [month, setMonth] = useState(monthKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardApi.get({ month });
      setData(res.data.data);
    } catch (err) {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout title="Dashboard">
      {/* Extra layered glow behind the dashboard content specifically — on
          top of Layout's app-wide ambient blobs — so the busiest, most
          "look at this" page in the app reads as the deepest one too. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 animate-blob rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-500/10" />
        <div
          className="absolute right-1/4 top-10 h-72 w-72 animate-blob rounded-full bg-accent-400/10 blur-3xl dark:bg-accent-500/10"
          style={{ animationDelay: '5s' }}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your finances for the selected month</p>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {loading && <PageLoader label="Loading dashboard…" />}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && data && (
        <div className="space-y-6 [perspective:2000px]">
          {data.budgetAlert?.triggered && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>
                You&rsquo;ve used <strong>{data.budgetAlert.percentUsed}%</strong> of your {formatCurrency(data.budgetAlert.limit)} monthly budget
                {data.budgetAlert.exceeded ? ' and exceeded it.' : '.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'Income', value: data.summary.income, icon: Wallet, tone: 'positive', hint: 'This month' },
              { label: 'Expenses', value: data.summary.expenses, icon: Receipt, tone: 'negative', hint: 'This month' },
              { label: 'Balance', value: data.summary.balance, icon: Scale, tone: data.summary.balance >= 0 ? 'positive' : 'negative', hint: 'All-time total' },
              { label: 'Loans Given', value: data.summary.loansGiven, icon: HandCoins, hint: 'This month' },
              { label: 'Repaid', value: data.summary.loansRepaid, icon: TrendingDown, tone: 'positive', hint: 'This month' },
              { label: 'Outstanding', value: data.summary.outstandingLoans, icon: HandCoins, tone: 'negative', hint: 'All-time total' },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 60}>
                <SummaryCard {...card} />
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Reveal delay={0}>
              <Tilt3D max={9} liftZ={34}>
                <div className="card card-shine p-5">
                  <h3 className="mb-3 font-display text-sm font-semibold text-gray-700 dark:text-gray-200">Spending by Category</h3>
                  <CategoryDonutChart data={data.categoryBreakdown} />
                </div>
              </Tilt3D>
            </Reveal>
            <Reveal delay={80}>
              <Tilt3D max={9} liftZ={34}>
                <div className="card card-shine p-5">
                  <h3 className="mb-3 font-display text-sm font-semibold text-gray-700 dark:text-gray-200">Monthly Spending</h3>
                  <MonthlyLineChart data={data.dailySpending} />
                </div>
              </Tilt3D>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Reveal delay={0}>
              <Tilt3D max={9} liftZ={34}>
                <div className="card card-shine p-5">
                  <h3 className="mb-3 font-display text-sm font-semibold text-gray-700 dark:text-gray-200">Income vs Expense</h3>
                  <IncomeExpenseBarChart income={data.summary.income} expenses={data.summary.expenses} />
                </div>
              </Tilt3D>
            </Reveal>
            <Reveal delay={80}>
              <Tilt3D max={9} liftZ={34}>
                <div className="card card-shine p-5">
                  <h3 className="mb-3 font-display text-sm font-semibold text-gray-700 dark:text-gray-200">Loan Status</h3>
                  <LoanStatusChart breakdown={data.loanSummary.statusBreakdown} />
                </div>
              </Tilt3D>
            </Reveal>
          </div>

          <Reveal>
            <div className="card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Transactions</h3>
              <TransactionTable transactions={data.recentTransactions} />
            </div>
          </Reveal>
        </div>
      )}
    </Layout>
  );
}
