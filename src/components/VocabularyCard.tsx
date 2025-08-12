import React from 'react';
import { BookOpen } from 'lucide-react';
import type { Vocabulary } from '../types';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  onView: (vocabulary: Vocabulary) => void;
}

export function VocabularyCard({ vocabulary, onView }: VocabularyCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div 
      className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={() => onView(vocabulary)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <BookOpen className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{vocabulary.word}</h3>
        </div>
      </div>
      
      <p className="text-sm sm:text-base text-slate-700 font-medium mb-3">
        {truncateText(stripHtml(vocabulary.meaning), 100)}
      </p>
      
      {vocabulary.context && (
        <div className="mb-3">
          <p className="text-xs sm:text-sm text-slate-600 italic">
            "{truncateText(stripHtml(vocabulary.context), 80)}"
          </p>
        </div>
      )}
      
      {vocabulary.moment_of_memory && (
        <div className="bg-blue-50 border-l-4 border-blue-200 p-2 rounded-r-lg">
          <p className="text-xs sm:text-sm text-blue-700">
            {truncateText(stripHtml(vocabulary.moment_of_memory), 60)}
          </p>
        </div>
      )}
      
      <div className="mt-3 text-xs sm:text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Click to view full details →
      </div>
    </div>
  );
}