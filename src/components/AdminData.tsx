'use client';

import { useState, useEffect } from 'react';
import { getSubscribersList, getContacts, deleteSubscriber } from '@/lib/firestore';

export default function AdminData() {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribedAt: { seconds: number } }[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string; message: string; createdAt: { seconds: number } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'contacts'>('subscribers');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subs, conts] = await Promise.all([getSubscribersList(), getContacts()]);
        setSubscribers(subs);
        setContacts(conts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Remove subscriber "${email}"?`)) return;

    try {
      await deleteSubscriber(id);
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Failed to remove subscriber');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'subscribers'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Subscribers ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Contact Messages ({contacts.length})
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--muted)]">Loading...</p>
      ) : activeTab === 'subscribers' ? (
        <div className="space-y-2">
          {subscribers.length === 0 ? (
            <p className="text-[var(--muted)]">No subscribers yet.</p>
          ) : (
            subscribers.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center p-3 bg-[var(--background)] border border-[var(--border)]">
                <span className="font-medium text-[var(--foreground)]">{sub.email}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)]">{formatDate(sub.subscribedAt?.seconds)}</span>
                  <button
                    onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <p className="text-[var(--muted)]">No contact messages yet.</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="p-4 bg-[var(--background)] border border-[var(--border)]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-[var(--foreground)]">{contact.name}</span>
                    <span className="text-[var(--muted)] ml-2">({contact.email})</span>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{formatDate(contact.createdAt?.seconds)}</span>
                </div>
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{contact.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
