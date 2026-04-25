import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, show the page
  return children;
}

export default ProtectedRoute;
