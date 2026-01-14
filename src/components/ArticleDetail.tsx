'use client';

import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const formattedDate = article.date?.toDate?.()
    ? article.date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/writeups"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-black transition-colors mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Writeups
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <span className="uppercase tracking-widest">{article.author}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <time>{formattedDate}</time>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{article.readTime}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
          {article.title}
        </h1>
      </header>

      {article.imageUrl && (
        <div className="aspect-[16/9] relative overflow-hidden mb-10">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose">
        <div className="drop-cap">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
