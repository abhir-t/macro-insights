'use client';

import { useState, useEffect } from 'react';
import { getSubscribersList, getContacts } from '@/lib/firestore';

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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'subscribers'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Subscribers ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Contact Messages ({contacts.length})
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : activeTab === 'subscribers' ? (
        <div className="space-y-2">
          {subscribers.length === 0 ? (
            <p className="text-slate-500">No subscribers yet.</p>
          ) : (
            subscribers.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center p-3 bg-white border border-[var(--border)]">
                <span className="font-medium">{sub.email}</span>
                <span className="text-xs text-slate-500">{formatDate(sub.subscribedAt?.seconds)}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <p className="text-slate-500">No contact messages yet.</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="p-4 bg-white border border-[var(--border)]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-slate-500 ml-2">({contact.email})</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(contact.createdAt?.seconds)}</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{contact.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
