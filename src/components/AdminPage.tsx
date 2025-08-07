import React, { useState } from 'react';
import { Settings, Tag, Plus, Edit2, Trash2, Palette } from 'lucide-react';
import { useCategories, useVocabulary, useSikho } from '../hooks/useSupabase';
import type { Category } from '../types';

export function AdminPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { vocabulary } = useVocabulary();
  const { sikho } = useSikho();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#059669'
  });

  const stats = [
    { label: 'Total Vocabulary', value: vocabulary.length, color: 'bg-blue-100 text-blue-800' },
    { label: 'Total Sikho Entries', value: sikho.length, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Categories', value: categories.length, color: 'bg-purple-100 text-purple-800' },
  ];

  const colorOptions = [
    '#059669', '#1e40af', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#be185d', '#374151'
  ];

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
      } else {
        await addCategory(categoryForm);
      }
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will remove the category from all associated entries.')) {
      await deleteCategory(id);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#059669'
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-slate-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600">Manage your learning data and system settings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
            <div className="text-center">
              <div className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium ${stat.color} mb-2`}>
                {stat.label}
              </div>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Management */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Tag className="h-6 w-6 mr-2 text-slate-600" />
            Category Management
          </h2>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>

        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-slate-600">{category.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No categories created yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name*</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
                  placeholder="Optional description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Palette className="h-4 w-4 mr-1" />
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryForm({...categoryForm, color})}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        categoryForm.color === color 
                          ? 'border-slate-400 scale-110' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
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