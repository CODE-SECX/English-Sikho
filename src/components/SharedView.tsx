import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Calendar, Tag, ArrowLeft, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Vocabulary, Sikho } from '../types';

interface SharedViewProps {
  encodedData: string;
}

export function SharedView({ encodedData }: SharedViewProps) {
  const [data, setData] = useState<{ type: 'vocabulary' | 'sikho'; data: Vocabulary | Sikho } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const decoded = JSON.parse(atob(encodedData));
      setData(decoded);
    } catch (error) {
      setError('Invalid share link');
    }
  }, [encodedData]);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleCopy = async () => {
    if (!data) return;
    
    const isVocabulary = data.type === 'vocabulary';
    const vocabularyData = data.data as Vocabulary;
    const sikhoData = data.data as Sikho;

    const content = isVocabulary 
      ? `📚 ${vocabularyData.word}: ${stripHtml(vocabularyData.meaning)}`
      : `🧠 ${sikhoData.title}: ${stripHtml(sikhoData.description)}`;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 mb-4">
            <BookOpen className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Share Link</h1>
          <p className="text-slate-600 mb-6">This share link appears to be invalid or corrupted.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to App
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isVocabulary = data.type === 'vocabulary';
  const vocabularyData = data.data as Vocabulary;
  const sikhoData = data.data as Sikho;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isVocabulary ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                {isVocabulary ? (
                  <BookOpen className="h-6 w-6 text-blue-600" />
                ) : (
                  <Brain className="h-6 w-6 text-emerald-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {isVocabulary ? vocabularyData.word : sikhoData.title}
                </h1>
                <p className="text-slate-600">
                  Shared from English Learning App
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go to App</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
          <div className="space-y-6">
            {/* Date */}
            <div className="flex items-center text-slate-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {format(new Date(data.data.date), 'MMMM dd, yyyy')}
              </span>
            </div>

            {isVocabulary ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Meaning</h3>
                  <div 
                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: vocabularyData.meaning }}
                  />
                </div>
                
                {vocabularyData.context && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Context</h3>
                    <div className="bg-slate-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
                      <div 
                        className="prose prose-slate max-w-none text-slate-700 italic"
                        dangerouslySetInnerHTML={{ __html: `"${vocabularyData.context}"` }}
                      />
                    </div>
                  </div>
                )}
                
                {vocabularyData.moment_of_memory && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Moment of Memory</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <div 
                        className="prose prose-blue max-w-none text-blue-800"
                        dangerouslySetInnerHTML={{ __html: vocabularyData.moment_of_memory }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {sikhoData.category && (
                  <div>
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                  <div 
                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sikhoData.description }}
                  />
                </div>
                
                {sikhoData.moment_of_memory && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Moment of Memory</h3>
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

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600 mb-4">
            Want to create your own vocabulary collection?
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Start Learning
          </Link>
        </div>
      </div>
    </div>
  );
}