import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children?: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
<<<<<<< HEAD
  const { isAuthenticated, loading, role } = useAuth();
=======
  const { isAuthenticated, loading } = useAuth();
>>>>>>> origin/main

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} className="animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
<<<<<<< HEAD
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
=======
    return <Navigate to="/" replace />;
>>>>>>> origin/main
  }

  return children ? <>{children}</> : <Outlet />;
}
