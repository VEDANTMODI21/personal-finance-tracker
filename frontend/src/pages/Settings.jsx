import React, { useState } from 'react';
import { KeyRound, Moon, Wallet, Save } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/auth.api';
import { userApi } from '../services/budget.api';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext.jsx';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState('');

  const [budgetForm, setBudgetForm] = useState({
    monthlyBudget: user?.monthlyBudget ?? '',
    budgetAlertPct: user?.budgetAlertPct ?? 90,
  });
  const [budgetSubmitting, setBudgetSubmitting] = useState(false);

  const handlePasswordChange = (e) => setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwSubmitting(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwError(extractErrorMessage(err));
    } finally {
      setPwSubmitting(false);
    }
  };

  const toggleDarkMode = async () => {
    const next = !user?.darkMode;
    updateUser({ darkMode: next });
    try {
      await userApi.updateSettings({ darkMode: next });
    } catch {
      toast.error('Could not save dark mode preference.');
    }
  };

  const submitBudget = async (e) => {
    e.preventDefault();
    setBudgetSubmitting(true);
    try {
      const res = await userApi.updateSettings({
        monthlyBudget: budgetForm.monthlyBudget === '' ? null : Number(budgetForm.monthlyBudget),
        budgetAlertPct: Number(budgetForm.budgetAlertPct),
      });
      updateUser(res.data.data.user);
      toast.success('Budget preferences saved.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBudgetSubmitting(false);
    }
  };

  return (
    <Layout title="Settings">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Moon size={16} /> Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Dark mode</p>
              <p className="text-xs text-gray-400">Switch between light and dark themes</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-6 w-11 rounded-full transition-colors ${user?.darkMode ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              aria-label="Toggle dark mode"
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${user?.darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Wallet size={16} /> Monthly Budget
          </h3>
          <form onSubmit={submitBudget} className="space-y-4">
            <div>
              <label className="label">Monthly budget limit (₹, optional)</label>
              <input
                type="number"
                min="0"
                className="input"
                value={budgetForm.monthlyBudget}
                onChange={(e) => setBudgetForm((f) => ({ ...f, monthlyBudget: e.target.value }))}
                placeholder="e.g. 40000"
              />
            </div>
            <div>
              <label className="label">Alert me when I&rsquo;ve used (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="input"
                value={budgetForm.budgetAlertPct}
                onChange={(e) => setBudgetForm((f) => ({ ...f, budgetAlertPct: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={budgetSubmitting}>
              <Save size={16} /> {budgetSubmitting ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <KeyRound size={16} /> Change Password
          </h3>
          <form onSubmit={submitPasswordChange} className="grid gap-4 sm:grid-cols-3 max-w-2xl">
            {pwError && (
              <div className="sm:col-span-3 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                {pwError}
              </div>
            )}
            <div>
              <label className="label">Current password</label>
              <input type="password" name="currentPassword" className="input" value={pwForm.currentPassword} onChange={handlePasswordChange} required />
            </div>
            <div>
              <label className="label">New password</label>
              <input type="password" name="newPassword" minLength={8} className="input" value={pwForm.newPassword} onChange={handlePasswordChange} required />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input type="password" name="confirmNewPassword" className="input" value={pwForm.confirmNewPassword} onChange={handlePasswordChange} required />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" className="btn-primary" disabled={pwSubmitting}>
                {pwSubmitting ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
