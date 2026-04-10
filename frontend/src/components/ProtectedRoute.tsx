import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);

  console.log('🛡️ [ProtectedRoute] Verification:', { isAuth, role: (user as any)?.role, allowedRoles });

  if (!isAuth) {
    console.warn('🛡️ [ProtectedRoute] Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes((user as any)?.role)) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 1rem' }}>
        <h2 className="text-3xl font-bold text-primary mb-4 text-center">403 — Access Denied</h2>
        <p className="text-slate-400 text-center">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
