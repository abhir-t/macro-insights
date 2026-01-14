import { Timestamp } from 'firebase/firestore';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: Timestamp;
  readTime: string;
  type: 'writeup' | 'infographic';
  imageUrl: string;
}

export interface Subscriber {
  email: string;
  subscribedAt: Timestamp;
}
