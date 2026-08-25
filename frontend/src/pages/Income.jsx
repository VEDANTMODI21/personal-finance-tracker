import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import PageLoader from '../components/PageLoader.jsx';
import IncomeForm from '../components/forms/IncomeForm.jsx';
import { incomeApi } from '../services/income.api';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDate } from '../utils/format';
import { LABELS } from '../utils/constants';

export default function Income() {
  const toast = useToast();
  const [incomes, setIncomes] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await incomeApi.list({ page, limit: 10 });
      setIncomes(res.data.data.incomes);
      setMeta(res.data.meta);
    } catch {
      toast.error('Could not load income records.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (income) => { setEditing(income); setModalOpen(true); };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await incomeApi.update(editing.id, values);
        toast.success('Income updated.');
      } else {
        await incomeApi.create(values);
        toast.success('Income added.');
      }
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await incomeApi.remove(deleteTarget.id);
      toast.success('Income record deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Could not delete income record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Income">
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Income
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : incomes.length === 0 ? (
          <EmptyState icon={Wallet} title="No income recorded yet" description="Add your salary, freelance income, or other earnings." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Description</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((i) => (
                    <tr key={i.id} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{formatDate(i.date)}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{LABELS[i.source]}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 dark:text-gray-400">{i.description || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(i.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost !px-2" onClick={() => openEdit(i)} aria-label="Edit"><Pencil size={15} /></button>
                          <button className="btn-ghost !px-2 text-red-500" onClick={() => setDeleteTarget(i)} aria-label="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <IncomeForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        description="Delete this income record? This cannot be undone."
      />
    </Layout>
  );
}
