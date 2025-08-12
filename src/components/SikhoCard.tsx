import React from 'react';
import { Tag, Brain, Trash2 } from 'lucide-react';
import type { Sikho } from '../types';

interface SikhoCardProps {
  sikho: Sikho;
  onView: (sikho: Sikho) => void;
  onDelete: (id: string) => void;
}

export function SikhoCard({ sikho, onView, onDelete }: SikhoCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(sikho.id);
  };

  return (
    <div 
      className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300 group cursor-pointer relative"
      onClick={() => onView(sikho)}
    >
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Delete entry"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <Brain className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{sikho.title}</h3>
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
      
      <div className="mt-3 text-xs sm:text-sm text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Click to view full details →
      </div>
    </div>
  );
}