import React, { useState } from 'react';
import { formatCurrency, formatDateInput } from '../../utils/format';

export default function RepaymentForm({ remainingAmount, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({ amount: '', paymentDate: formatDateInput(), notes: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = Number(form.amount);
    if (!amt || amt <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (amt > remainingAmount) {
      setError(`Amount cannot exceed the outstanding balance of ${formatCurrency(remainingAmount)}.`);
      return;
    }
    try {
      await onSubmit({ ...form, amount: amt });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not record repayment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Outstanding balance: <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(remainingAmount)}</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" max={remainingAmount} name="amount" className="input" value={form.amount} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Payment date</label>
          <input type="date" name="paymentDate" className="input" value={form.paymentDate} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <label className="label">Notes (optional)</label>
        <textarea name="notes" rows={2} className="input" value={form.notes} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Recording…' : 'Record repayment'}
        </button>
      </div>
    </form>
  );
}
