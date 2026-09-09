import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRole?: 'user' | 'admin' | 'super_admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border-subtle, #e2e8f0)',
          borderTopColor: 'var(--accent-primary, #2F7BFF)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' || requiredRole === 'super_admin') {
    const isAdmin = role === 'admin' || role === 'super_admin';
    if (!isAdmin) {
      return <Navigate to="/home" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
