import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface StudioAccessGuardProps {
  children: ReactNode;
}

export default function StudioAccessGuard({ children }: StudioAccessGuardProps) {
  const { user, isGuest } = useApp();
  const location = useLocation();

  if (isGuest) {
    return <Navigate to={`/auth?mode=signup&intent=studio&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  switch (user?.creatorAccessStatus) {
    case 'approved':
      return <>{children}</>;
    case 'pending':
    case 'rejected':
      return <Navigate to="/creator-application/status" replace />;
    case 'none':
    default:
      return <Navigate to="/creator-application" replace />;
  }
}
