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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your finances for the selected month</p>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {loading && <PageLoader label="Loading dashboard…" />}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && data && (
        <div className="space-y-6">
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
            <SummaryCard label="Income" value={data.summary.income} icon={Wallet} tone="positive" />
            <SummaryCard label="Expenses" value={data.summary.expenses} icon={Receipt} tone="negative" />
            <SummaryCard label="Balance" value={data.summary.balance} icon={Scale} tone={data.summary.balance >= 0 ? 'positive' : 'negative'} />
            <SummaryCard label="Loans Given" value={data.summary.loansGiven} icon={HandCoins} />
            <SummaryCard label="Repaid" value={data.summary.loansRepaid} icon={TrendingDown} tone="positive" />
            <SummaryCard label="Outstanding" value={data.summary.outstandingLoans} icon={HandCoins} tone="negative" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Spending by Category</h3>
              <CategoryDonutChart data={data.categoryBreakdown} />
            </div>
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Monthly Spending</h3>
              <MonthlyLineChart data={data.dailySpending} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Income vs Expense</h3>
              <IncomeExpenseBarChart income={data.summary.income} expenses={data.summary.expenses} />
            </div>
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Loan Status</h3>
              <LoanStatusChart breakdown={data.loanSummary.statusBreakdown} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Transactions</h3>
            <TransactionTable transactions={data.recentTransactions} />
          </div>
        </div>
      )}
    </Layout>
  );
}
