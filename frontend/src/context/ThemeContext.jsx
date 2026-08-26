import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

// Dark mode has two independent sources of truth in this app: a logged-in
// user's saved account setting (handled entirely by AuthContext, applied
// once they log in) and — this context — a plain browser preference for
// anyone browsing the public pages (landing, login, register, forgot/reset
// password) who isn't signed in yet. Both just toggle the same `dark` class
// on <html>, so whichever ran most recently wins; that's fine since they're
// never both driving UI at the same time (this toggle only appears on
// public pages, the account one only inside the signed-in app).
function getInitialDark() {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {
        // Private browsing / storage disabled — theme just won't persist.
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
