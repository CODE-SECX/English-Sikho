import React, { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { Vocabulary, Sikho } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Vocabulary | Sikho | null;
  type: 'vocabulary' | 'sikho';
}

export function ShareModal({ isOpen, onClose, data, type }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  if (!isOpen || !data) return null;

  const isVocabulary = type === 'vocabulary';
  const vocabularyData = data as Vocabulary;
  const sikhoData = data as Sikho;

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const generateShareableContent = () => {
    if (isVocabulary) {
      return `📚 English Word: ${vocabularyData.word}

📖 Meaning: ${stripHtml(vocabularyData.meaning)}

${vocabularyData.context ? `💬 Context: "${stripHtml(vocabularyData.context)}"` : ''}

${vocabularyData.moment_of_memory ? `💡 Memory Aid: ${stripHtml(vocabularyData.moment_of_memory)}` : ''}

📅 Learned on: ${format(new Date(vocabularyData.date), 'MMMM dd, yyyy')}

---
Shared from English Learning App`;
    } else {
      return `🧠 Learning Note: ${sikhoData.title}

${sikhoData.category ? `🏷️ Category: ${sikhoData.category.name}` : ''}

📝 Description: ${stripHtml(sikhoData.description)}

${sikhoData.moment_of_memory ? `💡 Memory Aid: ${stripHtml(sikhoData.moment_of_memory)}` : ''}

📅 Date: ${format(new Date(sikhoData.date), 'MMMM dd, yyyy')}

---
Shared from English Learning App`;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    const content = generateShareableContent();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: isVocabulary ? `Word: ${vocabularyData.word}` : `Note: ${sikhoData.title}`,
          text: content,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const generatePublicUrl = () => {
    // Create a shareable URL with encoded data
    const encodedData = btoa(JSON.stringify({
      type,
      data: {
        ...data,
        id: undefined, // Remove ID for privacy
        created_at: undefined
      }
    }));
    
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/share/${encodedData}`;
    setShareUrl(url);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isVocabulary ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                <Share2 className={`h-5 w-5 ${isVocabulary ? 'text-blue-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                  Share {isVocabulary ? 'Vocabulary' : 'Sikho Note'}
                </h2>
                <p className="text-sm text-slate-600">
                  {isVocabulary ? vocabularyData.word : sikhoData.title}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Preview</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {generateShareableContent()}
              </pre>
            </div>
          </div>
          
          {/* Share Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Share Options</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-3 p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-slate-600" />
                <span className="font-medium">Share via System</span>
              </button>
              
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-3 p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 text-slate-600" />
                    <span className="font-medium">Copy Text</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <button
                onClick={generatePublicUrl}
                className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="font-medium">Generate Public Link</span>
              </button>
              
              {shareUrl && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">Public link generated and copied to clipboard:</p>
                  <code className="text-xs text-blue-700 break-all">{shareUrl}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}