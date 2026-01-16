'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '@/types';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const formattedDate = article.date?.seconds
    ? new Date(article.date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const stripHtmlAndMarkdown = useCallback((text: string): string => {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/>\s/g, '')
      .replace(/[-*]\s/g, '')
      .trim();
  }, []);

  const getTextToRead = useCallback(() => {
    return `${article.title}. By ${article.author}. ${stripHtmlAndMarkdown(article.content)}`;
  }, [article.title, article.author, article.content, stripHtmlAndMarkdown]);

  // Calculate estimated duration based on word count and speed
  useEffect(() => {
    const text = getTextToRead();
    const wordCount = text.split(/\s+/).length;
    // Average speaking rate is about 150 words per minute at 1x speed
    const baseDuration = (wordCount / 150) * 60;
    setEstimatedDuration(baseDuration);
  }, [getTextToRead]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    startTimeRef.current = Date.now() - pausedTimeRef.current;

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const adjustedDuration = estimatedDuration / speed;
      const currentProgress = Math.min((elapsed / adjustedDuration) * 100, 100);
      setElapsedTime(elapsed);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    if (isPlaying && !isPaused) {
      // Pause
      window.speechSynthesis.pause();
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
      stopProgressTracking();
      return;
    }

    if (isPaused) {
      // Resume
      window.speechSynthesis.resume();
      setIsPaused(false);
      startProgressTracking();
      return;
    }

    // Start new speech
    window.speechSynthesis.cancel();
    pausedTimeRef.current = 0;

    const textToRead = getTextToRead();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speed;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      stopProgressTracking();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      stopProgressTracking();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    startProgressTracking();
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      setElapsedTime(0);
      pausedTimeRef.current = 0;
      stopProgressTracking();
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);

    // If currently playing, restart with new speed
    if (isPlaying && !isPaused && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      stopProgressTracking();

      const textToRead = getTextToRead();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = newSpeed;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        stopProgressTracking();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        stopProgressTracking();
      };

      utteranceRef.current = utterance;

      // Reset progress for speed change
      pausedTimeRef.current = 0;
      setProgress(0);
      setElapsedTime(0);

      window.speechSynthesis.speak(utterance);
      startProgressTracking();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    // Web Speech API doesn't support seeking, so we'll restart from beginning
    // This is a limitation of the browser API
    if (!isPlaying) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;

    // For now, just show a visual feedback - true seeking isn't supported
    // If user clicks, we restart from the beginning
    handleStop();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-12"
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
        <div className="flex items-center gap-3 text-sm text-[var(--muted)] mb-4 flex-wrap">
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
          className="aspect-[16/9] relative overflow-hidden mb-8 rounded-lg"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      )}

      {/* Audio Player - Only for writeups */}
      {article.type === 'writeup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-10 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg"
        >
          <div className="flex items-center gap-4 mb-3">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlay}
              className="w-12 h-12 flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full transition-colors flex-shrink-0"
            >
              {isPlaying && !isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div
                className="h-2 bg-[var(--border)] rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                <span>{formatTime(elapsedTime)}</span>
                <span>{formatTime(estimatedDuration / speed)}</span>
              </div>
            </div>

            {/* Stop Button */}
            {isPlaying && (
              <button
                onClick={handleStop}
                className="w-10 h-10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>
            )}
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Speed:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  speed === s
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
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
            // Charts - responsive with horizontal scroll when needed, inverts in dark mode
            iframe: ({ src, width, height }) => (
              <div className="my-8 overflow-x-auto">
                <div className="inline-block border-l-4 border-[var(--accent)] bg-white dark-mode-chart rounded-r-lg shadow-lg">
                  <iframe
                    src={src}
                    width={width || 800}
                    height={height || 500}
                    frameBorder="0"
                    scrolling="no"
                    style={{ border: 'none', display: 'block' }}
                  />
                </div>
              </div>
            ),
            // Images - centered and responsive
            img: ({ src, alt }) => (
              <span className="block my-8">
                <img
                  src={src}
                  alt={alt || ''}
                  className="w-full h-auto rounded-lg"
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
