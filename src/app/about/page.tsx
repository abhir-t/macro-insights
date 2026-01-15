'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
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
          About <span className="text-[var(--accent)]">Vantage Post</span>
        </h1>

        <div className="prose max-w-none">
          <p className="text-xl text-[var(--muted)] leading-relaxed mb-8">
            Vantage Post delivers sharp, insightful analysis on business, finance, and the forces shaping global markets.
          </p>

          <h2>Our Mission</h2>
          <p>
            We believe in making complex financial topics accessible to everyone. Our team of analysts and writers work to break down market movements, economic trends, and business strategies into clear, actionable insights.
          </p>

          <h2>What We Cover</h2>
          <ul>
            <li><strong>Market Analysis</strong> - Deep dives into stock markets, commodities, and global trade</li>
            <li><strong>Economic Trends</strong> - Understanding the forces that drive economies</li>
            <li><strong>Business Strategy</strong> - How companies navigate challenges and opportunities</li>
            <li><strong>Data Visualizations</strong> - Complex data made simple through infographics</li>
          </ul>

          <h2>Why Subscribe?</h2>
          <p>
            Our subscribers get exclusive access to in-depth reports, early insights, and analysis you won't find anywhere else. Join thousands of informed readers who trust Vantage Post for their financial intelligence.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-[var(--border)]"
        >
          <p className="text-[var(--muted)]">
            Have questions? <a href="/contact" className="text-[var(--accent)] hover:underline">Get in touch</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
