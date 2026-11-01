import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardPaste, Pencil, Search, Trash2, X } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { parseVocabTable } from '../lib/parseVocabTable';
import type { BookWord } from '../types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm';

type WordUpdate = Pick<BookWord, 'page' | 'word' | 'meaning' | 'meaning_gujarati'>;

function WordRow({
  item,
  onSave,
  onDelete,
}: {
  item: BookWord;
  onSave: (id: string, updates: WordUpdate) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WordUpdate>(item);

  const save = async () => {
    if (!draft.word.trim()) return;
    await onSave(item.id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <tr className="bg-emerald-50/60 align-top">
        <td className="px-4 py-2">
          <input autoFocus className={inputClass} value={draft.word} onChange={(e) => setDraft({ ...draft, word: e.target.value })} />
        </td>
        <td className="px-4 py-2">
          <input className={inputClass} value={draft.meaning} onChange={(e) => setDraft({ ...draft, meaning: e.target.value })} />
        </td>
        <td className="px-4 py-2">
          <input className={inputClass} value={draft.meaning_gujarati} onChange={(e) => setDraft({ ...draft, meaning_gujarati: e.target.value })} />
        </td>
        <td className="px-4 py-2 w-24">
          <div className="flex gap-1">
            <button onClick={save} className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" title="Save">
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setDraft(item);
                setEditing(false);
              }}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group hover:bg-slate-50" onDoubleClick={() => setEditing(true)}>
      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{item.word}</td>
      <td className="px-4 py-3 text-slate-700">{item.meaning}</td>
      <td className="px-4 py-3 text-slate-700">{item.meaning_gujarati}</td>
      <td className="px-4 py-3 w-24">
        <div className="flex gap-1 opacity-60 group-hover:opacity-100">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-200" title="Edit">
            <Pencil className="h-4 w-4 text-slate-600" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-100" title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, words, loading, updateBook, deleteBook, addWords, updateWord, deleteWord } = useBooks();

  const [pasteOpen, setPasteOpen] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [pasted, setPasted] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState({ title: '', author: '' });

  const book = books.find((b) => b.id === id);
  const bookWords = useMemo(() => words.filter((w) => w.book_id === id), [words, id]);
  const parsed = useMemo(() => parseVocabTable(pasted), [pasted]);
  const nextPage = bookWords.length ? Math.max(...bookWords.map((w) => w.page)) + 1 : 1;
  const effectivePage = Number(pageInput) || parsed.page || nextPage;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookWords;
    return bookWords.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.meaning_gujarati.toLowerCase().includes(q),
    );
  }, [bookWords, search]);

  const byPage = useMemo(() => {
    const groups = new Map<number, BookWord[]>();
    filtered.forEach((w) => groups.set(w.page, [...(groups.get(w.page) || []), w]));
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!book || !id) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Book not found.</p>
        <Link to="/books" className="text-emerald-600 hover:underline">Back to books</Link>
      </div>
    );
  }

  const handleSavePage = async () => {
    if (parsed.words.length === 0) return;
    setSaving(true);
    try {
      await addWords(parsed.words.map((w) => ({ ...w, book_id: id, page: effectivePage })));
      setPasted('');
      setPageInput('');
      setPasteOpen(false);
    } catch (error) {
      console.error('Error saving words:', error);
      window.alert('Could not save the words. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (page: number, count: number) => {
    if (!window.confirm(`Delete all ${count} words on page ${page}?`)) return;
    await Promise.all(bookWords.filter((w) => w.page === page).map((w) => deleteWord(w.id)));
  };

  const handleDeleteWord = async (wordId: string) => {
    await deleteWord(wordId);
  };

  const handleSaveWord = async (wordId: string, updates: WordUpdate) => {
    await updateWord(wordId, updates);
  };

  const handleSaveTitle = async () => {
    if (!titleDraft.title.trim()) return;
    await updateBook(id, { title: titleDraft.title.trim(), author: titleDraft.author.trim() });
    setEditingTitle(false);
  };

  const handleDeleteBook = async () => {
    if (window.confirm(`Delete "${book.title}" and all its words?`)) {
      await deleteBook(id);
      navigate('/books');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link to="/books" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4 mr-1" />
        All books
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {editingTitle ? (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input className={inputClass} value={titleDraft.title} onChange={(e) => setTitleDraft({ ...titleDraft, title: e.target.value })} placeholder="Title" />
            <input className={inputClass} value={titleDraft.author} onChange={(e) => setTitleDraft({ ...titleDraft, author: e.target.value })} placeholder="Author" />
            <button onClick={handleSaveTitle} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Save</button>
            <button onClick={() => setEditingTitle(false)} className="px-4 py-2 bg-slate-200 rounded-lg text-sm">Cancel</button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {book.title}
              <button
                onClick={() => {
                  setTitleDraft({ title: book.title, author: book.author });
                  setEditingTitle(true);
                }}
                className="ml-2 align-middle p-1 rounded hover:bg-slate-200"
                title="Edit book"
              >
                <Pencil className="h-4 w-4 text-slate-500" />
              </button>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {book.author && <>{book.author} · </>}
              {bookWords.length} words · {new Set(bookWords.map((w) => w.page)).size} pages
            </p>
          </div>
        )}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setPasteOpen((open) => !open)}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 flex items-center justify-center shadow-lg text-sm sm:text-base"
          >
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Add Page Words
          </button>
          <button onClick={handleDeleteBook} className="px-3 py-2.5 rounded-lg border border-slate-300 text-slate-500 hover:text-red-600 hover:border-red-300" title="Delete book">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {pasteOpen && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow border border-emerald-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Page number</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={String(parsed.page || nextPage)}
              />
              <p className="text-xs text-slate-500 mt-2">
                Blank = page from the pasted title, else next page ({nextPage}).
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste ChatGPT table (Word | Meaning | Gujarati)
              </label>
              <textarea
                autoFocus
                rows={8}
                className={`${inputClass} font-mono`}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder={'Page 1 — Selected Vocabulary\nWord\tSimple English meaning\tGujarati meaning\nSubstantial\tLarge or considerable in amount\tનોંધપાત્ર'}
              />
            </div>
          </div>

          {parsed.words.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {parsed.words.map((w, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5 font-semibold whitespace-nowrap">{w.word}</td>
                      <td className="px-3 py-1.5 text-slate-700">{w.meaning}</td>
                      <td className="px-3 py-1.5 text-slate-700">{w.meaning_gujarati}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleSavePage}
              disabled={saving || parsed.words.length === 0}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {parsed.words.length
                ? `Save ${parsed.words.length} words to page ${effectivePage}`
                : 'Paste a table to preview'}
            </button>
            <button onClick={() => setPasteOpen(false)} className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
              Cancel
            </button>
          </div>
        </div>
      )}

      {bookWords.length > 0 && (
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words or meanings in this book..."
            className="flex-1 py-2.5 outline-none bg-transparent text-sm"
          />
        </div>
      )}

      {byPage.map(([page, rows]) => (
        <section key={page} className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h2 className="font-bold text-slate-900">
              Page {page} <span className="font-normal text-slate-500 text-sm">· {rows.length} words</span>
            </h2>
            <button
              onClick={() => handleDeletePage(page, rows.length)}
              className="text-xs text-slate-400 hover:text-red-600 inline-flex items-center"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete page
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2 font-medium">Word</th>
                  <th className="px-4 py-2 font-medium">Simple English meaning</th>
                  <th className="px-4 py-2 font-medium">Gujarati meaning</th>
                  <th className="px-4 py-2 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <WordRow key={item.id} item={item} onSave={handleSaveWord} onDelete={handleDeleteWord} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {bookWords.length === 0 && !pasteOpen && (
        <div className="text-center py-16 bg-white/70 rounded-2xl border border-slate-200">
          <ClipboardPaste className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No words yet. Paste a page's table from ChatGPT to get started.</p>
        </div>
      )}
    </div>
  );
}
