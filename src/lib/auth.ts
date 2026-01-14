'use client';

import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth, isConfigured } from './firebase';

export async function signInAnon(): Promise<User | null> {
  if (!isConfigured || !auth) {
    return null;
  }
  const result = await signInAnonymously(auth);
  return result.user;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!isConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
  return user.uid === adminUid;
}
