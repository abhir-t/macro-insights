import { getArticles } from '@/lib/firestore';
import WriteupsContent from '@/components/WriteupsContent';
import { Article } from '@/types';

export const revalidate = 3600;

export default async function WriteupsPage() {
  let articles: Article[] = [];

  try {
    articles = await getArticles('writeup');
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
      <WriteupsContent articles={articles} />
    </div>
  );
}
