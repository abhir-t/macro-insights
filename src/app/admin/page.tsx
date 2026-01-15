'use client';

import { useState } from 'react';
import AdminForm from '@/components/AdminForm';

const ADMIN_PASSWORD = 'vantage2024'; // Change this to your desired password

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <h1 className="font-serif text-3xl font-bold mb-2">Admin Access</h1>
        <p className="text-slate-600 mb-8">Enter password to continue.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[var(--accent)] text-white text-sm uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-bold mb-2">Admin</h1>
      <p className="text-slate-600 mb-8">Publish new content to the newsletter.</p>
      <AdminForm />
    </div>
  );
}
