import React, { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../utils/format';
import Tilt3D from './Tilt3D.jsx';

const TONE_STYLES = {
  default: {
    text: 'text-gray-900 dark:text-gray-100',
    badge: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 dark:from-gray-800 dark:to-gray-700 dark:text-gray-400',
    glow: 'bg-gray-400/20',
  },
  positive: {
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600 dark:from-green-500/20 dark:to-green-500/5 dark:text-green-400',
    glow: 'bg-green-400/25',
  },
  negative: {
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-gradient-to-br from-red-100 to-red-200 text-red-600 dark:from-red-500/20 dark:to-red-500/5 dark:text-red-400',
    glow: 'bg-red-400/25',
  },
  brand: {
    text: 'text-brand-600 dark:text-brand-400',
    badge: 'bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600 dark:from-brand-500/20 dark:to-brand-500/5 dark:text-brand-400',
    glow: 'bg-brand-400/25',
  },
};

// Animates a number counting up/down toward its new value instead of
// snapping instantly — small touch, but it's what makes the dashboard feel
// alive rather than static when you switch months or add a transaction.
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const rafRef = useRef();

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    if (typeof to !== 'number' || from === to) {
      setValue(to);
      prevTarget.current = to;
      return undefined;
    }
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(from + (to - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export default function SummaryCard({ label, value, icon: Icon, tone = 'default', hint }) {
  const styles = TONE_STYLES[tone];
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? value : 0);

  return (
    <div className="group relative">
      {/* Soft tone-matched glow behind the card — subtle at rest, brighter on
          hover, so the stat cards feel like they're lifting off the page
          rather than just casting a generic gray shadow. */}
      <div
        className={`absolute inset-2 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 ${styles.glow}`}
      />
      <Tilt3D max={8}>
        <div className="card card-shine p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            {Icon && (
              <span className={`rounded-xl p-2.5 shadow-inner ${styles.badge}`}>
                <Icon size={16} />
              </span>
            )}
          </div>
          <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${styles.text}`}>
            {isNumeric ? formatCurrency(Math.round(animatedValue)) : value}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
        </div>
      </Tilt3D>
    </div>
  );
}
