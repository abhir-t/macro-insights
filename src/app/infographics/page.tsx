import { getArticles } from '@/lib/firestore';
import InfographicsContent from '@/components/InfographicsContent';
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
    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
      <InfographicsContent articles={articles} />
    </div>
  );
}
