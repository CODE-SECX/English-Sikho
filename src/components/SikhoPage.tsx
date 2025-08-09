import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, X } from 'lucide-react';
import { useSikho, useCategories } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import type { Sikho } from '../types';
import { SikhoCard } from './SikhoCard';
import { DetailModal } from './DetailModal';
import { RichTextEditor } from './RichTextEditor';
import { SmartDropdown } from './SmartDropdown';

export function SikhoPage() {
  const { sikho, loading, addSikho, updateSikho, deleteSikho } = useSikho();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Sikho | null>(null);
  const [viewingItem, setViewingItem] = useState<Sikho | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moment_of_memory: '',
    category_id: '',
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

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get unique languages for filter
  const availableLanguages = [...new Set(sikho.map(s => s.language).filter(Boolean))];

  const filteredSikho = sikho
    .filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(item.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(item.moment_of_memory).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
      const matchesDate = !dateFilter || item.date === dateFilter;
      const matchesLanguage = !languageFilter || item.language === languageFilter;
      
      return matchesSearch && matchesCategory && matchesDate && matchesLanguage;
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
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        category_id: formData.category_id || null
      };
      
      if (editingItem) {
        await updateSikho(editingItem.id, dataToSubmit);
      } else {
        await addSikho(dataToSubmit);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving sikho:', error);
    }
  };

  const handleEdit = (item: Sikho) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      moment_of_memory: item.moment_of_memory,
      category_id: item.category_id || '',
      language: item.language,
      date: item.date
    });
    setShowForm(true);
  };

  const handleView = (item: Sikho) => {
    setViewingItem(item);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sikho entry?')) {
      await deleteSikho(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      moment_of_memory: '',
      category_id: '',
      language: 'English',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setLanguageFilter('');
    setDateFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sikho</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Your learning notes and insights</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Language Filter Pills */}
      {availableLanguages.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => setLanguageFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !languageFilter
                ? 'bg-emerald-600 text-white shadow-sm'
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
                  ? 'bg-emerald-600 text-white shadow-sm'
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
              placeholder="Search sikho entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center ${
                showFilters || selectedCategory || dateFilter || languageFilter
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'created_at')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="created_at">Date Added</option>
                  <option value="date">Learning Date</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSikho.map((item) => (
            <SikhoCard
              key={item.id}
              sikho={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
          
          {filteredSikho.length === 0 && (
            <div className="text-center py-8 sm:py-12 col-span-full">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchTerm || selectedCategory || languageFilter ? 'No entries found matching your criteria.' : 'No sikho entries yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <DetailModal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        data={viewingItem}
        type="sikho"
        onEdit={() => {
          if (viewingItem) handleEdit(viewingItem);
          setViewingItem(null);
        }}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl my-8 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
              {editingItem ? 'Edit Sikho Entry' : 'Add New Sikho Entry'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title*</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter the title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language*</label>
                <select
                  required
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter custom language"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description*</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({...formData, description: value})}
                  placeholder="Enter your learning notes and insights"
                  height="150px"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Moment of Memory</label>
                <SmartDropdown
                  value={formData.moment_of_memory}
                  onChange={(value) => setFormData({...formData, moment_of_memory: value})}
                  options={[...new Set(sikho.map(s => s.moment_of_memory).filter(Boolean))]}
                  placeholder="How you learned or remembered this"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {editingItem ? 'Update' : 'Add'} Entry
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