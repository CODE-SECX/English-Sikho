import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, TrendingUp, Calendar } from 'lucide-react';
import { useVocabulary, useSikho } from '../hooks/useSupabase';
import { format } from 'date-fns';

export function Dashboard() {
  const { vocabulary } = useVocabulary();
  const { sikho } = useSikho();

  const recentVocabulary = vocabulary.slice(0, 5);
  const recentSikho = sikho.slice(0, 5);

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
      title: 'This Week',
      value: vocabulary.filter(v => new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/vocabulary'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">Welcome to Your Learning Journey</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
          Track your English vocabulary and learning progress with organized notes and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60 hover:border-slate-300/60 group"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 group-hover:text-slate-700">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Recent Vocabulary
            </h2>
            <Link
              to="/vocabulary"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentVocabulary.length > 0 ? (
              recentVocabulary.map((word) => (
                <div key={word.id} className="border-l-4 border-blue-200 pl-3 sm:pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{word.word}</h3>
                    <span className="text-xs text-slate-500">
                      {format(new Date(word.date), 'MMM dd')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{word.meaning}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No vocabulary entries yet</p>
                <Link
                  to="/vocabulary"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add your first word →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-emerald-600" />
              Recent Sikho
            </h2>
            <Link
              to="/sikho"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentSikho.length > 0 ? (
              recentSikho.map((entry) => (
                <div key={entry.id} className="border-l-4 border-emerald-200 pl-3 sm:pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{entry.title}</h3>
                    <span className="text-xs text-slate-500">
                      {format(new Date(entry.date), 'MMM dd')}
                    </span>
                  </div>
                  {entry.category && (
                    <span 
                      className="inline-block px-2 py-1 text-xs rounded-full text-white mt-1"
                      style={{ backgroundColor: entry.category.color }}
                    >
                      {entry.category.name}
                    </span>
                  )}
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2">{entry.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No sikho entries yet</p>
                <Link
                  to="/sikho"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Add your first note →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}