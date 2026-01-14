import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = article.date?.toDate?.()
    ? article.date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (featured) {
    return (
      <article className="mb-12">
        <Link href={`/writeups/${article.id}`} className="group block">
          {article.imageUrl && (
            <div className="aspect-[16/9] relative overflow-hidden mb-6">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <span className="byline">{article.author}</span>
          <h2 className="headline text-3xl md:text-4xl mt-2 mb-4 group-hover:text-[var(--accent)] transition-colors">
            {article.title}
          </h2>
          <p className="text-[var(--muted)] leading-relaxed text-lg">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-4">
            <time>{formattedDate}</time>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span>{article.readTime}</span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link href={`/writeups/${article.id}`} className="block">
        {article.imageUrl && (
          <div className="aspect-[4/3] relative overflow-hidden mb-4">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <span className="byline">{article.author}</span>
        <h3 className="headline text-xl md:text-2xl mt-2 mb-3 group-hover:text-[var(--accent)] transition-colors">
          {article.title}
        </h3>
        <p className="text-[var(--muted)] leading-relaxed line-clamp-3 text-sm">
          {article.excerpt}
        </p>
      </Link>
    </article>
  );
}
