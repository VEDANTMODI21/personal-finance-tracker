import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { authApi } from '../services/auth.api';
import { extractErrorMessage } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
      {success ? (
        <p className="text-sm text-green-700 dark:text-green-400">Password reset! Redirecting to login…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
          <div>
            <label className="label" htmlFor="token">Reset token</label>
            <input id="token" name="token" required className="input" value={form.token} onChange={handleChange} placeholder="Paste your reset token" />
          </div>
          <div>
            <label className="label" htmlFor="newPassword">New password</label>
            <input id="newPassword" name="newPassword" type="password" required minLength={8} className="input" value={form.newPassword} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="confirmNewPassword">Confirm new password</label>
            <input id="confirmNewPassword" name="confirmNewPassword" type="password" required className="input" value={form.confirmNewPassword} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <KeyRound size={16} />
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-brand-600 hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
