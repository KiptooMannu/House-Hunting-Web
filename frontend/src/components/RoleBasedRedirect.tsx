import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface RoleBasedRedirectProps {
  userPath: string;
  landlordPath: string;
  adminPath?: string;
}

export default function RoleBasedRedirect({ userPath, landlordPath, adminPath = '/admin/overview' }: RoleBasedRedirectProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (user?.role === 'admin') return <Navigate to={adminPath} replace />;
  if (user?.role === 'landlord') return <Navigate to={landlordPath} replace />;
  return <Navigate to={userPath} replace />;
}
