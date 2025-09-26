import React from 'react';
import { cn } from '../../utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'full' | 'icon-only' | 'text-only';
}



export default function Logo({
  className,
  size = 'md',
  showText = true,
  variant = 'full'
}: LogoProps) {
  if (variant === 'text-only') {
    return (
      <div className={cn('flex items-center', className)}>
        <span className={cn(
          'font-extrabold text-curex-gray-900 dark:text-white tracking-tight',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
          size === 'xl' && 'text-4xl'
        )}>
          Cure<span className="text-curex-teal-500">X40</span>
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn(
        'font-extrabold text-curex-gray-900 dark:text-white leading-tight tracking-tight',
        size === 'sm' && 'text-lg',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-3xl',
        size === 'xl' && 'text-4xl'
      )}>
        Cure<span className="text-curex-teal-500">X40</span>
      </span>
      {showText && (
        <span className={cn(
          'text-curex-teal-600 dark:text-curex-teal-400 font-semibold leading-tight tracking-wide uppercase',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg'
        )}>
          Smart Pharmacy
        </span>
      )}
    </div>
  );
}
