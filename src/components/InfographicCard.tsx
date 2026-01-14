import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';

interface InfographicCardProps {
  article: Article;
}

export default function InfographicCard({ article }: InfographicCardProps) {
  const formattedDate = article.date?.toDate?.()
    ? article.date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <article className="group">
      <Link href={`/writeups/${article.id}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-[var(--border)]">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="mt-4">
          <span className="byline">{article.author}</span>
          <h3 className="headline text-lg md:text-xl mt-1 group-hover:text-[var(--accent)] transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-2">
            {formattedDate}
          </p>
        </div>
      </Link>
    </article>
  );
}
