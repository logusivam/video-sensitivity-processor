import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/auth/AuthLayout';
import { Register } from './pages/auth/Register';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* The AuthLayout provides the background, logo, and white box */}
        <Route element={<AuthLayout />}>
          {/* The Register page is injected inside the white box */}
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Redirect any unknown route to register for now */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;