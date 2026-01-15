import { notFound } from 'next/navigation';
import { getArticleById, getArticles } from '@/lib/firestore';
import ArticleDetail from '@/components/ArticleDetail';

export const revalidate = 3600;

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles.map((article) => ({
      id: article.id,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { id } = await params;

  try {
    const article = await getArticleById(id);
    if (!article) {
      return { title: 'Article Not Found' };
    }
    return {
      title: `${article.title} | Vantage Post`,
      description: article.excerpt,
    };
  } catch {
    return { title: 'Vantage Post' };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;

  let article = null;

  try {
    article = await getArticleById(id);
  } catch (error) {
    console.error('Error fetching article:', error);
  }

  if (!article) {
    notFound();
  }

  return <ArticleDetail article={article} />;
}
