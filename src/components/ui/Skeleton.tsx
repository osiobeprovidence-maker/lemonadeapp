import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-white/10', className)}
      {...props}
    />
  );
}

export function StoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function HorizontalStoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-3', className)}>
      <Skeleton className="h-20 w-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <section className="relative min-h-[66svh] max-h-[75svh] md:min-h-[72vh] overflow-hidden">
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-[#0A0A0A]" />
      <div className="relative z-10 flex min-h-[66svh] max-h-[75svh] flex-col justify-end px-4 pb-5 pt-8 md:min-h-[72vh] md:px-8 md:pb-10">
        <div className="max-w-xl space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-48 sm:h-14 sm:w-64 md:h-16 md:w-80" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
          <div className="flex gap-2.5">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AppSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black-core">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16 flex justify-center items-center">
          <div className="absolute inset-0 border-2 border-lemon-muted/50 rounded-[20%] animate-spin" style={{ animationDuration: '3s' }} />
          <div className="w-6 h-6 bg-lemon-muted/50 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="font-display font-black text-2xl tracking-tighter text-white/50">
            OWUUU
          </h1>
          <p className="text-xs font-medium tracking-widest uppercase text-white/30">
            Loading your stories...
          </p>
        </div>
      </div>
    </div>
  );
}
