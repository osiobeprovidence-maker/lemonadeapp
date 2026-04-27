import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

interface AdminRouteGuardProps {
  children: ReactNode;
  superAdminOnly?: boolean;
}

export default function AdminRouteGuard({ children, superAdminOnly = false }: AdminRouteGuardProps) {
  const { adminSession } = useApp();
  const location = useLocation();

  if (!adminSession || !adminSession.isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (superAdminOnly && adminSession.role !== 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
