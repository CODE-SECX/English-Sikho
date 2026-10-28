import React from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import type { Vocabulary } from '../types';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  onView: (vocabulary: Vocabulary) => void;
  onDelete: (id: string) => void;
}

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export function VocabularyCard({ vocabulary, onView, onDelete }: VocabularyCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(vocabulary.id);
  };

  return (
    <div
      className="bg-white rounded-2xl p-4 border border-emerald-100 active:bg-emerald-50 hover:shadow-md transition cursor-pointer flex items-start gap-3"
      onClick={() => onView(vocabulary)}
    >
      <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center">
        {vocabulary.word.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-slate-900 truncate">{vocabulary.word}</h3>
        <p className="text-sm text-slate-600 mt-0.5 break-words">{stripHtml(vocabulary.meaning)}</p>
        <span className="inline-block mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
          {vocabulary.language}
        </span>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch">
        <button
          onClick={handleDelete}
          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg"
          title="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </div>
    </div>
  );
}
