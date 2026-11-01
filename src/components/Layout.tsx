import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, LibraryBig, BookMarked, Settings, Brain, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/vocabulary', label: 'Words', icon: Book },
  { path: '/sikho', label: 'Sikho', icon: LibraryBig },
  { path: '/books', label: 'Books', icon: BookMarked },
  { path: '/moments', label: 'Moments', icon: Brain },
  { path: '/admin', label: 'Admin', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#f3faf7]">
      {/* Desktop top bar */}
      <header className="hidden md:block bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold text-slate-900">English Sikho</span>
          </Link>
          <nav className="flex gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 pt-4 pb-28 md:pt-8 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-emerald-100 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center py-2.5 text-[11px] font-medium ${
                isActive(path) ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${isActive(path) ? 'stroke-[2.5]' : ''}`} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
