import React, { useEffect, useState, useCallback } from 'react';
import { FileDown, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { reportApi, triggerBlobDownload } from '../services/report.api';
import { useToast } from '../context/ToastContext.jsx';
import { monthKey, formatCurrency } from '../utils/format';

export default function Reports() {
  const toast = useToast();
  const [month, setMonth] = useState(monthKey());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.monthly(month);
      setReport(res.data.data.report);
    } catch {
      toast.error('Could not load the report.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const download = async (kind) => {
    setDownloading(kind);
    try {
      const fns = { pdf: reportApi.downloadPdf, excel: reportApi.downloadExcel, csv: reportApi.downloadCsv };
      const exts = { pdf: 'pdf', excel: 'xlsx', csv: 'csv' };
      const res = await fns[kind](month);
      triggerBlobDownload(res.data, `finance-report-${month}.${exts[kind]}`);
      toast.success('Download started.');
    } catch {
      toast.error('Could not generate the file.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Layout title="Reports">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Generate a full monthly financial report</p>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => download('pdf')} disabled={downloading}>
          <FileText size={16} /> {downloading === 'pdf' ? 'Generating…' : 'Download PDF'}
        </button>
        <button className="btn-secondary" onClick={() => download('excel')} disabled={downloading}>
          <FileSpreadsheet size={16} /> {downloading === 'excel' ? 'Generating…' : 'Download Excel'}
        </button>
        <button className="btn-secondary" onClick={() => download('csv')} disabled={downloading}>
          <FileDown size={16} /> {downloading === 'csv' ? 'Generating…' : 'Download CSV'}
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <SummaryCard label="Income" value={report.summary.income} tone="positive" />
            <SummaryCard label="Expenses" value={report.summary.expenses} tone="negative" />
            <SummaryCard label="Balance" value={report.summary.balance} tone={report.summary.balance >= 0 ? 'positive' : 'negative'} />
            <SummaryCard label="Loans Given" value={report.summary.loansGiven} />
            <SummaryCard label="Loans Repaid" value={report.summary.loansRepaid} tone="positive" />
            <SummaryCard label="Outstanding" value={report.summary.outstanding} tone="negative" />
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <TrendingUp size={16} /> Expense Breakdown
            </h3>
            {report.expenseBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400">No expenses recorded for this period.</p>
            ) : (
              <div className="space-y-2">
                {report.expenseBreakdown.map((c) => (
                  <div key={c.category} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 text-gray-600 dark:text-gray-300">{c.category}</span>
                    <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.min(c.percentage, 100)}%` }} />
                    </div>
                    <span className="w-24 shrink-0 text-right font-medium text-gray-700 dark:text-gray-200">{formatCurrency(c.total)}</span>
                    <span className="w-12 shrink-0 text-right text-xs text-gray-400">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Largest Expenses</h3>
            {report.largestExpenses.length === 0 ? (
              <p className="text-sm text-gray-400">No expenses recorded for this period.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {report.largestExpenses.map((e, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-200">{e.description} <span className="text-gray-400">· {e.category}</span></span>
                    <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Loan Summary</h3>
            {report.loanSummaryRows.length === 0 ? (
              <p className="text-sm text-gray-400">No loans on record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-gray-400">
                      <th className="py-2">Person</th>
                      <th className="py-2 text-right">Given</th>
                      <th className="py-2 text-right">Repaid</th>
                      <th className="py-2 text-right">Outstanding</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.loanSummaryRows.map((l, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-800/60">
                        <td className="py-2">{l.personName}</td>
                        <td className="py-2 text-right">{formatCurrency(l.amountGiven)}</td>
                        <td className="py-2 text-right text-green-600 dark:text-green-400">{formatCurrency(l.repaid)}</td>
                        <td className="py-2 text-right text-red-600 dark:text-red-400">{formatCurrency(l.outstanding)}</td>
                        <td className="py-2 text-right">{l.status.replace('_', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
