import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageLoader from './components/PageLoader.jsx';

// Every page is code-split into its own chunk. This keeps the first
// download small (just the login screen + shared vendor chunk) instead of
// shipping the whole app — including recharts-heavy pages like the
// Dashboard and Reports — up front.
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Expenses = lazy(() => import('./pages/Expenses.jsx'));
const Income = lazy(() => import('./pages/Income.jsx'));
const Loans = lazy(() => import('./pages/Loans.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const Categories = lazy(() => import('./pages/Categories.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
