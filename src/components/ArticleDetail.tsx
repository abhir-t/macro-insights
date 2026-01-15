'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '@/types';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const formattedDate = article.date?.seconds
    ? new Date(article.date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-12 overflow-hidden"
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="/writeups"
          className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors mb-8 group font-medium"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            whileHover={{ x: -4 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </motion.svg>
          Back to Stories
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-10"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100px' }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-1 bg-[var(--accent)] mb-6"
        />
        <div className="flex items-center gap-3 text-sm text-[var(--muted)] mb-4">
          <span className="uppercase tracking-widest font-semibold text-[var(--accent)]">{article.author}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <time>{formattedDate}</time>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span>{article.readTime}</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[var(--foreground)]"
        >
          {article.title}
        </motion.h1>
      </motion.header>

      {/* Cover Image */}
      {article.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="aspect-[16/9] relative overflow-hidden mb-12 rounded-lg"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="prose max-w-none"
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            // Charts - simple responsive iframe
            iframe: ({ src }) => (
              <div className="my-6 sm:my-8 w-full max-w-full overflow-hidden">
                <div className="border-l-4 border-[var(--accent)] bg-white rounded-r-lg shadow-lg overflow-hidden">
                  <div style={{ position: 'relative', paddingBottom: '70%', height: 0, overflow: 'hidden' }}>
                    <iframe
                      src={src}
                      frameBorder="0"
                      scrolling="no"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>
              </div>
            ),
            // Images - simple responsive
            img: ({ src, alt }) => (
              <span className="block my-6 sm:my-8 w-full max-w-full overflow-hidden">
                <img
                  src={src}
                  alt={alt || ''}
                  style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
                />
                {alt && (
                  <span className="block text-center text-sm text-[var(--muted)] mt-3 italic">
                    {alt}
                  </span>
                )}
              </span>
            ),
            // Styled headings
            h2: ({ children }) => (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.h2>
            ),
            h3: ({ children }) => (
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.h3>
            ),
            // Styled blockquotes
            blockquote: ({ children }) => (
              <motion.blockquote
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="border-l-4 border-[var(--accent)] pl-6 italic my-8 text-lg"
              >
                {children}
              </motion.blockquote>
            ),
            // Styled lists
            ul: ({ children }) => (
              <motion.ul
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="list-disc list-outside ml-6 space-y-2"
              >
                {children}
              </motion.ul>
            ),
            li: ({ children }) => (
              <li className="text-[var(--foreground)] pl-2">{children}</li>
            ),
            // Bold text in accent color
            strong: ({ children }) => (
              <strong className="text-[var(--accent)] font-semibold">{children}</strong>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-16 pt-8 border-t-2 border-[var(--accent)]"
      >
        <p className="text-[var(--muted)] text-sm">
          Published by <span className="text-[var(--accent)] font-semibold">{article.author}</span> on {formattedDate}
        </p>
      </motion.div>
    </motion.article>
  );
}
