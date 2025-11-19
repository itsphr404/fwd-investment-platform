import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const nav = useNavigate();

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore network errors for logout
    }
    // redirect to login
    nav('/login');
  }

  return (
    <button onClick={logout} className="px-3 py-2 rounded bg-red-500 text-white">
      Logout
    </button>
  );
}
