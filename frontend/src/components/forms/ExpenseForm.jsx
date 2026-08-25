import React, { useState } from 'react';
import { PAYMENT_METHODS, LABELS } from '../../utils/constants';
import { formatDateInput } from '../../utils/format';

export default function ExpenseForm({ initial, categories, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
    description: initial?.description ?? '',
    date: formatDateInput(initial?.date),
    paymentMethod: initial?.paymentMethod ?? 'CASH',
    notes: initial?.notes ?? '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save expense.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" name="amount" className="input" value={form.amount} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" name="date" className="input" value={form.date} onChange={handleChange} required />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <input name="description" className="input" value={form.description} onChange={handleChange} placeholder="e.g. Dinner" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select name="categoryId" className="input" value={form.categoryId} onChange={handleChange} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select name="paymentMethod" className="input" value={form.paymentMethod} onChange={handleChange} required>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{LABELS[m]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notes (optional)</label>
        <textarea name="notes" rows={2} className="input" value={form.notes} onChange={handleChange} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
