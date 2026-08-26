import React, { useState, useCallback, useRef } from 'react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bgRef = useRef(null);
  const rafRef = useRef(null);

  // Subtle parallax: the ambient blobs drift a few pixels opposite the
  // cursor, giving the whole app a sense of layered depth instead of a
  // flat, static background — without being distracting or costing much
  // (throttled to one update per animation frame).
  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!bgRef.current) return;
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      bgRef.current.style.setProperty('--px', px.toFixed(3));
      bgRef.current.style.setProperty('--py', py.toFixed(3));
    });
  }, []);

  return (
    <div className="relative flex min-h-screen bg-gray-50 dark:bg-gray-950" onMouseMove={handleMouseMove}>
      {/* Fixed ambient background — sits behind everything, doesn't scroll,
          gives every page some depth instead of a single flat color. */}
      <div ref={bgRef} className="pointer-events-none fixed inset-0 overflow-hidden [--px:0] [--py:0]">
        <div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl transition-transform duration-500 ease-out dark:bg-brand-500/15"
          style={{ transform: 'translate3d(calc(var(--px) * -30px), calc(var(--py) * -30px), 0)' }}
        />
        <div
          className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-accent-400/10 blur-3xl transition-transform duration-700 ease-out dark:bg-accent-500/10"
          style={{ transform: 'translate3d(calc(var(--px) * 24px), calc(var(--py) * 24px), 0)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/5 blur-3xl transition-transform duration-500 ease-out dark:bg-fuchsia-500/10"
          style={{ transform: 'translate3d(calc(var(--px) * 18px), calc(var(--py) * -18px), 0)' }}
        />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex min-h-screen flex-1 flex-col lg:pl-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
