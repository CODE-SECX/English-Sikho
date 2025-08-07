import React, { useState } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, X } from 'lucide-react';
import { useSikho, useCategories } from '../hooks/useSupabase';
import { format } from 'date-fns';
import type { Sikho } from '../types';
import { SikhoCard } from './SikhoCard';
import { DetailModal } from './DetailModal';
import { RichTextEditor } from './RichTextEditor';

export function SikhoPage() {
  const { sikho, loading, addSikho, updateSikho, deleteSikho } = useSikho();
  const { categories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Sikho | null>(null);
  const [viewingItem, setViewingItem] = useState<Sikho | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moment_of_memory: '',
    category_id: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const filteredSikho = sikho
    .filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(item.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(item.moment_of_memory).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
      const matchesDate = !dateFilter || item.date === dateFilter;
      
      return matchesSearch && matchesCategory && matchesDate;
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
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sikho</h1>
          <p className="text-slate-600 mt-1">Your learning notes and insights</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sikho entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center ${
                showFilters || selectedCategory || dateFilter
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'created_at')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchTerm || selectedCategory ? 'No entries found matching your criteria.' : 'No sikho entries yet.'}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter the title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
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
                <RichTextEditor
                  value={formData.moment_of_memory}
                  onChange={(value) => setFormData({...formData, moment_of_memory: value})}
                  placeholder="How you learned or remembered this"
                  height="120px"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {editingItem ? 'Update' : 'Add'} Entry
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-200 text-slate-800 py-2.5 rounded-lg hover:bg-slate-300 transition-colors font-medium"
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