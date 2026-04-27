import React from 'react';
import { UserPlus, UserCheck, ExternalLink, Coffee } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Creator } from '../data/mock';
import { SensitiveActionWrapper } from './SensitiveActionWrapper';
import { useApp } from '../contexts/AppContext';

interface FollowButtonProps {
  creator: Creator;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FollowButton({ creator, className, size = 'md' }: FollowButtonProps) {
  const { user, followCreator, unfollowCreator } = useApp();
  const isFollowed = user?.followedCreators.includes(creator.username);

  const toggleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowed) {
      unfollowCreator(creator.username);
    } else {
      followCreator(creator.username);
    }
  };

  return (
    <SensitiveActionWrapper intent="follow" payload={{ username: creator.username }} onClick={toggleFollow}>
      <Button
        variant={isFollowed ? 'outline' : 'primary'}
        size={size}
        className={cn(
          "transition-all duration-300",
          isFollowed ? "border-white/20 text-white/70 hover:text-white" : "shadow-lg shadow-lemon-muted/20",
          className
        )}
      >
        {isFollowed ? (
          <>
            <UserCheck size={size === 'sm' ? 14 : 18} className="mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus size={size === 'sm' ? 14 : 18} className="mr-2" />
            Follow
          </>
        )}
      </Button>
    </SensitiveActionWrapper>
  );
}

interface SupportButtonProps {
  creator: Creator;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showLabel?: boolean;
}

export function SupportButton({ creator, className, size = 'md', fullWidth = false, showLabel = true }: SupportButtonProps) {
  const { supportCreator } = useApp();
  const handleSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (creator.supportEnabled && creator.dropsomethingUrl) {
      supportCreator(creator.username, 10);
      window.open(`https://dropsomething.sbs/${creator.dropsomethingUrl}`, '_blank');
    }
  };

  if (!creator.supportEnabled) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        fullWidth={fullWidth}
        className={cn("opacity-50 cursor-not-allowed", className)}
      >
        <Coffee size={size === 'sm' ? 14 : 18} className={cn(showLabel && "mr-2")} />
        {showLabel && "Support Disabled"}
      </Button>
    );
  }

  return (
    <SensitiveActionWrapper intent="support" onClick={handleSupport}>
      <Button
        variant="primary"
        size={size}
        fullWidth={fullWidth}
        className={cn(
          "bg-lemon-muted text-black hover:bg-lemon-muted/90 font-black uppercase tracking-wider shadow-xl shadow-lemon-muted/10",
          className
        )}
      >
        <Coffee size={size === 'sm' ? 14 : 18} className={cn(showLabel && "mr-2")} />
        {showLabel && "Support Creator"}
        {showLabel && <ExternalLink size={12} className="ml-2 opacity-50" />}
      </Button>
    </SensitiveActionWrapper>
  );
}
