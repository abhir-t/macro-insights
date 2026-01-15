'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // For now, just simulate sending - you can integrate with a form service later
    setTimeout(() => {
      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-1 bg-[var(--accent)] mb-8"
        />

        <h1 className="headline text-4xl md:text-5xl lg:text-6xl mb-8">
          Get in <span className="text-[var(--accent)]">Touch</span>
        </h1>

        <p className="text-xl text-[var(--muted)] leading-relaxed mb-12 max-w-2xl">
          Have a question, feedback, or want to collaborate? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {status === 'sent' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 p-8 rounded-lg text-center"
              >
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-[var(--muted)]">We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full px-6 py-3 bg-[var(--accent)] text-white text-sm uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                Email
              </h3>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:abhirt8718@gmail.com"
                  className="text-lg hover:text-[var(--accent)] transition-colors"
                >
                  abhirt8718@gmail.com
                </a>
                <a
                  href="mailto:paranjayat@outlook.com"
                  className="text-lg hover:text-[var(--accent)] transition-colors"
                >
                  paranjayat@outlook.com
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                Connect With Us
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://www.linkedin.com/in/abhiraa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  Abhir on LinkedIn
                </a>
                <a
                  href="https://www.linkedin.com/in/paranjaythorat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  Paranjay on LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
