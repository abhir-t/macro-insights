'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-8"
        >
          ❤️
        </motion.div>

        <h1 className="headline text-4xl md:text-5xl lg:text-6xl mb-8">
          Thank You for the <span className="text-[var(--accent)]">Thought!</span>
        </h1>

        <p className="text-xl text-[var(--muted)] leading-relaxed mb-8 max-w-2xl mx-auto">
          We truly appreciate your willingness to support us. However, we are not accepting any donations at this time.
        </p>

        <p className="text-lg text-[var(--muted)] leading-relaxed mb-12 max-w-2xl mx-auto">
          The best way to support us right now is to read and share our stories with others who might find them valuable.
        </p>

        <Link
          href="/writeups"
          className="inline-block px-8 py-4 bg-[var(--accent)] text-white font-semibold uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-colors rounded"
        >
          Read Our Stories
        </Link>
      </motion.div>
    </div>
  );
}
