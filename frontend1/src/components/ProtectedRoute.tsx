import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // Check if user has required role if roles are specified
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role as UserRole)) {
    // Redirect to dashboard or show unauthorized
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
