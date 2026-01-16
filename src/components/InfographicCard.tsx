'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '@/types';

interface InfographicCardProps {
  article: Article;
  index?: number;
}

export default function InfographicCard({ article, index = 0 }: InfographicCardProps) {
  const formattedDate = article.date?.seconds
    ? new Date(article.date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -10,
        scale: 1.03,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
      }}
      className="group bg-[var(--background)] rounded-xl overflow-hidden border border-[var(--border)]"
    >
      <Link href={`/writeups/${article.id}`} className="block">
        <motion.div
          className="aspect-[4/3] relative overflow-hidden bg-[var(--border)]"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.svg
                className="w-12 h-12 text-[var(--muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </motion.svg>
            </div>
          )}
        </motion.div>
        <div className="p-4">
          <span className="byline">{article.author}</span>
          <h3 className="headline text-lg md:text-xl mt-1 group-hover:text-[var(--accent)] transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-2">
            {formattedDate}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
