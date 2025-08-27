import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { VocabularyPage } from './components/VocabularyPage';
import { SikhoPage } from './components/SikhoPage';
import { AdminPage } from './components/AdminPage';
import { SharedView } from './components/SharedView';
import { MomentsPage } from './components/MomentsPage';

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
          <Route path="/sikho" element={<SikhoPage />} />
          <Route path="/moments" element={<MomentsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/share/:encodedData" element={<SharedViewWrapper />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;