import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tags, Lock } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';
import CategoryForm from '../components/forms/CategoryForm.jsx';
import { categoryApi } from '../services/category.api';
import { useToast } from '../context/ToastContext.jsx';
import { extractErrorMessage } from '../services/api';

export default function Categories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setModalOpen(true); };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await categoryApi.update(editing.id, values);
        toast.success('Category updated.');
      } else {
        await categoryApi.create(values);
        toast.success('Category created.');
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
      await categoryApi.remove(deleteTarget.id);
      toast.success('Category deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not delete category.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Categories">
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories yet" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card flex items-center justify-between p-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color || '#94a3b8' }} />
                <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{cat.name}</span>
                {cat.isDefault && <Lock size={12} className="text-gray-400 shrink-0" />}
              </div>
              {!cat.isDefault && (
                <div className="flex shrink-0 gap-0.5">
                  <button className="btn-ghost !px-1.5" onClick={() => openEdit(cat)} aria-label="Edit"><Pencil size={14} /></button>
                  <button className="btn-ghost !px-1.5 text-red-500" onClick={() => setDeleteTarget(cat)} aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <CategoryForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        description={`Delete "${deleteTarget?.name}"? Expenses using it must be reassigned first.`}
      />
    </Layout>
  );
}
