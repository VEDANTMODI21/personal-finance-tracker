import React, { useMemo } from 'react';

// A small set of extremely common passwords/patterns — anyone using one of
// these gets scored as weak regardless of length or character variety.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', '12345678', '123456789', '1234567890',
  'qwerty123', 'letmein', 'welcome1', 'admin123', 'iloveyou',
  '11111111', 'abc12345', 'football', 'monkey123', 'dragon123',
]);

/**
 * Lightweight zero-dependency strength heuristic (0-5). This is not a
 * cryptographic measure — it just rewards length + character variety and
 * penalizes very common / very repetitive passwords, which is enough to
 * nudge people away from weak passwords without shipping a large library.
 */
function scorePassword(password) {
  if (!password) return 0;
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return 0;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars < 4) score = Math.min(score, 1);

  return Math.min(score, 5);
}

const LEVELS = [
  { label: 'Very weak', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  { label: 'Weak', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { label: 'Good', bar: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
  { label: 'Strong', bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  { label: 'Very strong', bar: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
];

export default function PasswordStrength({ password }) {
  const score = useMemo(() => scorePassword(password), [password]);

  if (!password) return null;

  const level = LEVELS[score];
  const segments = 5;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? level.bar : 'bg-gray-200 dark:bg-gray-800'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${level.text}`}>{level.label}</p>
    </div>
  );
}
