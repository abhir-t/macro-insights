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

export async function getSubscribers(): Promise<string[]> {
  if (!isConfigured || !db) {
    return [];
  }

  const subscribersRef = collection(db, SUBSCRIBERS_PATH);
  const snapshot = await getDocs(subscribersRef);
  return snapshot.docs.map((doc) => doc.data().email);
}

const CONTACTS_PATH = `artifacts/${APP_ID}/public/data/contacts`;

export async function addContact(data: { name: string; email: string; message: string }): Promise<void> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const contactsRef = collection(db, CONTACTS_PATH);
  await addDoc(contactsRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function getContacts(): Promise<{ id: string; name: string; email: string; message: string; createdAt: { seconds: number } }[]> {
  if (!isConfigured || !db) {
    return [];
  }

  const contactsRef = collection(db, CONTACTS_PATH);
  const q = query(contactsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: data.createdAt,
    };
  });
}

export async function getSubscribersList(): Promise<{ id: string; email: string; subscribedAt: { seconds: number } }[]> {
  if (!isConfigured || !db) {
    return [];
  }

  const subscribersRef = collection(db, SUBSCRIBERS_PATH);
  const q = query(subscribersRef, orderBy('subscribedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      subscribedAt: data.subscribedAt,
    };
  });
}

export async function deleteSubscriber(id: string): Promise<void> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const docRef = doc(db, SUBSCRIBERS_PATH, id);
  await deleteDoc(docRef);
}
