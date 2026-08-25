import React, { useState } from 'react';
import { INCOME_SOURCES, LABELS } from '../../utils/constants';
import { formatDateInput } from '../../utils/format';

export default function IncomeForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    source: initial?.source ?? 'SALARY',
    description: initial?.description ?? '',
    date: formatDateInput(initial?.date),
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
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save income.');
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
        <label className="label">Source</label>
        <select name="source" className="input" value={form.source} onChange={handleChange} required>
          {INCOME_SOURCES.map((s) => (
            <option key={s} value={s}>{LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <input name="description" className="input" value={form.description} onChange={handleChange} placeholder="e.g. August salary" />
      </div>
      <div>
        <label className="label">Notes (optional)</label>
        <textarea name="notes" rows={2} className="input" value={form.notes} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add income'}
        </button>
      </div>
    </form>
  );
}
