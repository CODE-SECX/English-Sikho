import React from 'react';
import { Calendar, Edit2, Trash2, Eye, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { Vocabulary } from '../types';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  onEdit: (vocabulary: Vocabulary) => void;
  onDelete: (id: string) => void;
  onView: (vocabulary: Vocabulary) => void;
}

export function VocabularyCard({ vocabulary, onEdit, onDelete, onView }: VocabularyCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300 group">
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
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(vocabulary)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(vocabulary)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(vocabulary.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm sm:text-base text-slate-700 font-medium mb-3">
        {truncateText(vocabulary.meaning, 100)}
      </p>
      
      {vocabulary.context && (
        <div className="mb-3">
          <p className="text-xs sm:text-sm text-slate-600 italic">
            "{truncateText(vocabulary.context, 80)}"
          </p>
        </div>
      )}
      
      {vocabulary.moment_of_memory && (
        <div className="bg-blue-50 border-l-4 border-blue-200 p-2 rounded-r-lg">
          <p className="text-xs sm:text-sm text-blue-700">
            {truncateText(vocabulary.moment_of_memory, 60)}
          </p>
        </div>
      )}
      
      <button
        onClick={() => onView(vocabulary)}
        className="mt-3 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View full details →
      </button>
    </div>
  );
}