import React from 'react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  inverted?: boolean;
  label?: string;
}

/** Shared neutral loading treatment: a quiet gray track with a crisp leading arc. */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 16,
  inverted = false,
  label,
  className = '',
  style,
  ...props
}) => (
  <span
    {...props}
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={`inline-block shrink-0 animate-spin rounded-full border-2 ${
      inverted
        ? 'border-white/25 border-r-white border-t-white'
        : 'border-hairline-strong border-r-ink border-t-ink'
    } ${className}`}
    style={{ width: size, height: size, ...style }}
  />
);
