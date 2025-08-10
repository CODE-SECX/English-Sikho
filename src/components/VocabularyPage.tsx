import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, X, Share2, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { useVocabulary } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import type { Vocabulary } from '../types';
import { VocabularyCard } from './VocabularyCard';
import { DetailModal } from './DetailModal';
import { RichTextEditor } from './RichTextEditor';
import { ShareModal } from './ShareModal';

export function VocabularyPage() {
  const { vocabulary, loading, addVocabulary, updateVocabulary, deleteVocabulary } = useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Vocabulary | null>(null);
  const [viewingItem, setViewingItem] = useState<Vocabulary | null>(null);
  const [sharingItem, setSharingItem] = useState<Vocabulary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'word' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'alphabet'>('grid');
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    context: '',
    moment_of_memory: '',
    language: 'English',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Handle URL parameters for language filtering
  useEffect(() => {
    const languageParam = searchParams.get('language');
    if (languageParam) {
      setLanguageFilter(languageParam);
      setShowFilters(true); // Show filters when language is pre-selected
    }
  }, [searchParams]);

  // Get unique moment of memory values for dropdown
  const existingMoments = [...new Set(vocabulary.map(v => v.moment_of_memory).filter(Boolean))];
  
  // Get unique languages for filter
  const availableLanguages = [...new Set(vocabulary.map(v => v.language).filter(Boolean))];

  const filteredVocabulary = vocabulary
    .filter(item => {
      const matchesSearch = 
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(item.meaning).toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(item.context).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || item.date === dateFilter;
      const matchesLanguage = !languageFilter || item.language === languageFilter;
      
      return matchesSearch && matchesDate && matchesLanguage;
    })
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      if (sortBy === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortBy === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else {
        aValue = a.word.toLowerCase();
        bValue = b.word.toLowerCase();
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Group vocabulary alphabetically for alphabet view
  const alphabeticalGroups = filteredVocabulary.reduce((groups, item) => {
    const firstLetter = item.word.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(item);
    return groups;
  }, {} as Record<string, Vocabulary[]>);

  const handleShare = (item: Vocabulary) => {
    setSharingItem(item);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateVocabulary(editingItem.id, formData);
      } else {
        await addVocabulary(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    }
  };

  const handleEdit = (item: Vocabulary) => {
    setEditingItem(item);
    setFormData({
      word: item.word,
      meaning: item.meaning,
      context: item.context,
      moment_of_memory: item.moment_of_memory,
      language: item.language,
      date: item.date
    });
    setShowForm(true);
  };

  const handleView = (item: Vocabulary) => {
    setViewingItem(item);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vocabulary?')) {
      await deleteVocabulary(id);
    }
  };

  const resetForm = () => {
    setFormData({
      word: '',
      meaning: '',
      context: '',
      moment_of_memory: '',
      language: 'English',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setLanguageFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Vocabulary</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Manage your English vocabulary collection</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-slate-200/60">
          {(['grid', 'list', 'alphabet'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Language Filter Pills */}
      {availableLanguages.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => setLanguageFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !languageFilter
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Languages
          </button>
          {availableLanguages.map((language) => (
            <button
              key={language}
              onClick={() => setLanguageFilter(language)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                languageFilter === language
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center ${
                showFilters || dateFilter || languageFilter
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              } text-sm sm:text-base flex-1 sm:flex-none justify-center`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'word' | 'created_at')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="created_at">Date Added</option>
                  <option value="date">Learning Date</option>
                  <option value="word">Word (A-Z)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Languages</option>
                  {availableLanguages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center text-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Render based on view mode */}
        {viewMode === 'alphabet' ? (
          <div className="space-y-6">
            {Object.keys(alphabeticalGroups).sort().map((letter) => (
              <div key={letter}>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                  {letter}
                </h3>
                <div className="space-y-3">
                  {alphabeticalGroups[letter].map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200/60 hover:border-slate-300/60 transition-all cursor-pointer"
                      onClick={() => handleView(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900">{item.word}</h3>
                            <span className="text-sm text-slate-500">
                              {format(new Date(item.date), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-xs text-slate-400">• {item.language}</span>
                          </div>
                          <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                            {stripHtml(item.meaning)}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(item);
                            }}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredVocabulary.map((item) => (
              <div 
                key={item.id} 
                className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200/60 hover:border-slate-300/60 transition-all cursor-pointer"
                onClick={() => handleView(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{item.word}</h3>
                      <span className="text-sm text-slate-500">
                        {format(new Date(item.date), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-xs text-slate-400">• {item.language}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                      {stripHtml(item.meaning)}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(item);
                      }}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVocabulary.map((item) => (
              <VocabularyCard
                key={item.id}
                vocabulary={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
        
        {filteredVocabulary.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {searchTerm || languageFilter ? 'No vocabulary found matching your criteria.' : 'No vocabulary entries yet.'}
            </p>
          </div>
        )}
      </div>

      <DetailModal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        data={viewingItem}
        type="vocabulary"
        onEdit={() => {
          if (viewingItem) handleEdit(viewingItem);
          setViewingItem(null);
        }}
      />

      <ShareModal
        isOpen={!!sharingItem}
        onClose={() => setSharingItem(null)}
        data={sharingItem}
        type="vocabulary"
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg my-8 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
              {editingItem ? 'Edit Vocabulary' : 'Add New Vocabulary'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Word*</label>
                <input
                  type="text"
                  required
                  value={formData.word}
                  onChange={(e) => setFormData({...formData, word: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter the word"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meaning*</label>
                <RichTextEditor
                  value={formData.meaning}
                  onChange={(value) => setFormData({...formData, meaning: value})}
                  placeholder="Enter the meaning"
                  height="120px"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Context</label>
                <RichTextEditor
                  value={formData.context}
                  onChange={(value) => setFormData({...formData, context: value})}
                  placeholder="Usage example or context"
                  height="100px"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Moment of Memory</label>
                <RichTextEditor
                  value={formData.moment_of_memory}
                  onChange={(value) => setFormData({...formData, moment_of_memory: value})}
                  placeholder="How you remembered this word"
                  height="100px"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language*</label>
                <select
                  required
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="English">English</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {formData.language === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Custom Language</label>
                  <input
                    type="text"
                    value={formData.language === 'Other' ? '' : formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter custom language"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {editingItem ? 'Update' : 'Add'} Vocabulary
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-200 text-slate-800 py-2.5 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}