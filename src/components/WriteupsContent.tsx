'use client';

import { motion } from 'framer-motion';
import ArticleCard from '@/components/ArticleCard';
import RotatingText from '@/components/RotatingText';
import { Article } from '@/types';

interface WriteupsContentProps {
  articles: Article[];
}

export default function WriteupsContent({ articles }: WriteupsContentProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-200px)]">
      {/* Left Side - Fixed on desktop */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-2/5 lg:sticky lg:top-0 lg:h-[calc(100vh-200px)] flex flex-col justify-center pr-0 lg:pr-16 pb-8 lg:pb-0"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-1 bg-[var(--accent)] mb-6 lg:mb-8"
        />
        <h1 className="headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 lg:mb-6">
          Stories &{' '}
          <RotatingText
            texts={['Insights', 'Analysis', 'Reports', 'Deep Dives']}
            className="text-[var(--accent)]"
          />
        </h1>
        <p className="text-[var(--muted)] text-base lg:text-xl max-w-md leading-relaxed mb-6 lg:mb-8">
          Deep dives into business, finance, and the forces shaping markets.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 text-sm text-[var(--muted)]"
        >
          <span className="w-8 h-px bg-[var(--accent)]" />
          <span>{articles.length} {articles.length === 1 ? 'story' : 'stories'} published</span>
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
              We&apos;re working on in-depth analysis and market insights.<br />
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
                  staggerChildren: 0.12,
                },
              },
            }}
            className="space-y-8 py-4"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.4 }}
              >
                <ArticleCard article={article} index={index} featured={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
