'use client';

import { useState, useEffect, useRef } from 'react';
import { addArticle, getArticles, deleteArticle, updateArticle } from '@/lib/firestore';
import { Article } from '@/types';

export default function AdminForm() {
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Vantage Post',
    type: 'writeup' as 'writeup' | 'infographic',
    imageUrl: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [sendToSubscribers, setSendToSubscribers] = useState(false);

  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const insertFormat = (before: string, after: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newContent =
      formData.content.substring(0, start) +
      before +
      (selectedText || 'text here') +
      after +
      formData.content.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + (selectedText || 'text here').length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const fetchArticles = async () => {
    try {
      const allArticles = await getArticles();
      setArticles(allArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      let articleId: string;

      if (editingId) {
        await updateArticle(editingId, {
          ...formData,
          readTime: calculateReadTime(formData.content),
        });
        articleId = editingId;
        setMessage('Article updated successfully!');
        setEditingId(null);
      } else {
        articleId = await addArticle({
          ...formData,
          readTime: calculateReadTime(formData.content),
        });
        setMessage('Article published successfully!');
      }

      // Send newsletter if checkbox is checked (only for new articles)
      if (sendToSubscribers && !editingId) {
        try {
          const baseUrl = window.location.origin;
          const res = await fetch('/api/send-newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              excerpt: formData.excerpt,
              articleUrl: `${baseUrl}/writeups/${articleId}`,
            }),
          });
          if (res.ok) {
            setMessage('Article published and sent to subscribers!');
          } else {
            setMessage('Article published, but failed to send newsletter.');
          }
        } catch (emailError) {
          console.error('Failed to send newsletter:', emailError);
          setMessage('Article published, but failed to send newsletter.');
        }
      }

      setStatus('success');
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        author: 'Vantage Post',
        type: 'writeup',
        imageUrl: '',
      });
      setSendToSubscribers(false);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      setStatus('error');
      setMessage('Failed to save article.');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      type: article.type,
      imageUrl: article.imageUrl || '',
    });
    setMessage('');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: 'Vantage Post',
      type: 'writeup',
      imageUrl: '',
    });
    setMessage('');
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
      setMessage('Article deleted.');
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      setMessage('Failed to delete article.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-12">
      {/* Existing Articles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Articles</h2>
        {loadingArticles ? (
          <p className="text-slate-500">Loading...</p>
        ) : articles.length === 0 ? (
          <p className="text-slate-500">No articles yet.</p>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`flex items-center justify-between p-4 border bg-white ${
                  editingId === article.id ? 'border-[var(--accent)] bg-red-50' : 'border-[var(--border)]'
                }`}
              >
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-slate-500">{article.type} • {article.readTime}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="px-3 py-1 text-sm text-[var(--accent)] hover:bg-red-50 transition-colors border border-[var(--accent)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish / Edit Article */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? 'Edit Article' : 'Publish New Article'}
          </h2>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel Edit
            </button>
          )}
        </div>

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
              className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="writeup">Story</option>
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
              className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt (short summary for the card)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={2}
              className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content (Markdown + HTML)
            </label>

            {/* Quick Format Buttons */}
            <div className="mb-2 p-3 bg-slate-50 border border-slate-200 rounded">
              <p className="text-xs text-slate-500 mb-2">Click to insert at cursor:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertFormat('## ', '')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('**', '**')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="size-sm">', '</span>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Small Text
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="size-lg">', '</span>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Large Text
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="muted">', '</span>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Gray Text
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<div class="sources">\n\n', '\n\n</div>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Sources Section
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<p class="caption">', '</p>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Caption
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<div class="note">\n', '\n</div>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Note Box
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<div class="highlight-box">\n', '\n</div>')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Highlight Box
                </button>
              </div>
            </div>

            <textarea
              ref={contentRef}
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={20}
              placeholder="## Introduction&#10;&#10;Your content here with **bold text** for emphasis...&#10;&#10;## Next Section&#10;&#10;<iframe src='chart-url' width='100%' height='400'></iframe>"
              className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm font-mono focus:outline-none focus:border-[var(--accent)] resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Estimated read time: {calculateReadTime(formData.content)}
            </p>
          </div>

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
              className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
              Cover Image URL (thumbnail)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Send to subscribers checkbox - only show for new articles */}
          {!editingId && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="sendToSubscribers"
                checked={sendToSubscribers}
                onChange={(e) => setSendToSubscribers(e.target.checked)}
                className="w-5 h-5 accent-[var(--accent)]"
              />
              <label htmlFor="sendToSubscribers" className="text-sm">
                <span className="font-medium">Send to all subscribers</span>
                <span className="text-slate-500 block text-xs">Email this article to everyone who subscribed</span>
              </label>
            </div>
          )}

          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-6 py-3 bg-[var(--accent)] text-white text-sm uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Saving...' : editingId ? 'Update Article' : sendToSubscribers ? 'Publish & Send' : 'Publish Article'}
          </button>
        </form>
      </div>
    </div>
  );
}
