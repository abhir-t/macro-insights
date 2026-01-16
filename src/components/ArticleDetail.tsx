'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '@/types';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [estimatedDuration, setEstimatedDuration] = useState(0);

  // Refs for tracking without causing re-renders
  const textRef = useRef('');
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const startTimeRef = useRef(0);
  const durationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const chromeFixIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formattedDate = article.date?.seconds
    ? new Date(article.date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Strip HTML and markdown for clean text
  const stripHtmlAndMarkdown = (text: string): string => {
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/>\s/g, '')
      .replace(/[-*]\s/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Initialize text on mount
  useEffect(() => {
    const cleanContent = stripHtmlAndMarkdown(article.content);
    textRef.current = `${article.title}. By ${article.author}. ${cleanContent}`;

    // Estimate duration: ~150 words per minute
    const wordCount = textRef.current.split(/\s+/).length;
    const durationMs = (wordCount / 150) * 60 * 1000;
    durationRef.current = durationMs;
    setEstimatedDuration(durationMs / 1000); // in seconds
  }, [article.title, article.author, article.content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = () => {
    isPlayingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (chromeFixIntervalRef.current) {
      clearInterval(chromeFixIntervalRef.current);
      chromeFixIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Progress animation loop (uses refs to avoid stale closures)
  const animateProgress = () => {
    if (!isPlayingRef.current || !startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const duration = durationRef.current / speedRef.current;
    const newProgress = Math.min((elapsed / duration) * 100, 100);

    setProgress(newProgress);

    if (newProgress < 100 && isPlayingRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateProgress);
    }
  };

  // Handle play/stop
  const handlePlayPause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    if (isPlaying) {
      // Stop
      cleanup();
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    // Start playing
    cleanup();

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(textRef.current);
    utterance.rate = speed;
    speedRef.current = speed;

    utterance.onstart = () => {
      startTimeRef.current = Date.now();
      isPlayingRef.current = true;
      setIsPlaying(true);
      setProgress(0);
      animationFrameRef.current = requestAnimationFrame(animateProgress);

      // Chrome fix
      chromeFixIntervalRef.current = setInterval(() => {
        if (synth.speaking && !synth.paused) {
          synth.pause();
          synth.resume();
        }
      }, 10000);
    };

    utterance.onend = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setProgress(100);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (chromeFixIntervalRef.current) clearInterval(chromeFixIntervalRef.current);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted') return;
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (chromeFixIntervalRef.current) clearInterval(chromeFixIntervalRef.current);
    };

    synth.speak(utterance);
  };

  // Handle speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;

    if (isPlaying) {
      // Restart with new speed
      cleanup();
      setIsPlaying(false);
      setProgress(0);

      setTimeout(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(textRef.current);
        utterance.rate = newSpeed;

        utterance.onstart = () => {
          startTimeRef.current = Date.now();
          isPlayingRef.current = true;
          setIsPlaying(true);
          setProgress(0);
          animationFrameRef.current = requestAnimationFrame(animateProgress);

          chromeFixIntervalRef.current = setInterval(() => {
            if (synth.speaking && !synth.paused) {
              synth.pause();
              synth.resume();
            }
          }, 10000);
        };

        utterance.onend = () => {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setProgress(100);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          if (chromeFixIntervalRef.current) clearInterval(chromeFixIntervalRef.current);
        };

        utterance.onerror = (e) => {
          if (e.error === 'interrupted') return;
          isPlayingRef.current = false;
          setIsPlaying(false);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          if (chromeFixIntervalRef.current) clearInterval(chromeFixIntervalRef.current);
        };

        synth.speak(utterance);
      }, 100);
    }
  };

  // Format time display
  const formatTime = (progressPercent: number): string => {
    const totalSeconds = estimatedDuration / speed;
    const currentSeconds = (progressPercent / 100) * totalSeconds;
    const mins = Math.floor(currentSeconds / 60);
    const secs = Math.floor(currentSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (): string => {
    const totalSeconds = estimatedDuration / speed;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
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
          className="mb-10 p-4 sm:p-5 bg-[var(--dark)] border border-[var(--border)] rounded-lg"
        >
          <div className="flex flex-col items-center gap-4">
            {/* Play/Stop Button */}
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full transition-colors shadow-lg"
              aria-label={isPlaying ? 'Stop' : 'Play'}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </button>

            {/* Progress Bar */}
            <div className="w-full max-w-md">
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)] mt-2">
                <span>{formatTime(progress)}</span>
                <span>{formatTotalTime()}</span>
              </div>
            </div>

            {/* Speed Controls */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-[var(--muted)] mr-1">Speed:</span>
              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    speed === s
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--border)] text-[var(--muted)] hover:text-white hover:bg-[var(--accent)]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
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
