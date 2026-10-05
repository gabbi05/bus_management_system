import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (role && user.role !== role) {
    if (role === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />;
    if (role === 'customer' && user.role === 'admin') return <Navigate to="/admin" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
