import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useVocabulary, useSikho } from '../hooks/useSupabase';
import { RichTextEditor } from './RichTextEditor';

export function MomentsPage() {
  const { vocabulary, updateVocabulary } = useVocabulary();
  const { sikho, updateSikho } = useSikho();
  const [showForm, setShowForm] = useState(false);
  const [editingMoment, setEditingMoment] = useState<{old: string, new: string} | null>(null);
  const [newMoment, setNewMoment] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Get unique moments from both vocabulary and sikho
  // Get all languages
  const languages = [...new Set([
    ...vocabulary.map(v => v.language),
    ...sikho.map(s => s.language)
  ])].sort();

  // Group moments by language and type
  const groupedMoments = languages.reduce((acc, language) => {
    const languageVocab = vocabulary
      .filter(v => v.language === language && v.moment_of_memory)
      .map(v => v.moment_of_memory);
    const languageSikho = sikho
      .filter(s => s.language === language && s.moment_of_memory)
      .map(s => s.moment_of_memory);

    if (languageVocab.length || languageSikho.length) {
      acc[language] = {
        vocabulary: [...new Set(languageVocab)],
        sikho: [...new Set(languageSikho)]
      };
    }
    return acc;
  }, {} as Record<string, { vocabulary: string[], sikho: string[] }>);



  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleEdit = (moment: string) => {
    setEditingMoment({ old: moment, new: moment });
    setShowForm(true);
  };

  const handleDelete = async (moment: string) => {
    if (!window.confirm('Are you sure you want to delete this moment? This will remove it from all vocabulary and sikho entries.')) {
      return;
    }

    // Update all vocabulary items with this moment
    const vocabPromises = vocabulary
      .filter(v => v.moment_of_memory === moment)
      .map(v => updateVocabulary(v.id, { ...v, moment_of_memory: '' }));

    // Update all sikho items with this moment
    const sikhoPromises = sikho
      .filter(s => s.moment_of_memory === moment)
      .map(s => updateSikho(s.id, { ...s, moment_of_memory: '' }));

    await Promise.all([...vocabPromises, ...sikhoPromises]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMoment) {
      // Update all vocabulary items with this moment
      const vocabPromises = vocabulary
        .filter(v => v.moment_of_memory === editingMoment.old)
        .map(v => updateVocabulary(v.id, { ...v, moment_of_memory: editingMoment.new }));

      // Update all sikho items with this moment
      const sikhoPromises = sikho
        .filter(s => s.moment_of_memory === editingMoment.old)
        .map(s => updateSikho(s.id, { ...s, moment_of_memory: editingMoment.new }));

      await Promise.all([...vocabPromises, ...sikhoPromises]);
    }

    setEditingMoment(null);
    setNewMoment('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Moments of Memory</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Manage your memory techniques and contexts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Moment
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60">
        {selectedLanguage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{selectedLanguage}</h2>
              <button
                onClick={() => setSelectedLanguage(null)}
                className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back to Languages
              </button>
            </div>
            
            {groupedMoments[selectedLanguage]?.vocabulary.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800 ml-2">Vocabulary Moments</h3>
                <div className="grid grid-cols-1 gap-3 ml-4">
                  {groupedMoments[selectedLanguage].vocabulary.map((moment) => (
                    <div
                      key={moment}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-slate-900" dangerouslySetInnerHTML={{ __html: moment }} />
                        <p className="text-sm text-slate-500 mt-1">
                          Used in {vocabulary.filter(v => v.language === selectedLanguage && v.moment_of_memory === moment).length} vocabulary entries
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(moment)}
                          className="p-2 text-slate-600 hover:text-purple-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(moment)}
                          className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {groupedMoments[selectedLanguage]?.sikho.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800 ml-2">Sikho Moments</h3>
                <div className="grid grid-cols-1 gap-3 ml-4">
                  {groupedMoments[selectedLanguage].sikho.map((moment) => (
                    <div
                      key={moment}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-slate-900" dangerouslySetInnerHTML={{ __html: moment }} />
                        <p className="text-sm text-slate-500 mt-1">
                          Used in {sikho.filter(s => s.language === selectedLanguage && s.moment_of_memory === moment).length} sikho entries
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(moment)}
                          className="p-2 text-slate-600 hover:text-purple-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(moment)}
                          className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(groupedMoments).map(([language, { vocabulary, sikho }]) => (
              <div
                key={language}
                onClick={() => setSelectedLanguage(language)}
                className="p-6 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">{language}</h2>
                <div className="space-y-3">
                  {vocabulary.length > 0 && (
                    <p className="text-slate-600">
                      <span className="font-medium">{vocabulary.length}</span> Vocabulary moments
                    </p>
                  )}
                  {sikho.length > 0 && (
                    <p className="text-slate-600">
                      <span className="font-medium">{sikho.length}</span> Sikho moments
                    </p>
                  )}
                </div>
              </div>
            ))}

            {Object.keys(groupedMoments).length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No moments of memory found. Add your first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingMoment ? 'Edit Moment' : 'Add New Moment'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingMoment(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Moment of Memory
                </label>
                <RichTextEditor
                  value={editingMoment ? editingMoment.new : newMoment}
                  onChange={(value) => {
                    if (editingMoment) {
                      setEditingMoment({ ...editingMoment, new: value });
                    } else {
                      setNewMoment(value);
                    }
                  }}
                  placeholder="Enter the moment of memory"
                  height="120px"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingMoment ? 'Update' : 'Add'} Moment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMoment(null);
                  }}
                  className="flex-1 bg-slate-200 text-slate-800 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors"
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