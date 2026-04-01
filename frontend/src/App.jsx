import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/auth/AuthLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes wrapped in the Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Placeholder for future Dashboard route */}
        <Route path="/dashboard" element={<div>Dashboard Placeholder (Protected)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;