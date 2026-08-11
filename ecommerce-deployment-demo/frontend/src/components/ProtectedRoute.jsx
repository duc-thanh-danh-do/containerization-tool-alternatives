
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token'); 
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;