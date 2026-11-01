import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { VocabularyPage } from './components/VocabularyPage';
import { SikhoPage } from './components/SikhoPage';
import { AdminPage } from './components/AdminPage';
import { SharedView } from './components/SharedView';
import { MomentsPage } from './components/MomentsPage';
import { BooksPage } from './components/BooksPage';
import { BookDetailPage } from './components/BookDetailPage';
import { EntryDetailPage } from './components/EntryDetailPage';

function SharedViewWrapper() {
  const { encodedData } = useParams<{ encodedData: string }>();
  return <SharedView encodedData={encodedData || ''} />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/vocabulary/:id" element={<EntryDetailPage type="vocabulary" />} />
          <Route path="/sikho" element={<SikhoPage />} />
          <Route path="/sikho/:id" element={<EntryDetailPage type="sikho" />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/moments" element={<MomentsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/share/:encodedData" element={<SharedViewWrapper />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;