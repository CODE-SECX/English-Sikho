import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, ChevronRight, Globe, Heart, Search } from 'lucide-react';
import { useVocabulary, useSikho } from '../hooks/useSupabase';

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
};

const pastel = ['bg-emerald-100'];

export function Dashboard() {
  const { vocabulary, loading } = useVocabulary();
  const { sikho } = useSikho();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const words = useMemo(
    () =>
      q
        ? vocabulary.filter(v => v.word.toLowerCase().includes(q) || stripHtml(v.meaning).toLowerCase().includes(q))
        : vocabulary.slice(0, 8),
    [vocabulary, q]
  );
  const notes = useMemo(
    () => (q ? sikho.filter(s => s.title.toLowerCase().includes(q)) : sikho.slice(0, 4)),
    [sikho, q]
  );

  const momentCount = new Set([...vocabulary, ...sikho].map(e => e.moment_of_memory).filter(Boolean)).size;
  const languages = [...new Set([...vocabulary, ...sikho].map(e => e.language).filter(Boolean))];

  const stats = [
    { label: 'Words', value: vocabulary.length, icon: BookOpen, link: '/vocabulary', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
    { label: 'Sikho', value: sikho.length, icon: Brain, link: '/sikho', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
    { label: 'Moments', value: momentCount, icon: Heart, link: '/moments', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Learning</h1>
        <p className="text-sm text-slate-500 mt-0.5">Words and meanings, all in one place</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a word or meaning..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-base"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, link, bg, fg }) => (
          <Link key={label} to={link} className={`${bg} rounded-2xl p-3 sm:p-4 flex flex-col items-start`}>
            <Icon className={`h-5 w-5 ${fg}`} />
            <span className="text-2xl font-bold text-slate-900 mt-2 leading-none">{value}</span>
            <span className="text-xs text-slate-600 mt-1">{label}</span>
          </Link>
        ))}
      </div>

      {languages.length > 0 && !q && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {languages.map(lang => (
            <Link
              key={lang}
              to={`/vocabulary?language=${encodeURIComponent(lang)}`}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-emerald-100 text-sm text-slate-700"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-500" /> {lang}
            </Link>
          ))}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">{q ? 'Matching words' : 'Recent words'}</h2>
          <Link to="/vocabulary" className="text-sm font-medium text-emerald-600">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600" />
          </div>
        ) : words.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {words.map((w, i) => (
              <Link
                key={w.id}
                to={`/vocabulary/${w.id}`}
                className="bg-white rounded-2xl p-4 border border-emerald-100 flex items-start gap-3 active:bg-emerald-50 hover:shadow-md transition"
              >
                <div className={`w-11 h-11 shrink-0 rounded-xl ${pastel[i % pastel.length]} text-slate-800 font-bold text-lg flex items-center justify-center`}>
                  {w.word.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate">{w.word}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{stripHtml(w.meaning)}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 self-center shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">{q ? 'No words match your search.' : 'No words yet — add your first one!'}</p>
        )}
      </section>

      {notes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">{q ? 'Matching sikho' : 'Recent sikho'}</h2>
            <Link to="/sikho" className="text-sm font-medium text-emerald-600">View all</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map(n => (
              <Link
                key={n.id}
                to={`/sikho/${n.id}`}
                className="bg-white rounded-2xl p-4 border border-emerald-100 active:bg-emerald-50 hover:shadow-md transition"
              >
                <h3 className="font-bold text-slate-900 truncate">{n.title}</h3>
                <p className="text-sm text-slate-600 mt-0.5">{stripHtml(n.description)}</p>
                {n.category?.name && (
                  <span
                    className="inline-block mt-2 text-[11px] font-medium text-white rounded-full px-2 py-0.5"
                    style={{ backgroundColor: n.category.color || '#64748b' }}
                  >
                    {n.category.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
