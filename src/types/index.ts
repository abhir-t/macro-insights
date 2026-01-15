export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: { seconds: number; nanoseconds: number } | null;
  readTime: string;
  type: 'writeup' | 'infographic';
  imageUrl: string;
}

export interface Subscriber {
  email: string;
  subscribedAt: { seconds: number; nanoseconds: number };
}
