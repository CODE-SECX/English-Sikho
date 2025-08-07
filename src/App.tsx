import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { VocabularyPage } from './components/VocabularyPage';
import { SikhoPage } from './components/SikhoPage';
import { AdminPage } from './components/AdminPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/sikho" element={<SikhoPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;