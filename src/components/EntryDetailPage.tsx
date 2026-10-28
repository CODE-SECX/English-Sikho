import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit2, Globe, Heart, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useSikho, useVocabulary } from '../hooks/useSupabase';

interface EntryDetailPageProps {
  type: 'vocabulary' | 'sikho';
}

function Section({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl p-4 sm:p-5 ${tone}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">{title}</h2>
      <div className="prose prose-slate max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: children as string }} />
    </section>
  );
}

export function EntryDetailPage({ type }: EntryDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vocabulary, loading: vocabLoading } = useVocabulary();
  const { sikho, loading: sikhoLoading } = useSikho();

  const isVocab = type === 'vocabulary';
  const loading = isVocab ? vocabLoading : sikhoLoading;
  const entry = isVocab ? vocabulary.find(v => v.id === id) : sikho.find(s => s.id === id);
  const basePath = isVocab ? '/vocabulary' : '/sikho';

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 mb-4">This entry could not be found.</p>
        <Link to={basePath} className="text-emerald-600 font-medium">← Back to list</Link>
      </div>
    );
  }

  const title = 'word' in entry ? entry.word : entry.title;

  return (
    <article className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(basePath))}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 py-2 -ml-2 pr-3 pl-2 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <Link
          to={`${basePath}?edit=${entry.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-emerald-200 text-emerald-700 text-sm font-medium"
        >
          <Edit2 className="h-4 w-4" /> Edit
        </Link>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 sm:p-8 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3 opacity-90">
          <span className="inline-flex items-center bg-white/20 rounded-full px-2.5 py-1">
            <Globe className="h-3 w-3 mr-1" />{entry.language}
          </span>
          <span className="inline-flex items-center bg-white/20 rounded-full px-2.5 py-1">
            <Calendar className="h-3 w-3 mr-1" />{format(new Date(entry.date), 'MMM dd, yyyy')}
          </span>
          {'category' in entry && entry.category?.name && (
            <span className="inline-flex items-center bg-white/20 rounded-full px-2.5 py-1">
              <Tag className="h-3 w-3 mr-1" />{entry.category.name}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold break-words">{title}</h1>
      </div>

      <div className="space-y-3">
        {'word' in entry ? (
          <>
            <Section title="Meaning" tone="bg-white border border-emerald-100 text-slate-800">{entry.meaning}</Section>
            {entry.context && (
              <Section title="Context" tone="bg-white border border-emerald-100 text-slate-800">{entry.context}</Section>
            )}
          </>
        ) : (
          <Section title="Description" tone="bg-white border border-emerald-100 text-slate-800">{entry.description}</Section>
        )}
        {entry.moment_of_memory && (
          <div className="relative">
            <Heart className="absolute right-4 top-4 h-4 w-4 text-emerald-400" />
            <Section title="Moment of Memory" tone="bg-white border border-emerald-100 text-slate-800">{entry.moment_of_memory}</Section>
          </div>
        )}
      </div>
    </article>
  );
}
