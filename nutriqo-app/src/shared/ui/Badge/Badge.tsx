import React from 'react';

type BadgeVariant = 'success' | 'default' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => {
  const styles = {
    success: 'bg-success/20 text-success',
    default: 'bg-background text-foreground border border-border',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};