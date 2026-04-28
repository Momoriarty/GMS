import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

// Import Layouts
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={
        <div className="flex bg-slate-50 min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-6">
              <Dashboard />
            </main>
          </div>
        </div>
      } />
      {/* Route cadangan jika URL ngaco */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
