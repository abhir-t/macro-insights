'use client';

import { motion } from 'framer-motion';
import InfographicCard from '@/components/InfographicCard';
import RotatingText from '@/components/RotatingText';
import { Article } from '@/types';

interface InfographicsContentProps {
  articles: Article[];
}

export default function InfographicsContent({ articles }: InfographicsContentProps) {
  return (
    <div className="flex min-h-[calc(100vh-200px)]">
      {/* Left Side - Fixed */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-2/5 lg:sticky lg:top-0 lg:h-[calc(100vh-200px)] flex flex-col justify-center pr-8 lg:pr-16 pb-8 lg:pb-0"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-1 bg-[var(--accent)] mb-8"
        />
        <h1 className="headline text-4xl md:text-5xl lg:text-6xl mb-6">
          Data &{' '}
          <RotatingText
            texts={['Visualizations', 'Insights', 'Analytics', 'Charts']}
            className="text-[var(--accent)]"
          />
        </h1>
        <p className="text-[var(--muted)] text-lg lg:text-xl max-w-md leading-relaxed mb-8">
          Charts, graphs, and visual insights that bring market data to life.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 text-sm text-[var(--muted)]"
        >
          <span className="w-8 h-px bg-[var(--accent)]" />
          <span>{articles.length} {articles.length === 1 ? 'visual' : 'visuals'} published</span>
        </motion.div>
      </motion.div>

      {/* Right Side - Scrollable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full lg:w-3/5 lg:border-l lg:border-[var(--border)] lg:pl-12"
      >
        {articles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--muted)] text-center">
              We&apos;re creating visual stories and data insights.<br />
              Sign up below to be notified when we publish.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4 }}
              >
                <InfographicCard article={article} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
