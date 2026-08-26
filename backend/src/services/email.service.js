const env = require('../config/env');

/**
 * Sends the password-reset email via Resend's HTTP API
 * (https://resend.com — free tier, no domain verification required when
 * sending from their `onboarding@resend.dev` sandbox address).
 *
 * Returns { sent: boolean } rather than throwing, so a misconfigured or
 * temporarily-down email provider never turns into a 500 for the user —
 * the caller decides what to show when sending didn't happen.
 */
async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to,
        subject: 'Reset your Finance Tracker password',
        html: buildResetEmailHtml({ name, resetUrl }),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] Resend API responded with an error:', res.status, body);
      return { sent: false, reason: 'provider_error' };
    }

    return { sent: true };
  } catch (err) {
    console.error('[email] Failed to reach the email provider:', err.message);
    return { sent: false, reason: 'network_error' };
  }
}

function buildResetEmailHtml({ name, resetUrl }) {
  return `
  <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f7fc;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-flex; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #a855f7, #14b8a6); align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 700; line-height: 48px;">₹</span>
    </div>
    <h2 style="color: #1c1730; text-align: center; margin: 0 0 8px; font-size: 20px;">Reset your password</h2>
    <p style="color: #5b4f87; text-align: center; margin: 0 0 24px; font-size: 14px; line-height: 1.5;">
      Hi ${name || 'there'}, we received a request to reset your Finance Tracker password.
      This link expires in 1 hour. If you didn&rsquo;t request this, you can safely ignore this email.
    </p>
    <div style="text-align: center;">
      <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px;">
        Reset password
      </a>
    </div>
    <p style="color: #9d93c4; font-size: 12px; text-align: center; margin-top: 24px; word-break: break-all;">
      Or paste this link into your browser:<br />${resetUrl}
    </p>
  </div>
  `;
}

module.exports = { sendPasswordResetEmail };
