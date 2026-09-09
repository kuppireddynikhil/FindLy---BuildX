import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'lost' | 'found';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {children}
    </span>
  );
}
