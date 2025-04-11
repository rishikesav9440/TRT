import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { FlowBuilder } from './pages/FlowBuilder';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flow/:categorySlug" element={<FlowBuilder />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;