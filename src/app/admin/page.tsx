'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { signInAnon, onAuthChange, isAdmin } from '@/lib/auth';
import AdminForm from '@/components/AdminForm';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthorized(isAdmin(currentUser));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      signInAnon().catch(console.error);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-center text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center py-16">
          <h1 className="font-serif text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-600">
            You do not have permission to access this page.
          </p>
          {user && (
            <p className="text-xs text-slate-400 mt-4">
              UID: {user.uid}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-bold mb-2">Admin</h1>
      <p className="text-slate-600 mb-8">Publish new content to the newsletter.</p>

      <AdminForm />
    </div>
  );
}
