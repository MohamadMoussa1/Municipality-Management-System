import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { role,loading } = useAuth();
   if (loading) return <div>Loading...</div>;
  // if (role == null) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};
