import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface RoleBasedRedirectProps {
  userPath: string;
  landlordPath: string;
}

export default function RoleBasedRedirect({ userPath, landlordPath }: RoleBasedRedirectProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrLandlord = user?.role === 'landlord' || user?.role === 'admin';
  return <Navigate to={isAdminOrLandlord ? landlordPath : userPath} replace />;
}
