'use client';

import { useState } from 'react';
import { addArticle } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export default function AdminForm() {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    readTime: '',
    type: 'writeup' as 'writeup' | 'infographic',
    imageUrl: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await addArticle({
        ...formData,
        date: Timestamp.now(),
      });
      setStatus('success');
      setMessage('Article published successfully.');
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        readTime: '',
        type: 'writeup',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Error publishing article:', error);
      setStatus('error');
      setMessage('Failed to publish article.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black"
        >
          <option value="writeup">Writeup</option>
          <option value="infographic">Infographic</option>
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          required
          rows={2}
          className="w-full px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black resize-none"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={12}
          className="w-full px-4 py-3 border border-hairline bg-white text-sm font-mono focus:outline-none focus:border-black resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium mb-2">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="readTime" className="block text-sm font-medium mb-2">
            Read Time
          </label>
          <input
            type="text"
            id="readTime"
            name="readTime"
            value={formData.readTime}
            onChange={handleChange}
            required
            placeholder="5 min read"
            className="w-full px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-4 py-3 border border-hairline bg-white text-sm focus:outline-none focus:border-black"
        />
      </div>

      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-6 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Publishing...' : 'Publish Article'}
      </button>
    </form>
  );
}
