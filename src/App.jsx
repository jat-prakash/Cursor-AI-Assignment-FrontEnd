import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={token && role === 'admin' ? <AdminDashboard token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/customer"
          element={token && role === 'customer' ? <CustomerDashboard token={token} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
