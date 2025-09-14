import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, TrendingUp, Globe, Heart, Star } from 'lucide-react';
import { useVocabulary, useSikho } from '../hooks/useSupabase';
import { format } from 'date-fns';

export function Dashboard() {
  const { vocabulary } = useVocabulary();
  const { sikho } = useSikho();
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
  const [showMomentsList, setShowMomentsList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const recentVocabulary = vocabulary.slice(0, 5);
  const recentSikho = sikho.slice(0, 5);

  // Get unique languages from both vocabulary and sikho
  const vocabularyLanguages = [...new Set(vocabulary.map(v => v.language).filter(Boolean))];
  const sikhoLanguages = [...new Set(sikho.map(s => s.language).filter(Boolean))];
  const allLanguages = [...new Set([...vocabularyLanguages, ...sikhoLanguages])];

  // Get unique moments of memory from both vocabulary and sikho
  const vocabularyMoments = [...new Set(vocabulary.map(v => v.moment_of_memory).filter(Boolean))];
  const sikhoMoments = [...new Set(sikho.map(s => s.moment_of_memory).filter(Boolean))];
  const allMoments = [...new Set([...vocabularyMoments, ...sikhoMoments])];
  
  // Filter moments based on search term
  const filteredMoments = searchTerm 
    ? allMoments.filter(moment => 
        stripHtml(moment.toLowerCase()).includes(searchTerm.toLowerCase())
      )
    : allMoments;

  // Get entries for a specific moment
  const getEntriesForMoment = (moment: string) => {
    const vocabEntries = vocabulary.filter(v => v.moment_of_memory === moment);
    const sikhoEntries = sikho.filter(s => s.moment_of_memory === moment);
    return [...vocabEntries, ...sikhoEntries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Moment colors for cards
  const momentColors = [
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-blue-500 to-cyan-500',
    'bg-gradient-to-r from-green-500 to-emerald-500',
    'bg-gradient-to-r from-orange-500 to-red-500',
    'bg-gradient-to-r from-indigo-500 to-purple-500',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-cyan-500 to-blue-500',
    'bg-gradient-to-r from-emerald-500 to-green-500'
  ];

  // Language colors for cards
  const languageColors = [
    'bg-blue-500',
    'bg-emerald-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500'
  ];

  const stats = [
    {
      title: 'Total Vocabulary',
      value: vocabulary.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/vocabulary'
    },
    {
      title: 'Sikho Entries',
      value: sikho.length,
      icon: Brain,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      link: '/sikho'
    },
    {
      title: 'Memory Moments',
      value: allMoments.length,
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '#moments'
    },
    {
      title: 'This Week',
      value: vocabulary.filter(v => new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/vocabulary'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Star className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-4">
            Your Learning Journey
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4 leading-relaxed">
            Track your English vocabulary and learning progress with organized notes and cherished memories.
          </p>
        </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-white/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center">
                <div className={`${stat.bgColor} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Moments of Memory Section */}
      {allMoments.length > 0 && (
        <div id="moments" className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div 
            className="flex items-center justify-between mb-8 cursor-pointer hover:bg-purple-50/50 -mx-2 px-2 py-2 rounded-2xl transition-all duration-300"
            onClick={() => setShowMomentsList(!showMomentsList)}
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg mr-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Moments of Memory</h2>
                <p className="text-slate-600 mt-1">Your cherished learning moments</p>
              </div>
            </div>
            <div className="text-right flex items-center">
              <div className="mr-4">
                <div className="text-2xl font-bold text-purple-600">{allMoments.length}</div>
                <div className="text-sm text-slate-500">unique moments</div>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${showMomentsList ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                <Heart className={`h-4 w-4 transition-transform duration-300 ${showMomentsList ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
          
          {/* Search and List - Only show when expanded */}
          {showMomentsList && (
            <div className="animate-fadeIn">
              {/* Search Filter */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search moments..."
                    className="w-full px-4 py-3 pl-12 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-slate-900 placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Heart className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                </div>
              </div>
              
              {/* Index Format */}
              <div className="space-y-3">
                {filteredMoments.length > 0 ? (
                  filteredMoments.map((moment, index) => {
                    const entries = getEntriesForMoment(moment);
                    const vocabCount = vocabulary.filter(v => v.moment_of_memory === moment).length;
                    const sikhoCount = sikho.filter(s => s.moment_of_memory === moment).length;
                    const colorClass = momentColors[index % momentColors.length];
                    
                    return (
                      <div key={moment} className="group">
                        <div 
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${selectedMoment === moment ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200' : 'bg-white/60 hover:bg-white/80 border border-transparent'}`}
                          onClick={() => setSelectedMoment(selectedMoment === moment ? null : moment)}
                        >
                          <div className="flex items-center flex-1">
                            <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} mr-4`}></div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                                {stripHtml(moment)}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                                <span className="flex items-center">
                                  <BookOpen className="h-3 w-3 mr-1 text-blue-500" />
                                  {vocabCount} vocabulary
                                </span>
                                <span className="flex items-center">
                                  <Brain className="h-3 w-3 mr-1 text-emerald-500" />
                                  {sikhoCount} sikho
                                </span>
                                <span className="text-slate-500">
                                  {entries.length} total
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-slate-500 mr-2">
                              {selectedMoment === moment ? '▲ Hide' : '▼ Show'}
                            </span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${selectedMoment === moment ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                              <Heart className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Selected Moment Details */}
                        {selectedMoment === moment && (
                          <div className="mt-3 ml-7 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                <Heart className="h-5 w-5 mr-2 text-purple-600" />
                                {stripHtml(moment)}
                              </h3>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMoment(null);
                                }}
                                className="text-purple-600 hover:text-purple-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors"
                              >
                                Close ×
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                                  <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                                  Vocabulary Entries ({vocabCount})
                                </h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {vocabCount > 0 ? (
                                    vocabulary
                                      .filter(v => v.moment_of_memory === moment)
                                      .map((word) => (
                                        <div key={word.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200 hover:border-blue-300 transition-colors">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-semibold text-slate-900">{word.word}</h5>
                                            <span className="text-xs text-slate-500 bg-white/80 px-2 py-1 rounded-full">
                                              {format(new Date(word.date), 'MMM dd, yyyy')}
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-600 line-clamp-2">{stripHtml(word.meaning)}</p>
                                        </div>
                                      ))
                                  ) : (
                                    <div className="text-center py-6 text-slate-500 bg-white/50 rounded-xl">
                                      No vocabulary entries for this moment
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                                  <Brain className="h-4 w-4 mr-2 text-emerald-600" />
                                  Sikho Entries ({sikhoCount})
                                </h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {sikhoCount > 0 ? (
                                    sikho
                                      .filter(s => s.moment_of_memory === moment)
                                      .map((entry) => (
                                        <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-200 hover:border-emerald-300 transition-colors">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-semibold text-slate-900">{entry.title}</h5>
                                            <span className="text-xs text-slate-500 bg-white/80 px-2 py-1 rounded-full">
                                              {format(new Date(entry.date), 'MMM dd, yyyy')}
                                            </span>
                                          </div>
                                          {entry.category && entry.category.name && (
                                            <span 
                                              className="inline-block px-2 py-1 text-xs rounded-full text-white mb-2 shadow-sm"
                                              style={{ backgroundColor: entry.category.color || '#6B7280' }}
                                            >
                                              {entry.category.name}
                                            </span>
                                          )}
                                          <p className="text-sm text-slate-600 line-clamp-2">{stripHtml(entry.description)}</p>
                                        </div>
                                      ))
                                  ) : (
                                    <div className="text-center py-6 text-slate-500 bg-white/50 rounded-xl">
                                      No sikho entries for this moment
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Heart className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No moments found</p>
                    <p className="text-sm">Try adjusting your search term</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Language Cards Section */}
      {allLanguages.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg mr-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Languages</h2>
                <p className="text-slate-600 mt-1">Diverse learning journey</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{allLanguages.length}</div>
              <div className="text-sm text-slate-500">languages</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allLanguages.map((language, index) => {
              const vocabularyCount = vocabulary.filter(v => v.language === language).length;
              const sikhoCount = sikho.filter(s => s.language === language).length;
              const totalCount = vocabularyCount + sikhoCount;
              const colorClass = languageColors[index % languageColors.length];
              
              return (
                <div key={language} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <div className={`absolute inset-0 ${colorClass} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative z-10 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Globe className="h-5 w-5 opacity-80" />
                      <div className="text-xs opacity-60">{totalCount} entries</div>
                    </div>
                    <h3 className="font-bold text-lg mb-4 truncate group-hover:text-white transition-colors">{language}</h3>
                    <div className="space-y-2">
                      <Link
                        to={`/vocabulary?language=${encodeURIComponent(language)}`}
                        className="block text-sm opacity-90 hover:opacity-100 hover:underline transition-all"
                      >
                        📚 {vocabularyCount} vocabulary →
                      </Link>
                      <Link
                        to={`/sikho?language=${encodeURIComponent(language)}`}
                        className="block text-sm opacity-90 hover:opacity-100 hover:underline transition-all"
                      >
                        🧠 {sikhoCount} sikho →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg mr-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Recent Vocabulary</h2>
                <p className="text-slate-600 mt-1">Latest words added</p>
              </div>
            </div>
            <Link
              to="/vocabulary"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center group"
            >
              View all 
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentVocabulary.length > 0 ? (
              recentVocabulary.map((word) => (
                <div key={word.id} className="group bg-gradient-to-r from-blue-50/50 to-transparent rounded-2xl p-4 border-l-4 border-blue-400 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">{word.word}</h3>
                    <span className="text-xs text-slate-500 bg-white/70 px-2 py-1 rounded-full">
                      {format(new Date(word.date), 'MMM dd')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 group-hover:text-slate-700 transition-colors">{stripHtml(word.meaning)}</p>
                  {word.moment_of_memory && (
                    <div className="mt-2 flex items-center text-xs text-purple-600">
                      <Heart className="h-3 w-3 mr-1" />
                      {stripHtml(word.moment_of_memory)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-slate-500 mb-4">No vocabulary entries yet</p>
                <Link
                  to="/vocabulary"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                >
                  Add your first word →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg mr-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Recent Sikho</h2>
                <p className="text-slate-600 mt-1">Latest learning notes</p>
              </div>
            </div>
            <Link
              to="/sikho"
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center group"
            >
              View all 
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentSikho.length > 0 ? (
              recentSikho.map((entry) => (
                <div key={entry.id} className="group bg-gradient-to-r from-emerald-50/50 to-transparent rounded-2xl p-4 border-l-4 border-emerald-400 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">{entry.title}</h3>
                    <span className="text-xs text-slate-500 bg-white/70 px-2 py-1 rounded-full">
                      {format(new Date(entry.date), 'MMM dd')}
                    </span>
                  </div>
                  {entry.category && entry.category.name && (
                    <span 
                      className="inline-block px-3 py-1 text-xs rounded-full text-white mb-2 shadow-sm"
                      style={{ backgroundColor: entry.category.color || '#6B7280' }}
                    >
                      {entry.category.name}
                    </span>
                  )}
                  <p className="text-sm text-slate-600 line-clamp-2 group-hover:text-slate-700 transition-colors">{stripHtml(entry.description)}</p>
                  {entry.moment_of_memory && (
                    <div className="mt-2 flex items-center text-xs text-purple-600">
                      <Heart className="h-3 w-3 mr-1" />
                      {stripHtml(entry.moment_of_memory)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-slate-500 mb-4">No sikho entries yet</p>
                <Link
                  to="/sikho"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-sm font-medium"
                >
                  Add your first note →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}