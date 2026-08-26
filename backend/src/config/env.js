require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  // Optional email delivery, tried in this order:
  //   1. Brevo (BREVO_API_KEY) — recommended. Free forever (300/day), no
  //      credit card, only needs one verified sender email (not a domain),
  //      and — critically on Render's free tier — talks over HTTPS, not
  //      raw SMTP (Render's free web services block outbound SMTP ports
  //      25/465/587 as of Sept 2025, which is why Gmail SMTP below cannot
  //      work there no matter how correctly it's configured).
  //   2. Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) — free and can email
  //      any recipient, but only usable if the backend is hosted somewhere
  //      that allows outbound SMTP (not Render's free tier — see above).
  //   3. Resend (RESEND_API_KEY) — free tier, but without a verified custom
  //      domain it can only deliver to the Resend account's own email.
  // When none are set, forgot-password is a documented no-op in production
  // and falls back to returning the token directly outside it.
  BREVO_API_KEY: process.env.BREVO_API_KEY || null,
  GMAIL_USER: process.env.GMAIL_USER || null,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || null,
  RESEND_API_KEY: process.env.RESEND_API_KEY || null,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Finance Tracker <onboarding@resend.dev>',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  isTest: (process.env.NODE_ENV || 'development') === 'test',
};

module.exports = env;
