import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Receipt } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import PageLoader from '../components/PageLoader.jsx';
import ExpenseForm from '../components/forms/ExpenseForm.jsx';
import { expenseApi } from '../services/expense.api';
import { categoryApi } from '../services/category.api';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency, formatDate } from '../utils/format';
import { LABELS } from '../utils/constants';

export default function Expenses() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadCategories = useCallback(async () => {
    const res = await categoryApi.list();
    setCategories(res.data.data.categories);
  }, []);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseApi.list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
      });
      setExpenses(res.data.data.expenses);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Could not load expenses.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, categoryFilter]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadExpenses(); }, [loadExpenses]);
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (expense) => { setEditing(expense); setModalOpen(true); };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await expenseApi.update(editing.id, values);
        toast.success('Expense updated.');
      } else {
        await expenseApi.create(values);
        toast.success('Expense added.');
      }
      setModalOpen(false);
      loadExpenses();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseApi.remove(deleteTarget.id);
      toast.success('Expense deleted.');
      setDeleteTarget(null);
      loadExpenses();
    } catch (err) {
      toast.error('Could not delete expense.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Expenses">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses found" description="Try adjusting your filters or add a new expense." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Payment</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{e.description}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 dark:text-gray-400">{e.category?.name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400">{LABELS[e.paymentMethod]}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost !px-2" onClick={() => openEdit(e)} aria-label="Edit"><Pencil size={15} /></button>
                          <button className="btn-ghost !px-2 text-red-500" onClick={() => setDeleteTarget(e)} aria-label="Delete"><Trash2 size={15} /></button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <ExpenseForm
          initial={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        description={`Delete "${deleteTarget?.description}"? This cannot be undone.`}
      />
    </Layout>
  );
}
