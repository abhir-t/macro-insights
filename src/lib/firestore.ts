import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import { Article, Subscriber } from '@/types';

const APP_ID = 'macro-insights';
const ARTICLES_PATH = `artifacts/${APP_ID}/public/data/articles`;
const SUBSCRIBERS_PATH = `artifacts/${APP_ID}/public/data/subscribers`;

export async function getArticles(type?: 'writeup' | 'infographic'): Promise<Article[]> {
  if (!isConfigured || !db) {
    return [];
  }

  const articlesRef = collection(db, ARTICLES_PATH);
  const q = type
    ? query(articlesRef, where('type', '==', type), orderBy('date', 'desc'))
    : query(articlesRef, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Timestamp to serializable format
      date: data.date ? { seconds: data.date.seconds, nanoseconds: data.date.nanoseconds } : null,
    };
  }) as Article[];
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!isConfigured || !db) {
    return null;
  }

  const docRef = doc(db, ARTICLES_PATH, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    // Convert Timestamp to serializable format
    date: data.date ? { seconds: data.date.seconds, nanoseconds: data.date.nanoseconds } : null,
  } as Article;
}

export async function addArticle(article: Omit<Article, 'id' | 'date'>): Promise<string> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const articlesRef = collection(db, ARTICLES_PATH);
  const docRef = await addDoc(articlesRef, {
    ...article,
    date: Timestamp.now(),
  });
  return docRef.id;
}

export async function addSubscriber(email: string): Promise<void> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const subscribersRef = collection(db, SUBSCRIBERS_PATH);
  await addDoc(subscribersRef, {
    email,
    subscribedAt: Timestamp.now(),
  } as Subscriber);
}

export async function deleteArticle(id: string): Promise<void> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const docRef = doc(db, ARTICLES_PATH, id);
  await deleteDoc(docRef);
}

export async function updateArticle(id: string, data: Partial<Omit<Article, 'id'>>): Promise<void> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const docRef = doc(db, ARTICLES_PATH, id);
  await updateDoc(docRef, data);
}
