import React, { useState } from 'react';
import { formatDateInput } from '../../utils/format';

export default function LoanForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    personName: initial?.personName ?? '',
    amount: initial?.amount ?? '',
    dateGiven: formatDateInput(initial?.dateGiven),
    dueDate: initial?.dueDate ? formatDateInput(initial.dueDate) : '',
    notes: initial?.notes ?? '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.personName.trim()) {
      setError("Person's name is required.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    try {
      await onSubmit({ ...form, amount: Number(form.amount), dueDate: form.dueDate || null });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save loan.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
      <div>
        <label className="label">Person&rsquo;s name</label>
        <input name="personName" className="input" value={form.personName} onChange={handleChange} placeholder="e.g. Rahul" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" name="amount" className="input" value={form.amount} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Date given</label>
          <input type="date" name="dateGiven" className="input" value={form.dateGiven} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <label className="label">Due date (optional)</label>
        <input type="date" name="dueDate" className="input" value={form.dueDate} onChange={handleChange} />
      </div>
      <div>
        <label className="label">Notes (optional)</label>
        <textarea name="notes" rows={2} className="input" value={form.notes} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add loan'}
        </button>
      </div>
    </form>
  );
}
