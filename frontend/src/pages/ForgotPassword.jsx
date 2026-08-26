import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { authApi } from '../services/auth.api';
import { extractErrorMessage } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setSent(true);
      if (res.data.data.resetToken) setDevToken(res.data.data.resetToken);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll help you get back in">
      {sent ? (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>
            If an account exists for <strong>{email}</strong>, we&rsquo;ve emailed a reset link to it. It&rsquo;s valid
            for 1 hour — check your spam folder if it doesn&rsquo;t show up in a minute or two.
          </p>
          {devToken && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-400">
              No email provider is configured yet, so here&rsquo;s your token directly (this only ever appears outside
              production): use it on the{' '}
              <Link className="underline font-medium" to={`/reset-password?token=${devToken}`}>reset password page</Link>.
            </div>
          )}
          <Link to="/login" className="btn-secondary w-full inline-flex justify-center mt-2">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="email" type="email" required className="input pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <Mail size={16} />
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
