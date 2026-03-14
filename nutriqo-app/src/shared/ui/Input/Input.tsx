import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-2 border rounded-md outline-none transition-colors
            bg-background text-foreground placeholder-foreground-secondary
            ${error 
              ? 'border-destructive focus:ring-2 focus:ring-destructive/20' 
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';