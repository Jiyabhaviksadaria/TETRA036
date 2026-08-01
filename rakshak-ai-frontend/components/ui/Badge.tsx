import React from 'react';

interface BadgeProps {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'online' | 'offline';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'medium',
  children,
  className = '',
}) => {
  const styles = {
    critical: 'bg-red-50 text-rakshak-danger border-red-200',
    high: 'bg-amber-50 text-rakshak-warning border-amber-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    online: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    offline: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
