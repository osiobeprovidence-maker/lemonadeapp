import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AppContext';

interface SensitiveActionWrapperProps {
  children: React.ReactElement;
  intent?: string;
  payload?: any;
  onClick?: (e: React.MouseEvent) => void;
  key?: React.Key;
}

export function SensitiveActionWrapper({ children, intent = 'continue', payload, onClick }: SensitiveActionWrapperProps) {
  const { isGuest, isAuthenticated, setPendingAction } = useAuth();
  const navigate = useNavigate();

  const handleIntercept = (e: React.MouseEvent) => {
    if (isGuest || !isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      
      setPendingAction(intent, payload);
      navigate(`/auth?mode=signup&intent=${encodeURIComponent(intent)}`);
      return;
    }

    if (onClick) {
      onClick(e);
    } else if (children.props.onClick) {
      children.props.onClick(e);
    }
  };

  return React.cloneElement(children, {
    onClick: handleIntercept,
  });
}
