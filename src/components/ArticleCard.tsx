'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  index?: number;
}

export default function ArticleCard({ article, featured = false, index = 0 }: ArticleCardProps) {
  const formattedDate = article.date?.seconds
    ? new Date(article.date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: 'easeOut',
      }}
      whileHover={{ x: -4 }}
      className={`group bg-[var(--background)] border-b border-[var(--border)] pb-6 ${featured ? 'border-l-4 border-l-[var(--accent)] pl-6' : ''}`}
    >
      <Link href={`/writeups/${article.id}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center pt-4">
        {/* Thumbnail - on top for mobile, right side for desktop */}
        {article.imageUrl && (
          <div className={`relative overflow-hidden rounded-lg flex-shrink-0 shadow-sm group-hover:shadow-lg transition-shadow duration-300 w-full h-48 ${featured ? 'sm:w-48 sm:h-36' : 'sm:w-32 sm:h-24'}`}>
            <motion.img
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
              <span className="byline text-xs sm:text-sm">{article.author}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              <time className="text-xs text-[var(--muted)]">{formattedDate}</time>
            </div>
            <h3 className={`headline mb-2 sm:mb-3 group-hover:text-[var(--accent)] transition-colors ${featured ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'}`}>
              {article.title}
            </h3>
            <p className="text-[var(--muted)] leading-relaxed line-clamp-2 text-sm">
              {article.excerpt}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-3">
            <span>{article.readTime}</span>
            <span className="text-[var(--accent)]">→</span>
            <span className="text-[var(--accent)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Read story
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
