'use client';

import { useState } from 'react';
import { addSubscriber } from '@/lib/firestore';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');

    try {
      await addSubscriber(email);
      setStatus('success');
      setMessage('Thank you for subscribing.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-slate-50 border border-hairline p-8 md:p-12">
      <h3 className="font-serif text-2xl font-bold text-center mb-2">
        Stay Informed
      </h3>
      <p className="text-slate-600 text-center mb-6 text-sm">
        Get our weekly market analysis delivered to your inbox.
      </p>

      {status === 'success' ? (
        <p className="text-center text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-center text-sm text-red-600 mt-3">{message}</p>
      )}
    </div>
  );
}
