'use client';

import { useState } from 'react';
import { addSubscriber } from '@/lib/firestore';

export default function StickySignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await addSubscriber(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (isMinimized) {
    return (
      <div className="sticky-footer">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <p className="text-white/80 text-sm">Get exclusive stories delivered to your inbox</p>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-[var(--accent)] text-sm font-medium hover:underline"
          >
            Subscribe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky-footer">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-white text-xl md:text-2xl font-serif font-bold mb-2">
              Sign up for free access to Macro Insights
            </h3>
            <p className="text-white/70 text-sm">
              Get access to exclusive stories, market analysis, and expert insights.
              Sign up with just your email address.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'success' ? (
              <p className="text-white py-3">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[var(--accent)] min-w-[250px]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-accent whitespace-nowrap disabled:opacity-50"
                >
                  {status === 'loading' ? 'Signing up...' : 'Sign Up Free'}
                </button>
              </form>
            )}
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
            aria-label="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {status === 'error' && (
          <p className="text-red-400 text-sm mt-2">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}
