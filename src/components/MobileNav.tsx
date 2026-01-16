'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import confetti from 'canvas-confetti';
export default function MobileNav() {
  const pathname = usePathname();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem('vp_subscribed');
    setHasSubscribed(!!subscribed);
  }, []);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.9 },
      colors: ['#e11d24', '#ffffff', '#000000'],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to subscribe');

      setStatus('success');
      setEmail('');
      fireConfetti();
      localStorage.setItem('vp_subscribed', 'true');
      setHasSubscribed(true);
      setTimeout(() => setShowSubscribe(false), 2000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Subscribe Modal */}
      {showSubscribe && (
        <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setShowSubscribe(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-[var(--dark)] p-6 rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSubscribe(false)}
              className="absolute top-4 right-4 text-white/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className="text-white text-xl font-serif font-bold mb-2">
              Sign up for free access
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Get exclusive stories and market insights.
            </p>

            {status === 'success' ? (
              <p className="text-green-400 py-3 flex items-center gap-2">
                <span className="text-2xl">✓</span>
                Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[var(--accent)] rounded"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-accent rounded disabled:opacity-50"
                >
                  {status === 'loading' ? 'Signing up...' : 'Sign Up Free'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-red-400 text-sm mt-2">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--dark)] border-t border-white/10 md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          {/* Stories */}
          <Link
            href="/writeups"
            className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
              pathname.startsWith('/writeups') ? 'text-[var(--accent)]' : 'text-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span className="text-[10px] font-medium">Stories</span>
          </Link>

          {/* Subscribe button - in the middle */}
          {!hasSubscribed ? (
            <button
              onClick={() => setShowSubscribe(true)}
              className="flex flex-col items-center gap-1 px-3 py-2 text-white/60 active:text-[var(--accent)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="text-[10px] font-medium">Subscribe</span>
            </button>
          ) : (
            <div className="px-3 py-2" />
          )}

          {/* Infographics */}
          <Link
            href="/infographics"
            className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
              pathname.startsWith('/infographics') ? 'text-[var(--accent)]' : 'text-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span className="text-[10px] font-medium">Infographics</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
