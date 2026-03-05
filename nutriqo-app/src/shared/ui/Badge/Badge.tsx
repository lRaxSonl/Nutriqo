import React from 'react';

type BadgeVariant = 'success' | 'default' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => {
  const styles = {
    success: 'bg-green-100 text-green-800',
    default: 'bg-gray-100 text-gray-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};