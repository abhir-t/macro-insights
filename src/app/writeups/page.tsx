import { getArticles } from '@/lib/firestore';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';

export const revalidate = 3600;

export default async function WriteupsPage() {
  let articles: Article[] = [];

  try {
    articles = await getArticles('writeup');
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  const featuredArticle = articles[0];
  const restArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {articles.length > 0 ? (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-12">
              <ArticleCard article={featuredArticle} featured />
            </div>
          )}

          {/* Section Divider */}
          <div className="section-divider">
            <span>Latest Stories</span>
          </div>

          {/* Article Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : (
        <div className="py-24 text-center">
          <h2 className="headline text-3xl md:text-4xl mb-4">
            Stories coming soon
          </h2>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            We&apos;re working on in-depth analysis and market insights.
            Sign up below to be notified when we publish.
          </p>
        </div>
      )}
    </div>
  );
}
