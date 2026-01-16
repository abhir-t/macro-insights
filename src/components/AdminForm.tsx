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
          <p className="text-[var(--muted)]">Loading...</p>
        ) : articles.length === 0 ? (
          <p className="text-[var(--muted)]">No articles yet.</p>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`flex items-center justify-between p-4 border bg-[var(--background)] ${
                  editingId === article.id ? 'border-[var(--accent)]' : 'border-[var(--border)]'
                }`}
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">{article.title}</p>
                  <p className="text-sm text-[var(--muted)]">{article.type} • {article.readTime}</p>
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
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
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
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)]"
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
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)]"
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
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content (Markdown + HTML)
            </label>

            {/* Quick Format Buttons */}
            <div className="mb-2 p-3 bg-[var(--background)] border border-[var(--border)] rounded">
              <p className="text-xs text-[var(--muted)] mb-2">Click to insert at cursor:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertFormat('## ', '')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('**', '**')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('*', '*')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="size-sm">', '</span>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Small Text
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="size-lg">', '</span>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Large Text
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="muted">', '</span>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Gray Text
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<div class="sources">\n\n', '\n\n</div>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Sources Section
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<p class="caption">', '</p>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Caption
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<div class="note">\n', '\n</div>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Note Box
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('<div class="highlight-box">\n', '\n</div>')}
                  className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:border-[var(--accent)]"
                >
                  Highlight Box
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) {
                      insertFormat(`![](${url})`, '');
                    }
                  }}
                  className="px-2 py-1 text-xs bg-[var(--accent)] text-white border border-[var(--accent)] rounded hover:bg-[var(--accent-hover)]"
                >
                  + Image
                </button>
              </div>

              {/* Color Options */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] mr-1 self-center">Colors:</span>
                <button
                  type="button"
                  onClick={() => insertFormat('<span class="color-adaptive">', '</span>')}
                  className="w-6 h-6 rounded border border-gray-400 hover:ring-2 hover:ring-gray-300"
                  style={{ background: 'linear-gradient(to right, #000000, #ffffff)' }}
                  title="Adaptive (white in dark, black in light)"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #ffffff">', '</span>')}
                  className="w-6 h-6 rounded bg-white border border-gray-300 hover:ring-2 hover:ring-gray-300"
                  title="White (dark mode only)"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #ef4444">', '</span>')}
                  className="w-6 h-6 rounded bg-red-500 hover:ring-2 hover:ring-red-300"
                  title="Red"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #f97316">', '</span>')}
                  className="w-6 h-6 rounded bg-orange-500 hover:ring-2 hover:ring-orange-300"
                  title="Orange"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #eab308">', '</span>')}
                  className="w-6 h-6 rounded bg-yellow-500 hover:ring-2 hover:ring-yellow-300"
                  title="Yellow"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #22c55e">', '</span>')}
                  className="w-6 h-6 rounded bg-green-500 hover:ring-2 hover:ring-green-300"
                  title="Green"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #3b82f6">', '</span>')}
                  className="w-6 h-6 rounded bg-blue-500 hover:ring-2 hover:ring-blue-300"
                  title="Blue"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #8b5cf6">', '</span>')}
                  className="w-6 h-6 rounded bg-violet-500 hover:ring-2 hover:ring-violet-300"
                  title="Purple"
                />
                <button
                  type="button"
                  onClick={() => insertFormat('<span style="color: #ec4899">', '</span>')}
                  className="w-6 h-6 rounded bg-pink-500 hover:ring-2 hover:ring-pink-300"
                  title="Pink"
                />
                <button
                  type="button"
                  onClick={() => {
                    const color = prompt('Enter hex color (e.g. #ff6600):');
                    if (color) {
                      insertFormat(`<span style="color: ${color}">`, '</span>');
                    }
                  }}
                  className="w-6 h-6 rounded bg-gradient-to-br from-red-500 via-green-500 to-blue-500 hover:ring-2 hover:ring-gray-300"
                  title="Custom Color"
                />
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
              placeholder="## Introduction&#10;&#10;Your content here with **bold text** for emphasis...&#10;&#10;![](https://your-image-url.png)&#10;&#10;Or just paste image URL on its own line:&#10;https://res.cloudinary.com/your-image.png&#10;&#10;## Next Section"
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:outline-none focus:border-[var(--accent)] resize-none"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
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
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)]"
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
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Send to subscribers checkbox - only show for new articles */}
          {!editingId && (
            <div className="flex items-center gap-3 p-4 bg-[var(--background)] border border-[var(--border)]">
              <input
                type="checkbox"
                id="sendToSubscribers"
                checked={sendToSubscribers}
                onChange={(e) => setSendToSubscribers(e.target.checked)}
                className="w-5 h-5 accent-[var(--accent)]"
              />
              <label htmlFor="sendToSubscribers" className="text-sm text-[var(--foreground)]">
                <span className="font-medium">Send to all subscribers</span>
                <span className="text-[var(--muted)] block text-xs">Email this article to everyone who subscribed</span>
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
