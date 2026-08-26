const nodemailer = require('nodemailer');
const env = require('../config/env');

function parseFromAddress(raw) {
  // Accepts either "Name <email@x.com>" or a bare "email@x.com".
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2].trim() };
  return { name: 'Finance Tracker', email: raw.trim() };
}

async function sendViaBrevo({ to, name, resetUrl }) {
  const sender = parseFromAddress(env.EMAIL_FROM);
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to, name: name || undefined }],
      subject: 'Reset your Finance Tracker password',
      htmlContent: buildResetEmailHtml({ name, resetUrl }),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[email] Brevo API responded with an error:', res.status, body);
    return { sent: false, reason: 'provider_error' };
  }
  return { sent: true };
}

let gmailTransporter = null;
function getGmailTransporter() {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return null;
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
    });
  }
  return gmailTransporter;
}

async function sendViaGmail({ to, name, resetUrl }) {
  const gmail = getGmailTransporter();
  if (!gmail) return null; // not configured — caller tries the next option
  try {
    await gmail.sendMail({
      from: env.EMAIL_FROM.includes('@') ? env.EMAIL_FROM : `Finance Tracker <${env.GMAIL_USER}>`,
      to,
      subject: 'Reset your Finance Tracker password',
      html: buildResetEmailHtml({ name, resetUrl }),
    });
    return { sent: true };
  } catch (err) {
    // Most likely cause on Render's free tier: outbound SMTP is blocked and
    // this call just timed out. Not fatal — fall through to the next option.
    console.error('[email] Gmail SMTP send failed:', err.message);
    return { sent: false, reason: 'smtp_failed' };
  }
}

async function sendViaResend({ to, name, resetUrl }) {
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
    console.error('[email] Failed to reach Resend:', err.message);
    return { sent: false, reason: 'network_error' };
  }
}

/**
 * Sends the password-reset email, trying whichever providers are
 * configured in order: Brevo, then Gmail SMTP, then Resend. Returns
 * { sent: boolean } rather than throwing, so a misconfigured or down email
 * provider never turns into a 500 for the user — the caller decides what
 * to show when sending didn't happen.
 */
async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (env.BREVO_API_KEY) {
    const result = await sendViaBrevo({ to, name, resetUrl });
    if (result.sent) return result;
  }

  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    const result = await sendViaGmail({ to, name, resetUrl });
    if (result?.sent) return result;
  }

  if (env.RESEND_API_KEY) {
    const result = await sendViaResend({ to, name, resetUrl });
    if (result.sent) return result;
  }

  if (!env.BREVO_API_KEY && !env.GMAIL_USER && !env.RESEND_API_KEY) {
    return { sent: false, reason: 'not_configured' };
  }
  return { sent: false, reason: 'all_providers_failed' };
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
