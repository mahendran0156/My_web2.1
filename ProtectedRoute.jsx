import { Navigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    // Redirect to login, save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verify token is valid (basic check)
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      throw new Error('Invalid session');
    }
    JSON.parse(user);
  } catch (err) {
    // Clear invalid data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
