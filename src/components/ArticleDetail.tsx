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
  // Audio player state
  const [playerState, setPlayerState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Refs for tracking
  const textRef = useRef<string>('');
  const textLengthRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chromeFixIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCharIndexRef = useRef<number>(0);
  const isStoppingRef = useRef<boolean>(false);

  const formattedDate = article.date?.seconds
    ? new Date(article.date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Strip HTML and markdown for clean text
  const stripHtmlAndMarkdown = useCallback((text: string): string => {
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
  }, []);

  // Get text to read
  const getTextToRead = useCallback(() => {
    const cleanContent = stripHtmlAndMarkdown(article.content);
    return `${article.title}. By ${article.author}. ${cleanContent}`;
  }, [article.title, article.author, article.content, stripHtmlAndMarkdown]);

  // Calculate duration on mount
  useEffect(() => {
    const text = getTextToRead();
    textRef.current = text;
    textLengthRef.current = text.length;

    // Estimate duration: ~150 words per minute, average word length ~5 chars
    const wordCount = text.split(/\s+/).length;
    const baseDuration = (wordCount / 150) * 60;
    setDuration(baseDuration);
  }, [getTextToRead]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSpeech();
    };
  }, []);

  // Clean up all speech-related resources
  const cleanupSpeech = () => {
    isStoppingRef.current = true;

    if (chromeFixIntervalRef.current) {
      clearInterval(chromeFixIntervalRef.current);
      chromeFixIntervalRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = null;
    lastCharIndexRef.current = 0;

    setTimeout(() => {
      isStoppingRef.current = false;
    }, 100);
  };

  // Start progress tracking based on character position
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const startTime = Date.now();
    const estimatedDuration = (duration / speed) * 1000; // in ms

    progressIntervalRef.current = setInterval(() => {
      if (isStoppingRef.current) return;

      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / estimatedDuration) * 100, 99);
      const elapsedSeconds = elapsed / 1000;

      setProgress(progressPercent);
      setCurrentTime(elapsedSeconds);
    }, 200);
  };

  // Chrome fix: pause/resume to prevent speech from stopping
  const startChromeFix = () => {
    if (chromeFixIntervalRef.current) {
      clearInterval(chromeFixIntervalRef.current);
    }

    chromeFixIntervalRef.current = setInterval(() => {
      if (isStoppingRef.current) return;

      const synth = window.speechSynthesis;
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000); // Every 10 seconds
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    const synth = window.speechSynthesis;

    if (playerState === 'playing') {
      // Pause
      synth.pause();
      setPlayerState('paused');

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (chromeFixIntervalRef.current) {
        clearInterval(chromeFixIntervalRef.current);
        chromeFixIntervalRef.current = null;
      }
      return;
    }

    if (playerState === 'paused') {
      // Resume
      synth.resume();
      setPlayerState('playing');
      startProgressTracking();
      startChromeFix();
      return;
    }

    // Start new speech
    cleanupSpeech();

    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      const text = textRef.current;
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (isStoppingRef.current) return;
        setPlayerState('playing');
        startProgressTracking();
        startChromeFix();
      };

      utterance.onend = () => {
        if (isStoppingRef.current) return;
        setPlayerState('idle');
        setProgress(100);
        setCurrentTime(duration / speed);

        if (chromeFixIntervalRef.current) {
          clearInterval(chromeFixIntervalRef.current);
          chromeFixIntervalRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };

      utterance.onerror = (event) => {
        // Ignore 'interrupted' errors from cancel()
        if (event.error === 'interrupted' || isStoppingRef.current) return;

        console.error('Speech error:', event.error);
        setPlayerState('idle');

        if (chromeFixIntervalRef.current) {
          clearInterval(chromeFixIntervalRef.current);
          chromeFixIntervalRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };

      utterance.onboundary = (event) => {
        if (isStoppingRef.current) return;
        if (event.charIndex !== undefined) {
          lastCharIndexRef.current = event.charIndex;
          const progressPercent = (event.charIndex / textLengthRef.current) * 100;
          setProgress(Math.min(progressPercent, 99));
        }
      };

      utteranceRef.current = utterance;
      isStoppingRef.current = false;
      synth.speak(utterance);
    }, 50);
  };

  // Handle stop
  const handleStop = () => {
    cleanupSpeech();
    setPlayerState('idle');
    setProgress(0);
    setCurrentTime(0);
  };

  // Handle speed change
  const handleSpeedChange = (newSpeed: number) => {
    const wasPlaying = playerState === 'playing';

    // Stop current speech
    cleanupSpeech();
    setSpeed(newSpeed);
    setProgress(0);
    setCurrentTime(0);
    setPlayerState('idle');

    // If was playing, restart with new speed after a brief delay
    if (wasPlaying) {
      setTimeout(() => {
        const synth = window.speechSynthesis;
        const text = textRef.current;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = newSpeed;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          if (isStoppingRef.current) return;
          setPlayerState('playing');
          startProgressTracking();
          startChromeFix();
        };

        utterance.onend = () => {
          if (isStoppingRef.current) return;
          setPlayerState('idle');
          setProgress(100);
          setCurrentTime(duration / newSpeed);

          if (chromeFixIntervalRef.current) {
            clearInterval(chromeFixIntervalRef.current);
          }
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        };

        utterance.onerror = (event) => {
          if (event.error === 'interrupted' || isStoppingRef.current) return;
          setPlayerState('idle');
        };

        utterance.onboundary = (event) => {
          if (isStoppingRef.current) return;
          if (event.charIndex !== undefined) {
            const progressPercent = (event.charIndex / textLengthRef.current) * 100;
            setProgress(Math.min(progressPercent, 99));
          }
        };

        utteranceRef.current = utterance;
        isStoppingRef.current = false;
        synth.speak(utterance);
      }, 100);
    }
  };

  // Format time display
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
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full transition-colors flex-shrink-0"
              aria-label={playerState === 'playing' ? 'Pause' : 'Play'}
            >
              {playerState === 'playing' ? (
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
            <div className="flex-1 min-w-0">
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-[width] duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration / speed)}</span>
              </div>
            </div>

            {/* Stop Button */}
            {playerState !== 'idle' && (
              <button
                onClick={handleStop}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
                aria-label="Stop"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>
            )}
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2 flex-wrap">
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
