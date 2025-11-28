// client/src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import Register from "./pages/Register";

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

       <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
