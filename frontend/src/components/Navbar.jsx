import React, { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../services/budget.api';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick, title }) {
  const { user, logout, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggleDarkMode = async () => {
    const next = !user?.darkMode;
    updateUser({ darkMode: next });
    try {
      await userApi.updateSettings({ darkMode: next });
    } catch {
      // Non-critical; UI already reflects the intended state.
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-gray-500" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle dark mode"
        >
          {user?.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || <UserIcon size={16} />}
            </span>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg py-1">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
