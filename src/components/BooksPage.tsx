import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookMarked, Trash2, ChevronRight } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';

export function BooksPage() {
  const { books, words, loading, addBook, deleteBook } = useBooks();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addBook({ title: title.trim(), author: author.trim() });
      setTitle('');
      setAuthor('');
      setShowForm(false);
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" and all its words?`)) {
      await deleteBook(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Books</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Words you collect while reading, page by page</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow border border-slate-200 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Book title*</label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g. Autobiography of a Yogi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Optional"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {books.length === 0 ? (
        <div className="text-center py-16 bg-white/70 rounded-2xl border border-slate-200">
          <BookMarked className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No books yet. Add the book you are reading.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => {
            const bookWords = words.filter((w) => w.book_id === book.id);
            const pages = new Set(bookWords.map((w) => w.page)).size;
            return (
              <div
                key={book.id}
                className="group bg-white rounded-2xl p-5 shadow border border-slate-200 hover:border-emerald-300 transition-colors"
              >
                <Link to={`/books/${book.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{book.title}</h3>
                      {book.author && <p className="text-sm text-slate-500 truncate">{book.author}</p>}
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-sm text-slate-600 mt-4">
                    <span className="font-semibold text-emerald-700">{bookWords.length}</span> words ·{' '}
                    {pages} {pages === 1 ? 'page' : 'pages'}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(book.id, book.title)}
                  className="mt-3 text-xs text-slate-400 hover:text-red-600 inline-flex items-center"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
