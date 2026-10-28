import React from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import type { Sikho } from '../types';

interface SikhoCardProps {
  sikho: Sikho;
  onView: (sikho: Sikho) => void;
  onDelete: (id: string) => void;
}

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export function SikhoCard({ sikho, onView, onDelete }: SikhoCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(sikho.id);
  };

  return (
    <div
      className="bg-white rounded-2xl p-4 border border-emerald-100 active:bg-emerald-50 hover:shadow-md transition cursor-pointer flex items-start gap-3"
      onClick={() => onView(sikho)}
    >
      <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center">
        {sikho.title.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-slate-900 truncate">{sikho.title}</h3>
        <p className="text-sm text-slate-600 mt-0.5">{stripHtml(sikho.description)}</p>
        {sikho.category?.name && (
          <span
            className="inline-block mt-2 text-[11px] font-medium text-white rounded-full px-2 py-0.5"
            style={{ backgroundColor: sikho.category.color || '#64748b' }}
          >
            {sikho.category.name}
          </span>
        )}
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
