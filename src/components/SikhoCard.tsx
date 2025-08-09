import React from 'react';
import { Calendar, Edit2, Trash2, Eye, Tag, Brain, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Sikho } from '../types';

interface SikhoCardProps {
  sikho: Sikho;
  onEdit: (sikho: Sikho) => void;
  onDelete: (id: string) => void;
  onView: (sikho: Sikho) => void;
}

export function SikhoCard({ sikho, onEdit, onDelete, onView }: SikhoCardProps) {
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
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Brain className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{sikho.title}</h3>
            <div className="flex items-center text-xs sm:text-sm text-slate-500">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(sikho.date), 'MMM dd, yyyy')}
              <span className="mx-2">•</span>
              <Globe className="h-3 w-3 mr-1" />
              {sikho.language}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(sikho)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(sikho)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(sikho.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {sikho.category && (
        <div className="mb-3">
          <span
            className="inline-flex items-center px-2 py-1 text-xs rounded-full text-white"
            style={{ backgroundColor: sikho.category.color }}
          >
            <Tag className="h-3 w-3 mr-1" />
            {sikho.category.name}
          </span>
        </div>
      )}
      
      <div className="mb-3">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {truncateText(stripHtml(sikho.description), 120)}
        </p>
      </div>
      
      {sikho.moment_of_memory && (
        <div className="bg-emerald-50 border-l-4 border-emerald-200 p-2 rounded-r-lg">
          <p className="text-xs sm:text-sm text-emerald-700">
            {truncateText(stripHtml(sikho.moment_of_memory), 60)}
          </p>
        </div>
      )}
      
      <button
        onClick={() => onView(sikho)}
        className="mt-3 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View full details →
      </button>
    </div>
  );
}