import React, { useState } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, X } from 'lucide-react';
import { useVocabulary } from '../hooks/useSupabase';
import { format } from 'date-fns';
import type { Vocabulary } from '../types';
import { VocabularyCard } from './VocabularyCard';
import { DetailModal } from './DetailModal';
import { RichTextEditor } from './RichTextEditor';

export function VocabularyPage() {
  const { vocabulary, loading, addVocabulary, updateVocabulary, deleteVocabulary } = useVocabulary();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Vocabulary | null>(null);
  const [viewingItem, setViewingItem] = useState<Vocabulary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'word' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    context: '',
    moment_of_memory: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const filteredVocabulary = vocabulary
    .filter(item => {
      const matchesSearch = 
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.context.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || item.date === dateFilter;
      
      return matchesSearch && matchesDate;
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
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
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
                showFilters || dateFilter
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredVocabulary.map((item) => (
            <VocabularyCard
              key={item.id}
              vocabulary={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
          
          {filteredVocabulary.length === 0 && (
            <div className="text-center py-8 sm:py-12 col-span-full">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchTerm ? 'No vocabulary found matching your search.' : 'No vocabulary entries yet.'}
              </p>
            </div>
          )}
        </div>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
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
                  height="80px"
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