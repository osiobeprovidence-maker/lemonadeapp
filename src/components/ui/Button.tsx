import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemon-muted disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-lemon-muted text-black hover:bg-lemon-muted/90": variant === 'primary',
            "bg-white text-black hover:bg-white/90": variant === 'secondary',
            "border border-white/20 bg-transparent hover:bg-white/10": variant === 'outline',
            "hover:bg-white/10": variant === 'ghost',
            "bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20": variant === 'glass',
            
            "h-9 px-4 text-xs": size === 'sm',
            "h-11 px-6 text-sm": size === 'md',
            "h-14 px-8 text-base font-semibold": size === 'lg',
            "h-11 w-11": size === 'icon',

            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"
