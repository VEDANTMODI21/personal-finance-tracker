import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950 text-center px-4">
      <Compass size={40} className="text-brand-500" />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <Link to="/" className="btn-primary mt-2">Back to home</Link>
    </div>
  );
}
