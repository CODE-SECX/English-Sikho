import React from 'react';
import { Calendar, Edit2, Trash2, BookOpen, Share2, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Vocabulary } from '../types';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  onEdit: (vocabulary: Vocabulary) => void;
  onDelete: (id: string) => void;
  onView: (vocabulary: Vocabulary) => void;
  onShare?: (vocabulary: Vocabulary) => void;
}

export function VocabularyCard({ vocabulary, onEdit, onDelete, onView, onShare }: VocabularyCardProps) {
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
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{vocabulary.word}</h3>
            <div className="flex items-center text-xs sm:text-sm text-slate-500">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(vocabulary.date), 'MMM dd, yyyy')}
              <span className="mx-2">•</span>
              <Globe className="h-3 w-3 mr-1" />
              {vocabulary.language}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(vocabulary);
              }}
              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vocabulary);
            }}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vocabulary.id);
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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