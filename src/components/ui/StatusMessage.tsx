import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type StatusTone = 'error' | 'success' | 'info' | 'warning';

interface StatusMessageProps {
  tone?: StatusTone;
  title: string;
  message?: string;
  code?: string;
  className?: string;
  onDismiss?: () => void;
}

const toneStyles: Record<StatusTone, { wrapper: string; icon: string; code: string; Icon: React.ElementType }> = {
  error: {
    wrapper: 'bg-red-500/10 border-red-500/30 text-red-100',
    icon: 'text-red-400',
    code: 'bg-red-500/10 text-red-200 border-red-500/20',
    Icon: AlertCircle,
  },
  success: {
    wrapper: 'bg-green-500/10 border-green-500/30 text-green-100',
    icon: 'text-green-400',
    code: 'bg-green-500/10 text-green-200 border-green-500/20',
    Icon: CheckCircle2,
  },
  info: {
    wrapper: 'bg-lemon-muted/10 border-lemon-muted/30 text-lemon-muted',
    icon: 'text-lemon-muted',
    code: 'bg-lemon-muted/10 text-lemon-muted border-lemon-muted/20',
    Icon: Info,
  },
  warning: {
    wrapper: 'bg-orange-500/10 border-orange-500/30 text-orange-100',
    icon: 'text-orange-300',
    code: 'bg-orange-500/10 text-orange-100 border-orange-500/20',
    Icon: AlertCircle,
  },
};

export function StatusMessage({
  tone = 'info',
  title,
  message,
  code,
  className,
  onDismiss,
}: StatusMessageProps) {
  const styles = toneStyles[tone];
  const Icon = styles.Icon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={cn('rounded-lg border p-4 flex items-start gap-3', styles.wrapper, className)}
    >
      <Icon size={20} className={cn('mt-0.5 shrink-0', styles.icon)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black">{title}</p>
        {message && <p className="mt-1 text-sm font-medium text-current/75 leading-relaxed">{message}</p>}
        {code && (
          <p className={cn('mt-3 inline-flex rounded border px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em]', styles.code)}>
            {code}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-current/50 hover:bg-white/10 hover:text-current transition-colors"
          aria-label="Dismiss message"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
