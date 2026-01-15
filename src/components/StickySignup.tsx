'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function StickySignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.9 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#e11d24', '#ffffff', '#000000'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#e11d24', '#ff6b6b', '#ffffff'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#e11d24', '#ffffff', '#ff8585'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#e11d24', '#000000', '#ffffff'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#ff4444', '#e11d24', '#ffffff'],
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
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="sticky-footer">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={hasAnimated ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
              <p className="text-white/80 text-sm">Get exclusive stories delivered to your inbox</p>
              <motion.button
                onClick={() => setIsMinimized(false)}
                className="text-[var(--accent)] text-sm font-medium hover:underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={hasAnimated ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-3 right-4 text-white/50 hover:text-white z-10"
              aria-label="Minimize"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className="max-w-7xl mx-auto px-6 py-6 pr-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-white text-xl md:text-2xl font-serif font-bold mb-2">
                    Sign up for free access to Vantage Post
                  </h3>
                  <p className="text-white/70 text-sm">
                    Get access to exclusive stories, market analysis, and expert insights.
                    Sign up with just your email address.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.p
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-white py-3 flex items-center gap-2"
                      >
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          className="text-green-400 text-2xl"
                        >
                          ✓
                        </motion.span>
                        Thank you for subscribing!
                      </motion.p>
                    ) : (
                      <form
                        key="form"
                        onSubmit={handleSubmit}
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[var(--accent)] min-w-[250px]"
                        />
                        <motion.button
                          type="submit"
                          disabled={status === 'loading'}
                          className="btn-accent whitespace-nowrap disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {status === 'loading' ? 'Signing up...' : 'Sign Up Free'}
                        </motion.button>
                      </form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm mt-2">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
