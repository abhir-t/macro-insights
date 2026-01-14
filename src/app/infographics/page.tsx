import { getArticles } from '@/lib/firestore';
import InfographicCard from '@/components/InfographicCard';
import { Article } from '@/types';

export const revalidate = 3600;

export default async function InfographicsPage() {
  let articles: Article[] = [];

  try {
    articles = await getArticles('infographic');
  } catch (error) {
    console.error('Error fetching infographics:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="headline text-3xl md:text-4xl mb-4">
          Data & Visualizations
        </h1>
        <p className="text-[var(--muted)] max-w-2xl">
          Charts, graphs, and visual insights that bring market data to life.
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <InfographicCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <h2 className="headline text-2xl md:text-3xl mb-4">
            Infographics coming soon
          </h2>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            We&apos;re creating visual stories and data insights.
            Sign up below to be notified when we publish.
          </p>
        </div>
      )}
    </div>
  );
}
