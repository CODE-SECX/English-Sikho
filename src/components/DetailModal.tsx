import React from 'react';
import { X, Calendar, Tag, BookOpen, Brain, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Vocabulary, Sikho } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Vocabulary | Sikho | null;
  type: 'vocabulary' | 'sikho';
  onEdit?: () => void;
}

export function DetailModal({ isOpen, onClose, data, type, onEdit }: DetailModalProps) {
  if (!isOpen || !data) return null;

  const isVocabulary = type === 'vocabulary';
  const vocabularyData = data as Vocabulary;
  const sikhoData = data as Sikho;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isVocabulary ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                {isVocabulary ? (
                  <BookOpen className={`h-5 w-5 ${isVocabulary ? 'text-blue-600' : 'text-emerald-600'}`} />
                ) : (
                  <Brain className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isVocabulary ? vocabularyData.word : sikhoData.title}
                </h2>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(data.date), 'MMMM dd, yyyy')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className={`p-2 rounded-lg transition-colors ${
                    isVocabulary 
                      ? 'text-blue-600 hover:bg-blue-50' 
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title="Edit"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {isVocabulary ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Meaning</h3>
                <p className="text-slate-700 leading-relaxed">{vocabularyData.meaning}</p>
              </div>
              
              {vocabularyData.context && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Context</h3>
                  <div className="bg-slate-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
                    <p className="text-slate-700 italic">"{vocabularyData.context}"</p>
                  </div>
                </div>
              )}
              
              {vocabularyData.moment_of_memory && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Moment of Memory</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800">{vocabularyData.moment_of_memory}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {sikhoData.category && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Category</h3>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: sikhoData.category.color }}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    {sikhoData.category.name}
                  </span>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                <div 
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sikhoData.description }}
                />
              </div>
              
              {sikhoData.moment_of_memory && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Moment of Memory</h3>
                  <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                    <div 
                      className="prose prose-emerald max-w-none text-emerald-800"
                      dangerouslySetInnerHTML={{ __html: sikhoData.moment_of_memory }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}