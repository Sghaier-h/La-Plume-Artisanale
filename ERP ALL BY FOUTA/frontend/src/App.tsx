import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FoutaManagementApp from './pages/FoutaManagement';
import DashboardTisseur from './pages/DashboardTisseur';
import DashboardMagasinierMP from './pages/DashboardMagasinierMP';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<FoutaManagementApp />} />
          <Route path="/tisseur" element={<DashboardTisseur />} />
          <Route path="/magasinier-mp" element={<DashboardMagasinierMP />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

